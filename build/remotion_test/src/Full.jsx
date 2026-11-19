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

function Lighting({activeX = 0}) {
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
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={50}
      />
    </>
  );
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
      for (const c of built[k].characters) {
        animateCharacter(c, t, camera.position);
      }
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

export const Full = () => {
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
        shadows
        camera={{fov: 40, near: 0.1, far: 150, position: cam.pos}}
      >
        <Lighting activeX={shot.x} />
        <World t={t} activeIdx={idx} />
        <EffectComposer>
          <DepthOfField
            worldFocusDistance={focusDist}
            worldFocusRange={focusDist * 0.75}
            bokehScale={1.5}
          />
          <Vignette eskil={false} offset={0.3} darkness={0.45} />
        </EffectComposer>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
