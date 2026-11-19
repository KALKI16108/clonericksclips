import React, {useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {
  setupStudioStage,
  buildCharacter,
  createCutoutPart,
  attachSurfaceOverlay,
  ovalPts,
  pillPts,
  replaceCharacter,
  animateCharacter,
  INK,
  Z,
} from './characterCore.js';
import {buildCustomCharacter} from './characterGenerator.js';

function StudioStageSetup() {
  const {scene, gl, camera} = useThree();
  const initialized = useRef(false);

  if (!initialized.current) {
    setupStudioStage(scene, gl, camera);
    initialized.current = true;
  }

  useFrame(() => {
    camera.fov = 32;
    camera.position.set(0, 1.02, 2.85);
    camera.lookAt(0, 0.94, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

function CustomStudioScene() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const characters = useMemo(() => {
    const grp = new THREE.Group();

    // 1. Grand Sage built dynamically with custom callbacks and createCutoutPart
    const sage = buildCharacter({
      name: 'GrandSage',
      seed: 501,
      skin: '#f3efe9',
      baseBodyColor: '#4c264d',
      emotion: 'calm',
      polishMode: 'plastic',
      buildClothes: ({torsoGroup, torsoW, torsoH, polishMode, seed}) => {
        // Deep purple silk robe
        const {group: robe} = createCutoutPart(
          pillPts(torsoW * 1.1, torsoH * 0.96, torsoW * 0.4),
          '#4c264d',
          {z: Z.outfitDetail - Z.torso, polishMode, castShadow: true}
        );
        // Golden embroidered sash
        const {group: sash} = createCutoutPart(
          [
            new THREE.Vector2(-torsoW * 0.46, -0.025),
            new THREE.Vector2(torsoW * 0.46, -0.025),
            new THREE.Vector2(torsoW * 0.46, 0.025),
            new THREE.Vector2(-torsoW * 0.46, 0.025),
          ],
          '#f2c14e',
          {z: Z.outfitDetail - Z.torso + 0.003, polishMode}
        );
        sash.position.y = 0.16;
        torsoGroup.add(robe, sash);
      },
      buildHairAndHat: ({headGroup, headRx, headRy, polishMode, seed}) => {
        // Conical straw traveler hat
        const {group: hat} = createCutoutPart(
          [
            new THREE.Vector2(-0.35, 0.04),
            new THREE.Vector2(0.0, 0.25),
            new THREE.Vector2(0.35, 0.04),
            new THREE.Vector2(0.0, 0.09),
          ],
          '#f2c14e',
          {z: Z.headgear - Z.head, polishMode, castShadow: true}
        );
        hat.position.set(0, headRy * 0.55, 0);
        headGroup.add(hat);
      },
      buildProp: ({root, polishMode, seed}) => {
        const propGroup = new THREE.Group();
        propGroup.position.set(-0.24, 0.62, 0.04);
        const {group: shaft} = createCutoutPart(
          [
            new THREE.Vector2(-0.012, -0.65),
            new THREE.Vector2(0.012, -0.65),
            new THREE.Vector2(0.012, 0.55),
            new THREE.Vector2(-0.012, 0.55),
          ],
          '#785231',
          {z: 0.02, polishMode}
        );
        const {group: tip} = createCutoutPart(
          ovalPts(0.038, 0.038, seed + 22, 18),
          '#f2c14e',
          {z: 0.024, polishMode}
        );
        tip.position.y = 0.56;
        propGroup.add(shaft, tip);
        root.add(propGroup);
      },
    });
    sage.position.set(-0.28, 0, 0);
    sage.rotation.y = 0.08;

    // 2. Custom Oni Mystic generated via prompt description
    const oni = buildCustomCharacter({
      prompt: 'horned oni mystic in dark armor with mystical orb',
      name: 'OniMystic',
      seed: 602,
      polishMode: 'plastic',
      emotion: 'dizzy',
      prop: 'orb',
    });
    oni.position.set(0.28, 0, 0);
    oni.rotation.y = -0.08;

    grp.add(sage, oni);
    return {grp, sage, oni};
  }, []);

  useFrame(() => {
    const t = frame / fps;
    animateCharacter(characters.sage, t, {emotion: 'calm', speaking: true});
    animateCharacter(characters.oni, t, {emotion: 'dizzy'});
  });

  return <primitive object={characters.grp} />;
}

export const CustomCharacterShowcase = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#ded9cf'}}>
      <ThreeCanvas
        width={720}
        height={1280}
        shadows={{type: THREE.PCFSoftShadowMap}}
        camera={{fov: 32, near: 0.1, far: 50, position: [0, 1.02, 2.85]}}
      >
        <StudioStageSetup />
        <CustomStudioScene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
