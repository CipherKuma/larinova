import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const SNAPPY = { damping: 20, stiffness: 200 };
const ACCENT = '#4F8EF7';
const MUTED = '#64748B';
const CARD_BORDER = '#E2E8F0';

interface StatCardProps {
  number: string;
  label: string;
  enterFrame: number;
}

export const StatCard: React.FC<StatCardProps> = ({ number, label, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame: frame - enterFrame, fps, config: SNAPPY, durationInFrames: 20 });
  const x = -120 * (1 - progress);
  const scale = 0.92 + 0.08 * progress;

  return (
    <div
      style={{
        width: 360,
        height: 280,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateX(${x}px) scale(${scale})`,
        opacity: progress,
      }}
    >
      <div style={{ fontSize: 88, fontWeight: 900, color: ACCENT, lineHeight: 1 }}>
        {number}
      </div>
      <div style={{ fontSize: 18, color: MUTED, marginTop: 16, textAlign: 'center' }}>
        {label}
      </div>
    </div>
  );
};
