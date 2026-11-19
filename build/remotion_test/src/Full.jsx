import React, {useMemo, useRef, useEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer, DepthOfField, Vignette} from '@react-three/postprocessing';
import * as THREE from 'three';
import {CUTS, SHOTS, CREAM} from './story.js';
import {cameraAt, shotIndex} from './camera.js';
import {animateCharacter} from './char3.js';
import {WORLDS} from './worlds/story_worlds.js';

function Lighting({activeX = 0, fast = false}) {
  const lightRef = useRef();
  const targetRef = useRef();

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, [activeX]);

  return (
    <>
      {/* Rulebook Act 1 Daytime Lighting: Sky #fff1d6, Ground shadow #2a3026 */}
      <hemisphereLight args={['#fff1d6', '#2a3026', 1.05]} />
      {/* Target for directional light tracking active shot center */}
      <object3D ref={targetRef} position={[activeX, 1, 0]} />
      {/* Warm key light from upper-left with soft shadows: highlight #ffd9a0 */}
      <directionalLight
        ref={lightRef}
        position={[activeX - 7, 14, 8]}
        intensity={1.65}
        color="#ffd9a0"
        castShadow={!fast}
        shadow-mapSize={fast ? [512, 512] : [2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={50}
      />
    </>
  );
}

// Dynamic per-frame animation state driver for characters across story timeline
function getCharacterAnimation(shotId, charIndex, t, isCurrentShot) {
  // Idle motion is active by default when not in active shot
  if (!isCurrentShot) {
    return {
      speaking: false,
      emotion: 'calm',
      angerLevel: 0,
      shouting: false,
    };
  }

  switch (shotId) {
    case 'shot1': {
      // George packing dynamite with whale: (0.0 - 3.3s)
      const speaking = t >= 0.15 && t <= 3.3;
      const emotion = speaking ? 'smug' : 'grin';
      return { speaking, emotion, angerLevel: 0, shouting: false };
    }

    case 'shot2': {
      // Crowd holding noses around rotting whale: (4.08 - 8.34s)
      if (charIndex === 0) {
        const speaking = t >= 4.3 && t <= 6.2;
        return { speaking, emotion: 'sweat', angerLevel: 0, shouting: false };
      }
      if (charIndex === 2) {
        const speaking = t >= 6.4 && t <= 8.2;
        return { speaking, emotion: 'shock', angerLevel: 0, shouting: false };
      }
      return { speaking: false, emotion: 'deadpan', angerLevel: 0, shouting: false };
    }

    case 'shot3': {
      // George proudly explaining plan with whiteboard: (8.34 - 14.88s)
      const speaking = t >= 8.5 && t <= 14.4;
      const emotion = t < 12.0 ? 'grin' : 'smug';
      return { speaking, emotion, angerLevel: 0, shouting: false };
    }

    case 'shot4': {
      // Veteran begging him to stop, escalating into anger and shouting! (14.88 - 20.74s)
      const tShot = t - 14.88; // 0 to 5.86s
      if (tShot < 2.6) {
        const angerLevel = Math.min(0.72, (tShot / 2.6) * 0.72);
        return { speaking: true, emotion: 'sweat', angerLevel, shouting: false };
      } else {
        return { speaking: true, emotion: 'shout', angerLevel: 1.0, shouting: true };
      }
    }

    case 'shot5': {
      // George laughing and pushing plunger: (20.74 - 26.82s)
      const speaking = t >= 20.9 && t <= 26.2;
      return { speaking, emotion: 'grin', angerLevel: 0, shouting: false };
    }

    case 'shot7': {
      // Crowd looking up as blubber rains: (32.28 - 39.34s)
      const tShot = t - 32.28;
      if (tShot < 3.0) {
        return { speaking: false, emotion: 'shock', angerLevel: 0, shouting: false };
      } else {
        if (charIndex === 0) return { speaking: false, emotion: 'shock', angerLevel: 0.9, shouting: true };
        if (charIndex === 1) return { speaking: true, emotion: 'sweat', angerLevel: 0, shouting: false };
        return { speaking: false, emotion: 'dizzy', angerLevel: 0, shouting: false };
      }
    }

    case 'shot9': {
      // Veteran staring at crushed car holding keys: (44.28 - 49.10s)
      const tShot = t - 44.28;
      if (tShot < 2.2) {
        return { speaking: false, emotion: 'deadpan', angerLevel: 0, shouting: false };
      } else {
        const speaking = t >= 46.8 && t <= 48.8;
        return { speaking, emotion: 'crying', angerLevel: 0, shouting: false };
      }
    }

    default:
      return { speaking: false, emotion: 'calm', angerLevel: 0, shouting: false };
  }
}

// Builds location once; animates characters and camera per frame
function World({t, activeIdx}) {
  const built = useMemo(() => {
    const out = {};
    for (const s of SHOTS) {
      const fn = WORLDS[s.id];
      if (fn && !out[s.id]) out[s.id] = fn(s.x);
    }
    return out;
  }, []);

  const {camera} = useThree();
  const shot = SHOTS[activeIdx];

  useFrame(({scene}) => {
    const {pos, look} = cameraAt(shot, t);
    camera.position.set(...pos);
    camera.lookAt(new THREE.Vector3(...look));
    scene.background = new THREE.Color(shot.fog);
    scene.fog = new THREE.Fog(shot.fog, 12, 50);

    for (const k of Object.keys(built)) {
      if (built[k].update) built[k].update(t);
      const isCurrentShot = (k === shot.id);
      built[k].characters.forEach((c, idx) => {
        const animState = getCharacterAnimation(k, idx, t, isCurrentShot);
        animateCharacter(c, t, camera.position, animState);
      });
    }
  });

  return (
    <>
      {Object.values(built).map((b, i) => (
        <primitive key={i} object={b.group} />
      ))}
    </>
  );
}

export const Full = ({fast = false} = {}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  const idx = shotIndex(CUTS, t);
  const shot = SHOTS[idx];
  const cam = cameraAt(shot, t);
  const focusDist = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);

  return (
    <AbsoluteFill style={{backgroundColor: CREAM}}>
      <Audio src={staticFile('voiceover.wav')} />
      {/* Rulebook spec: 40 degree vertical FOV, 720x1280 (9:16) */}
      <ThreeCanvas
        width={width}
        height={height}
        shadows={!fast}
        camera={{fov: 40, near: 0.1, far: 150, position: cam.pos}}
      >
        <Lighting activeX={shot.x} fast={fast} />
        <World t={t} activeIdx={idx} />
        {!fast && (
          <EffectComposer>
            <DepthOfField
              worldFocusDistance={focusDist}
              worldFocusRange={focusDist * 0.75}
              bokehScale={1.5}
            />
            <Vignette eskil={false} offset={0.3} darkness={0.45} />
          </EffectComposer>
        )}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
