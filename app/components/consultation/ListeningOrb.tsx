"use client";

import { useEffect, useRef } from "react";

export type AgentState =
  | "listening"
  | "thinking"
  | "speaking"
  | "connecting"
  | null;

interface ListeningOrbProps {
  stream?: MediaStream | null;
  agentState?: AgentState;
  size?: number;
  colors?: [string, string];
  className?: string;
}

const EMERALD: [string, string] = ["#a7f3d0", "#10b981"];

export function ListeningOrb({
  stream,
  agentState,
  size = 240,
  colors = EMERALD,
  className,
}: ListeningOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let analyser: AnalyserNode | null = null;
    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let freqBuf: Uint8Array<ArrayBuffer> | null = null;
    let timeBuf: Uint8Array<ArrayBuffer> | null = null;

    if (stream) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtx = new Ctx();
      source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.55;
      source.connect(analyser);
      freqBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      timeBuf = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    }

    const bands: [number, number, number] = [0, 0, 0];
    const phase: [number, number, number] = [0, 0, 0];
    let energy = 0;
    let prevVol = 0;
    let kick = 0;
    let t = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      let lo = 0;
      let mi = 0;
      let hi = 0;
      let vol = 0;

      if (analyser && freqBuf && timeBuf) {
        analyser.getByteFrequencyData(freqBuf);
        const N = freqBuf.length;
        const loEnd = Math.floor(N * 0.12);
        const miEnd = Math.floor(N * 0.45);
        let sLo = 0;
        let sMi = 0;
        let sHi = 0;
        for (let i = 0; i < loEnd; i++) sLo += freqBuf[i];
        for (let i = loEnd; i < miEnd; i++) sMi += freqBuf[i];
        for (let i = miEnd; i < N; i++) sHi += freqBuf[i];
        lo = sLo / loEnd / 255;
        mi = sMi / (miEnd - loEnd) / 255;
        hi = sHi / (N - miEnd) / 255;

        analyser.getByteTimeDomainData(timeBuf);
        let sq = 0;
        for (let i = 0; i < timeBuf.length; i++) {
          const v = (timeBuf[i] - 128) / 128;
          sq += v * v;
        }
        vol = Math.min(1, Math.sqrt(sq / timeBuf.length) * 4);
      } else {
        // Idle breathing baseline so the orb still feels alive
        const breath = (Math.sin(t * 1.4) * 0.5 + 0.5) * 0.22;
        lo = breath * 0.7;
        mi = breath;
        hi = breath * 0.5;
        vol = breath * 0.4;
      }

      bands[0] = bands[0] * 0.45 + lo * 0.55;
      bands[1] = bands[1] * 0.45 + mi * 0.55;
      bands[2] = bands[2] * 0.45 + hi * 0.55;

      const delta = vol - prevVol;
      if (delta > 0.07) kick = Math.min(1, kick + delta * 2.5);
      kick *= 0.88;
      prevVol = vol;
      energy = energy * 0.6 + vol * 0.4;
      const total = Math.min(1, energy + kick * 0.5);

      phase[0] += dt * (1.6 + bands[2] * 4.5);
      phase[1] += dt * (1.0 + energy * 3.5);
      phase[2] += dt * (0.8 + bands[0] * 3.0);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 2 * dpr, 0, Math.PI * 2);
      ctx.clip();

      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      bg.addColorStop(0, `rgba(16, 78, 60, ${0.4 + total * 0.35})`);
      bg.addColorStop(0.7, "rgba(2, 6, 23, 0.85)");
      bg.addColorStop(1, "rgba(2, 6, 23, 0.95)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const bloom = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        w * 0.35,
      );
      bloom.addColorStop(0, `rgba(167, 243, 208, ${0.12 + total * 0.55})`);
      bloom.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      const cs = colorsRef.current;
      const waveColors = [cs[0], cs[0], cs[1]];
      const baseAmp = h * 0.22;
      const freqs = [3.5, 4.5, 5.8];

      ctx.globalCompositeOperation = "screen";
      for (let k = 0; k < 3; k++) {
        const band = bands[k] + kick * 0.4;
        const amp = baseAmp * (0.12 + band * 1.05);
        ctx.beginPath();
        ctx.lineWidth = (k === 1 ? 3 : 2.4) * dpr;
        ctx.strokeStyle = waveColors[k];
        ctx.shadowColor = waveColors[k];
        ctx.shadowBlur = (12 + total * 20) * dpr;
        ctx.globalAlpha = 0.55 + 0.45 * Math.min(1, band + kick * 0.6);
        for (let x = 0; x <= w; x += 2 * dpr) {
          const u = x / w;
          const taper = Math.sin(Math.PI * u);
          const y =
            h / 2 +
            Math.sin(
              u * Math.PI * freqs[k] + phase[k] + (k * Math.PI * 2) / 3,
            ) *
              amp *
              taper;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 1 * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${0.3 + total * 0.5})`;
      ctx.lineWidth = (1 + total * 1.5) * dpr;
      ctx.stroke();

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      source?.disconnect();
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, [stream, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size, borderRadius: "50%" }}
      aria-hidden="true"
      data-agent-state={agentState ?? "idle"}
    />
  );
}
