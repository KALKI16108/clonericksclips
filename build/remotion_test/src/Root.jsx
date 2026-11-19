import React from 'react';
import {Composition} from 'remotion';
import {Full} from './Full.jsx';
import {CharacterShowcase} from './CharacterShowcase.jsx';
import {CustomCharacterShowcase} from './CustomCharacterShowcase.jsx';
import {KitchenScene} from './KitchenScene.jsx';
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
  </>
);
