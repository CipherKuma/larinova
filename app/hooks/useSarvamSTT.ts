"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// A single transcription request that hangs would otherwise pin processingRef
// forever (zombie state: mic on, nothing transcribed). Abort it after this.
const TRANSCRIBE_REQUEST_TIMEOUT_MS = 20000;
// How many consecutive chunk failures we tolerate before surfacing a hard
// error to the consumer. Transient blips (one dropped chunk) shouldn't kill the
// session, but a sustained outage must not fail silently.
const MAX_CONSECUTIVE_CHUNK_FAILURES = 4;
// Base delay for exponential backoff between failing chunks (ms), capped in the
// loop. Keeps the client from hammering a struggling transcription backend.
const CHUNK_RETRY_BASE_DELAY_MS = 800;

interface UseSarvamSTTOptions {
  languageCode?: string;
  locale?: string;
  chunkDurationMs?: number;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onUnexpectedStop?: (reason: string) => void;
}

interface SarvamSTTState {
  isRecording: boolean;
  isConnecting: boolean;
  transcript: string;
  interimText: string;
  duration: number;
  error: string | null;
  permissionDenied: boolean;
}

export function useSarvamSTT(options: UseSarvamSTTOptions = {}) {
  const {
    languageCode = "unknown",
    locale,
    chunkDurationMs = 3000,
    onTranscript,
    onError,
    onUnexpectedStop,
  } = options;

  const [state, setState] = useState<SarvamSTTState>({
    isRecording: false,
    isConnecting: false,
    transcript: "",
    interimText: "",
    duration: 0,
    error: null,
    permissionDenied: false,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const transcriptRef = useRef<string>("");
  const detectedLanguageRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const recordingRef = useRef(false);
  const processingRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const intentionalStopRef = useRef(false);
  const languageCodeRef = useRef(languageCode);
  const localeRef = useRef(locale);

  useEffect(() => {
    languageCodeRef.current = languageCode;
  }, [languageCode]);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      recordingRef.current = false;
    };
  }, []);

  const cleanup = useCallback(() => {
    recordingRef.current = false;
    processingRef.current = false;
    consecutiveFailuresRef.current = 0;

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    cleanup();
    if (mountedRef.current) {
      setState((s) => ({
        ...s,
        isRecording: false,
        isConnecting: false,
        interimText: "",
      }));
    }
  }, [cleanup]);

  const reportUnexpectedStop = useCallback(
    (reason: string) => {
      if (intentionalStopRef.current || !recordingRef.current) return;
      recordingRef.current = false;

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
          error: reason,
        }));
      }
      onError?.(reason);
      onUnexpectedStop?.(reason);
      cleanup();
    },
    [cleanup, onError, onUnexpectedStop],
  );

  // Called when a single transcription chunk fails (non-2xx, network, or
  // timeout). Transient blips are surfaced softly and the record loop retries
  // on the next chunk; a sustained streak escalates to a hard unexpected-stop
  // so the doctor isn't left in a silent zombie state with audio being lost.
  const handleChunkFailure = useCallback(
    (message: string) => {
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_CHUNK_FAILURES) {
        reportUnexpectedStop(
          "Transcription service is unavailable. Recording stopped to avoid losing audio — please check your connection and restart.",
        );
        return;
      }
      // Soft error: keep recording, but make the failure visible.
      if (mountedRef.current) {
        setState((s) => ({ ...s, interimText: "", error: message }));
      }
      onError?.(message);
    },
    [reportUnexpectedStop, onError],
  );

  // Record a short clip, stop it, send the complete file
  const recordAndSend = useCallback(
    async (stream: MediaStream) => {
      return new Promise<void>((resolve) => {
        if (!recordingRef.current || !stream.active) {
          resolve();
          return;
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm",
        });

        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          if (chunks.length === 0) {
            resolve();
            return;
          }

          const blob = new Blob(chunks, { type: "audio/webm" });

          if (processingRef.current) {
            resolve();
            return;
          }
          processingRef.current = true;

          if (mountedRef.current) {
            setState((s) => ({ ...s, interimText: "..." }));
          }

          // Abort a hung request so processingRef can never stick `true`
          // (the zombie-state root cause). The finally below always clears it.
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            TRANSCRIBE_REQUEST_TIMEOUT_MS,
          );

          try {
            const formData = new FormData();
            formData.append("file", blob, "audio.webm");
            formData.append("language_code", languageCodeRef.current);
            if (localeRef.current) {
              formData.append("locale", localeRef.current);
            }

            const res = await fetch("/api/consultation/transcribe", {
              method: "POST",
              body: formData,
              signal: controller.signal,
            });

            if (res.ok) {
              const data = await res.json();
              // A successful round-trip clears the failure streak even if this
              // particular chunk was silence (empty transcript).
              consecutiveFailuresRef.current = 0;
              if (data.transcript && data.transcript.trim()) {
                const text = data.transcript.trim();
                transcriptRef.current = transcriptRef.current
                  ? `${transcriptRef.current} ${text}`
                  : text;

                if (data.language_code) {
                  detectedLanguageRef.current = data.language_code;
                }

                if (mountedRef.current) {
                  setState((s) => ({
                    ...s,
                    transcript: transcriptRef.current,
                    interimText: "",
                  }));
                }

                onTranscript?.(text, true);
              } else {
                if (mountedRef.current) {
                  setState((s) => ({ ...s, interimText: "" }));
                }
              }
            } else {
              // Non-2xx: count it as a failure. The record loop retries on the
              // next chunk; we only escalate after a sustained streak.
              handleChunkFailure(
                `Transcription failed (${res.status}). Retrying…`,
              );
            }
          } catch (err) {
            // Network error or abort (timeout). Same escalation policy — never
            // swallow silently.
            const aborted = (err as Error)?.name === "AbortError";
            handleChunkFailure(
              aborted
                ? "Transcription request timed out. Retrying…"
                : "Transcription request failed. Retrying…",
            );
          } finally {
            clearTimeout(timeoutId);
            processingRef.current = false;
          }

          resolve();
        };

        recorder.start();
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          } else {
            resolve();
          }
        }, chunkDurationMs);
      });
    },
    [chunkDurationMs, onTranscript, handleChunkFailure],
  );

  const start = useCallback(async () => {
    if (state.isRecording || state.isConnecting) return false;
    intentionalStopRef.current = false;
    processingRef.current = false;
    consecutiveFailuresRef.current = 0;

    setState((s) => ({
      ...s,
      error: null,
      permissionDenied: false,
      isConnecting: true,
      transcript: "",
      interimText: "",
      duration: 0,
    }));
    transcriptRef.current = "";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      recordingRef.current = true;

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

      // Duration timer
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

      // Record loop — fresh recorder every chunkDurationMs
      const recordLoop = async () => {
        while (recordingRef.current && streamRef.current?.active) {
          await recordAndSend(streamRef.current);
          // Back off between chunks while the backend is failing so we don't
          // hammer it; capped so recovery is still quick. Cleared to 0 on the
          // next success. recordAndSend escalates to a hard stop at the cap.
          const failures = consecutiveFailuresRef.current;
          if (failures > 0 && recordingRef.current) {
            const backoff = Math.min(
              CHUNK_RETRY_BASE_DELAY_MS * Math.pow(2, failures - 1),
              5000,
            );
            await new Promise((r) => setTimeout(r, backoff));
          }
        }
        if (recordingRef.current && !intentionalStopRef.current) {
          reportUnexpectedStop(
            "Microphone input stopped unexpectedly. Please restart recording before continuing.",
          );
        }
      };

      recordLoop();
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      cleanup();

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        if (mountedRef.current) {
          setState((s) => ({
            ...s,
            permissionDenied: true,
            error: "Microphone access denied",
            isConnecting: false,
          }));
        }
        onError?.("Microphone access denied");
      } else {
        const errMsg = error.message || "Failed to start recording";
        if (mountedRef.current) {
          setState((s) => ({
            ...s,
            error: errMsg,
            isConnecting: false,
          }));
        }
        onError?.(errMsg);
      }
      return false;
    }
  }, [
    cleanup,
    recordAndSend,
    onError,
    reportUnexpectedStop,
    state.isRecording,
    state.isConnecting,
  ]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    setState((s) => ({
      ...s,
      transcript: "",
      interimText: "",
    }));
  }, []);

  return {
    ...state,
    transcriptRef,
    detectedLanguageRef,
    streamRef,
    start,
    stop,
    resetTranscript,
  };
}
