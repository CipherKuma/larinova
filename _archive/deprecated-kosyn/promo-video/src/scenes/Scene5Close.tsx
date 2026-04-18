import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

const SNAPPY = { damping: 20, stiffness: 200 };
const SMOOTH = { damping: 200 };
const TEXT = '#0A0A0F';
const MUTED = '#64748B';
const ACCENT = '#4F8EF7';

export const Scene5Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // KOSYN at frame 20 (2120-2100)
  const wordmarkP = spring({ frame: frame - 20, fps, config: SMOOTH, durationInFrames: 20 });
  const wordmarkY = 20 * (1 - wordmarkP);

  // HR at frame 40 (2140-2100)
  const hrP = spring({ frame: frame - 40, fps, config: SNAPPY, durationInFrames: 20 });

  // Tagline at frame 90 (2190-2100)
  const tagP = spring({ frame: frame - 90, fps, config: SMOOTH, durationInFrames: 18 });

  // URL at frame 150 (2250-2100)
  const urlP = spring({ frame: frame - 150, fps, config: SMOOTH, durationInFrames: 16 });

  // Fade to white at frame 250 (2350) over 20 frames
  const fadeOut = interpolate(frame, [250, 270], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
      }}
    >
      {/* KOSYN wordmark */}
      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          letterSpacing: 10,
          color: TEXT,
          opacity: wordmarkP,
          transform: `translateY(${wordmarkY}px)`,
        }}
      >
        KOSYN
      </div>

      {/* Horizontal rule */}
      <div
        style={{
          width: 120 * hrP,
          height: 1,
          backgroundColor: ACCENT,
          margin: '24px 0',
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 300,
          color: MUTED,
          opacity: tagP,
        }}
      >
        Your data. Your infrastructure. Your patients.
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: ACCENT,
          opacity: urlP,
          marginTop: 20,
        }}
      >
        kosyn-mvp-app.vercel.app
      </div>
    </AbsoluteFill>
  );
};
