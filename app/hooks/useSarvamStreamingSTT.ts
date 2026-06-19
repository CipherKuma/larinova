"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PCM_WORKLET_SOURCE } from "@/lib/stt/pcm-worklet-source";

interface UseSarvamStreamingSTTOptions {
  // Omit for onboarding sessions — token is issued under "onboarding" purpose
  // when consultationId is not provided.
  consultationId?: string;
  languageCode?: string;
  mode?: "transcribe" | "translate" | "verbatim" | "translit" | "codemix";
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onUnexpectedStop?: (reason: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

interface StreamingSTTState {
  isRecording: boolean;
  isConnecting: boolean;
  transcript: string;
  interimText: string;
  duration: number;
  error: string | null;
  permissionDenied: boolean;
  speaking: boolean;
}

const TARGET_SAMPLE_RATE = 16000;
const FRAME_MS = 100;
// How often to send a no-op keepalive frame to stop idle proxies / Sarvam from
// closing the socket. Cloud proxies typically idle out at 60-120s; 20s is a
// safe margin. The proxy ignores unknown control frames, but any traffic on
// the wire resets the idle timer.
const KEEPALIVE_INTERVAL_MS = 20000;
// Auto-reconnect tuning for unexpected socket drops mid-recording. We retry a
// few times with backoff before surfacing a hard error to the consumer.
const MAX_RECONNECT_ATTEMPTS = 4;
const RECONNECT_BASE_DELAY_MS = 800;

// Convert ArrayBuffer of Int16 PCM to base64 without spawning a giant
// intermediate string. Browser-only.
function pcmToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export function useSarvamStreamingSTT(opts: UseSarvamStreamingSTTOptions) {
  const {
    consultationId,
    languageCode = "unknown",
    mode = "codemix",
    onTranscript,
    onError,
    onUnexpectedStop,
    onSpeechStart,
    onSpeechEnd,
  } = opts;

  const [state, setState] = useState<StreamingSTTState>({
    isRecording: false,
    isConnecting: false,
    transcript: "",
    interimText: "",
    duration: 0,
    error: null,
    permissionDenied: false,
    speaking: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const transcriptRef = useRef<string>("");
  // Mirrors detected language from server `language_code` field. Compatible
  // with the older useSarvamSTT hook so consumers can read the same ref.
  const detectedLanguageRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intentionalStopRef = useRef(false);
  const activeSessionRef = useRef(false);
  const mountedRef = useRef(true);
  const waitForTranscriptResolversRef = useRef<Array<() => void>>([]);
  // Keepalive + reconnect machinery. The keepalive timer pings the open socket;
  // the reconnect state lets us silently re-establish the WS without resetting
  // the accumulated transcript or tearing down the live MediaStream.
  const keepaliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectingRef = useRef(false);
  // After a reconnect, if the new socket survives this long we treat the link
  // as healthy again and reset the attempt budget so a later, unrelated drop
  // still gets its own full set of retries.
  const stabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tuning params captured at start() so a reconnect can rebuild the socket
  // with identical settings (the proxy token is single-use-ish but valid for
  // 30min, so it is safe to reuse across reconnects within a session).
  const sessionTokenRef = useRef<string | null>(null);
  const sessionWsUrlRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cleanup = useCallback(() => {
    intentionalStopRef.current = true;
    activeSessionRef.current = false;
    reconnectingRef.current = false;
    reconnectAttemptsRef.current = 0;

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (keepaliveTimerRef.current) {
      clearInterval(keepaliveTimerRef.current);
      keepaliveTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }
    try {
      workletNodeRef.current?.disconnect();
    } catch {
      // ignore
    }
    workletNodeRef.current = null;
    try {
      sourceNodeRef.current?.disconnect();
    } catch {
      // ignore
    }
    sourceNodeRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (wsRef.current && wsRef.current.readyState <= 1) {
      try {
        wsRef.current.close(1000, "client done");
      } catch {
        // ignore
      }
    }
    wsRef.current = null;
  }, []);

  // Tear down ONLY the WebSocket + audio worklet/source/context, leaving the
  // mic MediaStream (streamRef) and accumulated transcript (transcriptRef)
  // intact. Used between reconnect attempts so the consumer's parallel
  // full-audio recorder (which holds streamRef) keeps running uninterrupted.
  const teardownAudioAndSocket = useCallback(() => {
    if (keepaliveTimerRef.current) {
      clearInterval(keepaliveTimerRef.current);
      keepaliveTimerRef.current = null;
    }
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }
    try {
      workletNodeRef.current?.disconnect();
    } catch {
      // ignore
    }
    workletNodeRef.current = null;
    try {
      sourceNodeRef.current?.disconnect();
    } catch {
      // ignore
    }
    sourceNodeRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && ws.readyState <= 1) {
      try {
        ws.close(1000, "reconnecting");
      } catch {
        // ignore
      }
    }
  }, []);

  // Mutually-recursive connect/reconnect functions are stored in refs so the
  // socket "close" handler can reach the latest reconnect logic without a
  // stale closure, and reconnect can reach connect — all while keeping the
  // start() useCallback dependency list stable.
  const connectAndPipeRef = useRef<
    ((stream: MediaStream, isReconnect: boolean) => Promise<void>) | null
  >(null);
  const attemptReconnectRef = useRef<(() => void) | null>(null);

  const reportUnexpectedStop = useCallback(
    (reason: string) => {
      if (intentionalStopRef.current || !activeSessionRef.current) return;
      activeSessionRef.current = false;

      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }

      if (mountedRef.current) {
        setState((s) => ({
          ...s,
          isRecording: false,
          isConnecting: false,
          interimText: "",
          speaking: false,
          error: reason,
        }));
      }
      onError?.(reason);
      onUnexpectedStop?.(reason);
      cleanup();
    },
    [cleanup, onError, onUnexpectedStop],
  );

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handleServerMessage = useCallback(
    (raw: string) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      // Sarvam wraps events both as flat { type: "transcript", text }
      // and as nested { type: "data", data: { transcript, ... } }.
      // Handle both.
      const type = msg.type as string | undefined;
      const data = (msg.data as Record<string, unknown> | undefined) || msg;

      if (type === "speech_start" || data?.signal_type === "START_SPEECH") {
        if (mountedRef.current) {
          setState((s) => ({ ...s, speaking: true }));
        }
        onSpeechStart?.();
        return;
      }
      if (type === "speech_end" || data?.signal_type === "END_SPEECH") {
        if (mountedRef.current) {
          setState((s) => ({ ...s, speaking: false }));
        }
        onSpeechEnd?.();
        return;
      }

      const text =
        (msg.text as string | undefined) ||
        (msg.transcript as string | undefined) ||
        (data?.text as string | undefined) ||
        (data?.transcript as string | undefined);
      if (!text) return;

      if (type === "transcript" || type === "data") {
        const trimmed = text.trim();
        if (!trimmed) return;
        transcriptRef.current = transcriptRef.current
          ? `${transcriptRef.current} ${trimmed}`
          : trimmed;
        const lang =
          (msg.language_code as string | undefined) ||
          (data?.language_code as string | undefined);
        if (lang) detectedLanguageRef.current = lang;
        if (mountedRef.current) {
          setState((s) => ({
            ...s,
            transcript: transcriptRef.current,
            interimText: "",
          }));
        }
        onTranscript?.(trimmed, true);
        waitForTranscriptResolversRef.current.forEach((resolve) => resolve());
        waitForTranscriptResolversRef.current = [];
        return;
      }

      if (type === "interim" || type === "partial") {
        if (mountedRef.current) {
          setState((s) => ({ ...s, interimText: text }));
        }
        onTranscript?.(text, false);
      }
    },
    [onTranscript, onSpeechStart, onSpeechEnd],
  );

