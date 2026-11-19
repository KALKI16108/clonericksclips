import React from 'react';
import {Composition} from 'remotion';
import {Full} from './Full.jsx';
import {CharacterShowcase} from './CharacterShowcase.jsx';
import {CustomCharacterShowcase} from './CustomCharacterShowcase.jsx';
import {KitchenScene} from './KitchenScene.jsx';
import {
  EnvironmentShowcase,
  EnvironmentTreeCloseup,
  EnvironmentWallCloseup,
  EnvironmentRoadCloseup,
} from './EnvironmentShowcase.jsx';
import {COMP_ID, FPS, WIDTH, HEIGHT, DURATION_S} from './story.js';

export const Root = () => (
  <>
    <Composition
      id={COMP_ID}
      component={Full}
      durationInFrames={Math.round(DURATION_S * FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id={`${COMP_ID}-fast`}
      component={Full}
      defaultProps={{fast: true}}
      durationInFrames={Math.round(DURATION_S * FPS)}
      fps={FPS}
      width={540}
      height={960}
    />
    <Composition
      id="character-showcase"
      component={CharacterShowcase}
      durationInFrames={30}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="custom-character-showcase"
      component={CustomCharacterShowcase}
      durationInFrames={30}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="kitchen-scene"
      component={KitchenScene}
      durationInFrames={30}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="environment-showcase"
      component={EnvironmentShowcase}
      durationInFrames={30}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="environment-closeup-tree"
      component={EnvironmentTreeCloseup}
      durationInFrames={30}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="environment-closeup-wall"
      component={EnvironmentWallCloseup}
      durationInFrames={30}
      fps={30}
      width={720}
      height={1280}
    />
    <Composition
      id="environment-closeup-road"
      component={EnvironmentRoadCloseup}
      durationInFrames={30}
      fps={30}
      width={720}
      height={1280}
    />
  </>
);
