import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { BrowserMockup } from '../components/BrowserMockup';
import { FeaturePill } from '../components/FeaturePill';

const { fontFamily } = loadFont();

const BOUNCY = { damping: 8 };
const ACCENT = '#4F8EF7';
const CARD_BG = '#F8FAFC';

const pills = [
  { text: 'AI Medical Scribe', enterFrame: 110 },       // 1820-1710
  { text: 'Zero-Knowledge Infrastructure', enterFrame: 140 },
  { text: 'Hospital-Owned Data Vault', enterFrame: 170 },
];

export const Scene4Product: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mockup enters at frame 20 (1730-1710)
  const mockupProgress = spring({ frame: frame - 20, fps, config: BOUNCY, durationInFrames: 25 });
  const mockupScale = 0.85 + 0.15 * mockupProgress;

  // Fade out at frame 350 (2060-1710) over 12 frames
  const fadeOut = interpolate(frame, [350, 362], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: CARD_BG,
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
      }}
    >
      {/* Glow behind mockup */}
      <div
        style={{
          position: 'absolute',
          width: 1400,
          height: 900,
          background: `radial-gradient(circle, ${ACCENT}0F 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
      />

      {/* Browser mockup */}
      <div
        style={{
          transform: `scale(${mockupScale})`,
          opacity: mockupProgress,
          position: 'relative',
        }}
      >
        <BrowserMockup />
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
        {pills.map((pill, i) => (
          <FeaturePill key={i} text={pill.text} enterFrame={pill.enterFrame} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
