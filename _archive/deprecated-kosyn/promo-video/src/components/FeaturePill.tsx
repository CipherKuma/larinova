import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const SNAPPY = { damping: 20, stiffness: 200 };
const ACCENT = '#4F8EF7';

interface FeaturePillProps {
  text: string;
  enterFrame: number;
}

export const FeaturePill: React.FC<FeaturePillProps> = ({ text, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame: frame - enterFrame, fps, config: SNAPPY, durationInFrames: 14 });
  const y = 12 * (1 - progress);

  return (
    <div
      style={{
        backgroundColor: '#EFF6FF',
        border: `1.5px solid ${ACCENT}`,
        borderRadius: 100,
        padding: '10px 24px',
        color: ACCENT,
        fontSize: 16,
        fontWeight: 600,
        opacity: progress,
        transform: `translateY(${y}px)`,
      }}
    >
      {text}
    </div>
  );
};
