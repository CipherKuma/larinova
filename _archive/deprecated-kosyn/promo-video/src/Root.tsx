import React from 'react';
import { Composition } from 'remotion';
import { KosynPromo } from './KosynPromo';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="KosynPromo"
      component={KosynPromo}
      durationInFrames={2390}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
