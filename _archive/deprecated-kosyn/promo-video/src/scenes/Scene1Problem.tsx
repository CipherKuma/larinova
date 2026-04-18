import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

const SMOOTH = { damping: 200 };
const TEXT = '#0A0A0F';

interface Line {
  text: string;
  enterFrame: number;
  size: number;
  weight: number;
  italic?: boolean;
  indent?: boolean;
}

const lines: Line[] = [
  { text: 'Every day, doctors spend 2 hours on paperwork.', enterFrame: 20, size: 48, weight: 300 },
  { text: 'Every day, patient records leave hospital walls', enterFrame: 74, size: 48, weight: 300 },
  { text: 'and land on someone else\u2019s server.', enterFrame: 110, size: 48, weight: 300, italic: true, indent: true },
  { text: 'You signed up to heal people.', enterFrame: 164, size: 56, weight: 700 },
  { text: 'Not to feed data to corporations.', enterFrame: 218, size: 56, weight: 700 },
];

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade out at frame 380 over 10 frames
  const fadeOut = frame >= 380
    ? Math.max(0, 1 - (frame - 380) / 10)
    : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 200px',
        opacity: fadeOut,
      }}
    >
      {lines.map((line, i) => {
        const progress = spring({
          frame: frame - line.enterFrame,
          fps,
          config: SMOOTH,
          durationInFrames: 18,
        });
        const y = 16 * (1 - progress);

        return (
          <div
            key={i}
            style={{
              fontSize: line.size,
              fontWeight: line.weight,
              color: TEXT,
              fontStyle: line.italic ? 'italic' : 'normal',
              paddingLeft: line.indent ? 60 : 0,
              opacity: progress,
              transform: `translateY(${y}px)`,
              lineHeight: 1.4,
              textAlign: 'left',
              width: '100%',
              marginBottom: 8,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