  const start = useCallback(async () => {
    if (state.isRecording || state.isConnecting) return false;

    intentionalStopRef.current = false;
    activeSessionRef.current = true;

    setState((s) => ({
      ...s,
      error: null,
      permissionDenied: false,
      isConnecting: true,
      transcript: "",
      interimText: "",
      duration: 0,
      speaking: false,
    }));
    transcriptRef.current = "";

    try {
      // 1. Get the proxy URL + JWT from the server. consultationId is omitted
      // for onboarding sessions; the server treats that as purpose=onboarding.
      const tokenRes = await fetch("/api/consultation/stt-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultationId ? { consultationId } : {}),
      });
      if (!tokenRes.ok) {
        const errBody = await tokenRes.json().catch(() => ({}));
        throw new Error(errBody?.error || "Failed to get STT token");
      }
      const { token, wsUrl } = (await tokenRes.json()) as {
        token: string;
        wsUrl: string;
      };
      // Remember token/url so a mid-session reconnect can rebuild the socket
      // with the same credentials (token TTL is 30min, far longer than a visit).
      sessionTokenRef.current = token;
      sessionWsUrlRef.current = wsUrl;

      // 2. Get mic
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      stream.getAudioTracks().forEach((track) => {
        track.addEventListener(
          "ended",
          () => {
            reportUnexpectedStop(
              "Microphone input stopped unexpectedly. Please restart recording before continuing.",
            );
          },
          { once: true },
        );
      });

      // 3 + 4. Open the WebSocket and wire up the audio pipeline. Extracted so
      // an unexpected-close reconnect can reuse the exact same setup.
      await connectAndPipeRef.current!(stream, false);

      reconnectAttemptsRef.current = 0;
      startTimeRef.current = Date.now();
      durationTimerRef.current = setInterval(() => {
        if (mountedRef.current) {
          setState((s) => ({
            ...s,
            duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
          }));
        }
      }, 500);

      if (mountedRef.current) {
        setState((s) => ({
          ...s,
          isRecording: true,
          isConnecting: false,
        }));
      }
      return true;
    } catch (err: unknown) {
      intentionalStopRef.current = true;
      activeSessionRef.current = false;
      cleanup();
      const error = err as Error;
      const isPermission =
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError";
      if (mountedRef.current) {
        setState((s) => ({
          ...s,
          permissionDenied: isPermission,
          error: isPermission
            ? "Microphone access denied"
            : error.message || "Failed to start recording",
          isConnecting: false,
          isRecording: false,
        }));
      }
      onError?.(error.message || "Failed to start streaming STT");
      return false;
    }
  }, [
    consultationId,
    cleanup,
    onError,
    reportUnexpectedStop,
    state.isRecording,
    state.isConnecting,
  ]);

  // Keep the connect/reconnect closures fresh on every render so they capture
  // the latest languageCode/mode/handlers. Stored in refs (set above) so the
  // socket close handler and start() can call them without dependency churn.
  useEffect(() => {
    const connectAndPipe = async (stream: MediaStream, isReconnect: boolean) => {
      const token = sessionTokenRef.current;
      const wsUrl = sessionWsUrlRef.current;
      if (!token || !wsUrl) {
        throw new Error("STT session token missing");
      }

      const params = new URLSearchParams({
        token,
        model: "saaras:v3",
        "language-code": languageCode,
        mode,
        sample_rate: String(TARGET_SAMPLE_RATE),
        high_vad_sensitivity: "true",
        vad_signals: "true",
        input_audio_codec: "pcm_s16le",
        flush_signal: "true",
      });
      const ws = new WebSocket(`${wsUrl}?${params.toString()}`);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      const wsReady = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("STT WebSocket open timed out"));
        }, 10000);
        ws.addEventListener(
          "open",
          () => {
            clearTimeout(timeoutId);
            resolve();
          },
          { once: true },
        );
        ws.addEventListener(
          "error",
          () => {
            clearTimeout(timeoutId);
            reject(new Error("STT WebSocket error"));
          },
          { once: true },
        );
      });

      ws.addEventListener("message", (ev) => {
        if (typeof ev.data === "string") {
          handleServerMessage(ev.data);
        }
      });
      ws.addEventListener("close", (ev) => {
        // Only the currently-active socket may drive reconnect/stop logic; a
        // socket we already replaced during reconnect must be ignored.
        if (wsRef.current !== ws) return;

        waitForTranscriptResolversRef.current.forEach((resolve) => resolve());
        waitForTranscriptResolversRef.current = [];

        if (keepaliveTimerRef.current) {
          clearInterval(keepaliveTimerRef.current);
          keepaliveTimerRef.current = null;
        }

        const unexpected =
          !intentionalStopRef.current && activeSessionRef.current;
        if (unexpected) {
          // Try to silently reconnect first; only surface an error if all
          // attempts fail. transcriptRef is preserved across reconnects.
          attemptReconnectRef.current?.();
          return;
        }

        activeSessionRef.current = false;
        if (mountedRef.current) {
          setState((s) => ({
            ...s,
            isRecording: false,
            isConnecting: false,
          }));
        }
        if (ev.code !== 1000 && ev.code !== 1005) {
          onError?.(`STT connection closed: ${ev.code} ${ev.reason}`);
        }
      });

      await wsReady;

      // Start the keepalive once the socket is open. Any frame on the wire
      // resets idle timers in proxies/Sarvam; the server ignores unknown
      // control frames, so a tiny ping is harmless.
      if (keepaliveTimerRef.current) {
        clearInterval(keepaliveTimerRef.current);
      }
      keepaliveTimerRef.current = setInterval(() => {
        const sock = wsRef.current;
        if (sock && sock.readyState === WebSocket.OPEN) {
          try {
            sock.send(JSON.stringify({ type: "ping" }));
          } catch {
            // ignore — a failed send will surface via the close handler
          }
        }
      }, KEEPALIVE_INTERVAL_MS);

      // Set up audio pipeline: mic → AudioContext → AudioWorklet.
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      // Browsers may hand back a suspended AudioContext (autoplay policy, or a
      // backgrounded tab). Resume it before wiring the graph, otherwise the
      // worklet never pulls samples and the mic appears "on" but silent.
      if (audioCtx.state === "suspended") {
        await audioCtx.resume().catch(() => {});
      }
      // Load the worklet from a Blob URL rather than /audio-worklet/*.js.
      // The Serwist service worker was intercepting that path and returning
      // 406 (likely a defaultCache mismatch on request.destination =
      // "audioworklet"); a blob: URL is same-origin but never goes through
      // the SW fetch handler.
      const workletBlob = new Blob([PCM_WORKLET_SOURCE], {
        type: "application/javascript",
      });
      const workletBlobUrl = URL.createObjectURL(workletBlob);
      try {
        await audioCtx.audioWorklet.addModule(workletBlobUrl);
      } finally {
        URL.revokeObjectURL(workletBlobUrl);
      }
      const source = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      const workletNode = new AudioWorkletNode(audioCtx, "sarvam-pcm-processor", {
        processorOptions: {
          targetSampleRate: TARGET_SAMPLE_RATE,
          frameMs: FRAME_MS,
        },
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
      });
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }
        const audioBase64 = pcmToBase64(e.data);
        wsRef.current.send(
          JSON.stringify({
            audio: {
              data: audioBase64,
              sample_rate: TARGET_SAMPLE_RATE,
              encoding: "audio/wav",
            },
          }),
        );
      };

      source.connect(workletNode);

      // On a successful reconnect, clear the transient "reconnecting" UI state
      // and restore the recording indicator.
      if (isReconnect) {
        if (mountedRef.current) {
          setState((s) => ({
            ...s,
            isRecording: true,
            isConnecting: false,
            error: null,
          }));
        }
        // If this freshly reconnected socket stays open for a stability window,
        // consider the link healthy and refund the retry budget.
        if (stabilityTimerRef.current) {
          clearTimeout(stabilityTimerRef.current);
        }
        const stableSocket = ws;
        stabilityTimerRef.current = setTimeout(() => {
          stabilityTimerRef.current = null;
          if (
            wsRef.current === stableSocket &&
            stableSocket.readyState === WebSocket.OPEN &&
            activeSessionRef.current
          ) {
            reconnectAttemptsRef.current = 0;
          }
        }, 30000);
      }
    };

    const attemptReconnect = () => {
      if (intentionalStopRef.current || !activeSessionRef.current) return;
      if (reconnectingRef.current) return;

      const stream = streamRef.current;
      const streamAlive = !!stream && stream.active;
      if (
        !streamAlive ||
        reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS
      ) {
        reportUnexpectedStop(
          "Transcription connection was lost and could not be restored. Please restart recording before continuing.",
        );
        return;
      }

      reconnectingRef.current = true;
      reconnectAttemptsRef.current += 1;
      const attempt = reconnectAttemptsRef.current;
      const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1);

      // Surface a soft "reconnecting" state without firing onError/onStop —
      // the consumer keeps the session (and its parallel recorder) alive.
      if (mountedRef.current) {
        setState((s) => ({ ...s, isConnecting: true }));
      }

      reconnectTimerRef.current = setTimeout(async () => {
        reconnectTimerRef.current = null;
        if (intentionalStopRef.current || !activeSessionRef.current) {
          reconnectingRef.current = false;
          return;
        }
        const liveStream = streamRef.current;
        if (!liveStream || !liveStream.active) {
          reconnectingRef.current = false;
          reportUnexpectedStop(
            "Microphone input was lost and recording could not be restored. Please restart recording before continuing.",
          );
          return;
        }
        // Tear down just the dead socket + audio nodes, keep the mic stream.
        teardownAudioAndSocket();
        try {
          await connectAndPipeRef.current!(liveStream, true);
          reconnectingRef.current = false;
          // Success — the close handler resets the attempt counter on the next
          // clean start; here we leave it so repeated rapid drops still cap.
        } catch {
          reconnectingRef.current = false;
          // Schedule the next attempt (or give up if we've hit the cap).
          attemptReconnectRef.current?.();
        }
      }, delay);
    };

    connectAndPipeRef.current = connectAndPipe;
    attemptReconnectRef.current = attemptReconnect;
  }, [
    languageCode,
    mode,
    handleServerMessage,
    onError,
    reportUnexpectedStop,
    teardownAudioAndSocket,
  ]);

  // When the tab returns to the foreground, a backgrounded AudioContext may be
  // suspended (silent mic) even though the socket is still open. Resume it so
  // capture continues without the doctor noticing the gap.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (!activeSessionRef.current || intentionalStopRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const waitForFinalTranscript = useCallback((timeoutMs = 2500) => {
    return new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve();
      };
      const timeoutId = setTimeout(done, timeoutMs);
      waitForTranscriptResolversRef.current.push(done);
    });
  }, []);

  const stop = useCallback(async () => {
    intentionalStopRef.current = true;
    activeSessionRef.current = false;
    reconnectingRef.current = false;
    reconnectAttemptsRef.current = 0;

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (keepaliveTimerRef.current) {
      clearInterval(keepaliveTimerRef.current);
      keepaliveTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }
    try {
      workletNodeRef.current?.disconnect();
    } catch {
      // ignore
    }
    workletNodeRef.current = null;
    try {
      sourceNodeRef.current?.disconnect();
    } catch {
      // ignore
    }
    sourceNodeRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: "flush" }));
      } catch {
        // ignore
      }
    }
    await waitForFinalTranscript();
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
      try {
        wsRef.current.close(1000, "client done");
      } catch {
        // ignore
      }
    }
    wsRef.current = null;
    if (mountedRef.current) {
      setState((s) => ({
        ...s,
        isRecording: false,
        isConnecting: false,
        interimText: "",
        speaking: false,
      }));
    }
  }, [waitForFinalTranscript]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    setState((s) => ({ ...s, transcript: "", interimText: "" }));
  }, []);

  return {
    ...state,
    start,
    stop,
    resetTranscript,
    streamRef,
    transcriptRef,
    detectedLanguageRef,
  };
}
