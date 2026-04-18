import React from 'react';
import { Series } from 'remotion';
import { Scene1Problem } from './scenes/Scene1Problem';
import { Scene2Stats } from './scenes/Scene2Stats';
import { Scene3Difference } from './scenes/Scene3Difference';
import { Scene4Product } from './scenes/Scene4Product';
import { Scene5Close } from './scenes/Scene5Close';

export const KosynPromo: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={420}>
      <Scene1Problem />
    </Series.Sequence>
    <Series.Sequence durationInFrames={390}>
      <Scene2Stats />
    </Series.Sequence>
    <Series.Sequence durationInFrames={900}>
      <Scene3Difference />
    </Series.Sequence>
    <Series.Sequence durationInFrames={390}>
      <Scene4Product />
    </Series.Sequence>
    <Series.Sequence durationInFrames={290}>
      <Scene5Close />
    </Series.Sequence>
  </Series>
);
