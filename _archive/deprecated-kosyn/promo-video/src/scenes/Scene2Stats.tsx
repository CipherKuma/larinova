import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { StatCard } from '../components/StatCard';

const { fontFamily } = loadFont();

const CARD_BG = '#F8FAFC';

const stats = [
  { number: '2 hrs', label: 'doctors lose to documentation daily', enterFrame: 20 },
  { number: '1.1B', label: 'patient records breached since 2009', enterFrame: 50 },
  { number: '0', label: 'AI scribes that give hospitals data ownership', enterFrame: 80 },
];

export const Scene2Stats: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade out at frame 355 over 8 frames (775-420=355 local)
  const fadeOut = interpolate(frame, [355, 363], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CARD_BG,
        fontFamily,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
        opacity: fadeOut,
      }}
    >
      {stats.map((stat, i) => (
        <StatCard key={i} number={stat.number} label={stat.label} enterFrame={stat.enterFrame} />
      ))}
    </AbsoluteFill>
  );
};
