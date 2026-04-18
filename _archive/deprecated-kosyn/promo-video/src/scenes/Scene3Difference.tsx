import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { MicIcon } from '../components/icons/MicIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { BuildingIcon } from '../components/icons/BuildingIcon';

const { fontFamily } = loadFont();

const SNAPPY = { damping: 20, stiffness: 200 };
const SMOOTH = { damping: 200 };
const TEXT = '#0A0A0F';
const MUTED = '#64748B';
const ACCENT = '#4F8EF7';

const columns = [
  {
    Icon: MicIcon,
    title: 'Transcribe',
    body: 'Doctor speaks. Kosyn listens. SOAP note, summary, medical codes in seconds.',
    enterFrame: 40, // 850-810=40 local
  },
  {
    Icon: LockIcon,
    title: 'Encrypt',
    body: 'Encrypted on your device. Never leaves your infrastructure. Not even us.',
    enterFrame: 80,
  },
  {
    Icon: BuildingIcon,
    title: 'Own',
    body: 'Your hospital. Your node. Your rules. Full audit trail, always yours.',
    enterFrame: 120,
  },
];

export const Scene3Difference: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // HR at frame 390 (1200-810), sovereignty text at frame 450 (1260-810)
  const hrProgress = spring({ frame: frame - 390, fps, config: SNAPPY, durationInFrames: 20 });
  const textProgress = spring({ frame: frame - 450, fps, config: SMOOTH, durationInFrames: 20 });
  const textY = 20 * (1 - textProgress);

  // Fade out at frame 830 (1640-810) over 12 frames
  const fadeOut = interpolate(frame, [830, 842], [1, 0], {
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
      {/* 3 Columns */}
      <div style={{ display: 'flex', gap: 80, marginBottom: 60 }}>
        {columns.map((col, i) => {
          const p = spring({ frame: frame - col.enterFrame, fps, config: SNAPPY, durationInFrames: 20 });
          const y = 32 * (1 - p);
          return (
            <div
              key={i}
              style={{
                width: 400,
                opacity: p,
                transform: `translateY(${y}px)`,
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <col.Icon size={64} color={ACCENT} />
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
                {col.title}
              </div>
              <div style={{ fontSize: 17, color: MUTED, lineHeight: 1.5 }}>
                {col.body}
              </div>
            </div>
          );
        })}
      </div>

      {/* Horizontal rule */}
      <div
        style={{
          width: 180 * hrProgress,
          height: 1,
          backgroundColor: ACCENT,
          marginBottom: 24,
        }}
      />

      {/* Sovereignty line */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: TEXT,
          opacity: textProgress,
          transform: `translateY(${textY}px)`,
        }}
      >
        This is what data sovereignty looks like.
      </div>
    </AbsoluteFill>
  );
};
