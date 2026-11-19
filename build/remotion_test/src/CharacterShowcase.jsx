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

// Studio Rig: Enforces the #ded9cf studio backdrop, PCFSoftShadowMap,
// upper-left directional key light, and 32° FOV camera framing (Rule 1)
function StudioStageSetup() {
  const {scene, gl, camera} = useThree();
  const initialized = useRef(false);

  if (!initialized.current) {
    setupStudioStage(scene, gl, camera);
    initialized.current = true;
  }

  useFrame(() => {
    // Keep camera strictly framed per Rule 1: 32° FOV at [0, 1.02, 2.85] looking at [0, 0.94, 0]
    camera.fov = 32;
    camera.position.set(0, 1.02, 2.85);
    camera.lookAt(0, 0.94, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

function StudioScene() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const characters = useMemo(() => {
    const grp = new THREE.Group();

    // 1. Dialogue & Expressions Hero (Scholar)
    // Uses buildCharacter with polishMode: 'plastic', smooth Catmull-Rom outlines,
    // and built-in 'scholarRobe' / 'scholarBun'
    const charScholar = buildCharacter({
      name: 'ScholarHero',
      seed: 101,
      skin: '#f3efe9',
      baseBodyColor: '#27a694',
      outfitStyle: 'scholarRobe',
      hairStyle: 'scholarBun',
      hairColor: '#1f1c1b',
      accentColor: '#f4efe8',
      strapColor: '#785231',
      emotion: 'grin',
      polishMode: 'plastic',
    });
    charScholar.position.set(-0.28, 0, 0);
    charScholar.rotation.y = 0.08;

    // 2. Anger & Shouting Samurai
    // Demonstrating the rising-purple liquid face-fill, popping temple vein,
    // shout mouth snap, and raised tense arms at angerLevel >= 0.78
    const charSamurai = buildCharacter({
      name: 'SamuraiAnger',
      seed: 202,
      skin: '#f3efe9',
      baseBodyColor: '#d9522e',
      outfitStyle: 'samuraiArmor',
      hairStyle: 'topknot',
      hatStyle: 'kabutoHelmet',
      hairColor: '#1e1c1b',
      accentColor: '#f2b84b',
      strapColor: '#242120',
      emotion: 'shout',
      polishMode: 'plastic',
    });
    charSamurai.position.set(0.28, 0, 0);
    charSamurai.rotation.y = -0.08;

    grp.add(charScholar, charSamurai);

    return {
      grp,
      charScholar,
      charSamurai,
    };
  }, []);

  useFrame(() => {
    const t = frame / fps;

    // Scholar: Animated dialogue with natural cadence and comic grin
    animateCharacter(characters.charScholar, t, {
      emotion: 'grin',
      speaking: true,
      angerLevel: 0,
      shouting: false,
    });

    // Samurai: Rising-purple liquid face-fill, popping temple vein, and shout snap
    // angerLevel smoothly interpolates to 0.88 to trigger the purple waterline and shout snap
    animateCharacter(characters.charSamurai, t, {
      emotion: 'shout',
      speaking: false,
      angerLevel: 0.88,
      shouting: true,
    });
  });

  return <primitive object={characters.grp} />;
}

export const CharacterShowcase = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#ded9cf'}}>
      <ThreeCanvas
        width={720}
        height={1280}
        shadows={{type: THREE.PCFSoftShadowMap}}
        camera={{fov: 32, near: 0.1, far: 50, position: [0, 1.02, 2.85]}}
      >
        <StudioStageSetup />
        <StudioScene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
