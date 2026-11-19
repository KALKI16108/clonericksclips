import React, {useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {
  setupEnvironmentStage,
  buildRealisticTree3D,
  buildCobblestoneWall3D,
  buildRoad3D,
  animateEnvironment,
} from './environmentCore.js';
import {buildCharacter, animateCharacter} from './characterCore.js';

function EnvironmentStageSetup() {
  const {scene, gl, camera} = useThree();
  const initialized = useRef(false);

  if (!initialized.current) {
    setupEnvironmentStage(scene, gl, camera, {
      sunAngleDeg: -30,
      skyColor: '#d0cbc1',
      fogDensity: 0.018,
      shadows: true,
    });
    initialized.current = true;
  }

  useFrame(() => {
    // 40° FOV gives natural vertical perspective capturing full tree, wall, road, and character
    camera.fov = 40;
    camera.position.set(0.35, 1.65, 4.4);
    camera.lookAt(new THREE.Vector3(0.05, 1.15, -0.4));
    camera.updateProjectionMatrix();
  });

  return null;
}

function EnvironmentScene() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sceneData = useMemo(() => {
    const envGroup = new THREE.Group();
    envGroup.name = 'environment_batch1_group';

    // 1. 3D Road running along Z axis (from Z = -8 to Z = +8)
    // Road surface is flush at Y = 0.0 for zero character footing Z-fighting (Safeguard 1)
    const road = buildRoad3D({
      width: 1.8,
      length: 16.0,
      style: 'normal',
      curbWidth: 0.18,
      curbHeight: 0.05,
      seed: 21,
    });
    road.position.set(0, 0, 0);
    envGroup.add(road);

    // 2. 3D Cobblestone Wall running parallel along the right road edge (X = 1.08)
    // Staggered 3D stone courses with micro-tilts, recessed mortar, and beveled coping
    const wall = buildCobblestoneWall3D({
      length: 14.0,
      height: 1.15,
      thickness: 0.24,
      stoneColor: '#948c82',
      mortarColor: '#36322f',
      seed: 77,
    });
    wall.rotation.y = Math.PI / 2;
    wall.position.set(1.08, 0, 0);
    envGroup.add(wall);

    // 3. Realistic 3D Trees with tapered trunks, root flares, limbs, and layered 3D foliage
    // Tree 1: Left verge midground tree (X = -0.85, Z = -1.8)
    // Positioned so its full tapered trunk, root flare, and lush foliage canopy are clearly visible
    const tree1 = buildRealisticTree3D({
      height: 3.8,
      trunkRadius: 0.14,
      crownRadius: 1.15,
      foliageColor: '#4e7e38',
      barkColor: '#533e2d',
      seed: 101,
    });
    tree1.position.set(-0.85, 0, -1.8);
    envGroup.add(tree1);

    // Tree 2: Right tree behind the cobblestone wall (X = 1.35, Z = -0.8)
    // Its trunk rises behind the wall and branches with layered foliage arch over the wall
    const tree2 = buildRealisticTree3D({
      height: 4.1,
      trunkRadius: 0.15,
      crownRadius: 1.25,
      foliageColor: '#588a40',
      barkColor: '#4d3a2b',
      seed: 202,
    });
    tree2.position.set(1.35, 0, -0.8);
    envGroup.add(tree2);

    // Tree 3: Background tree further down the road (X = 0.5, Z = -4.5)
    const tree3 = buildRealisticTree3D({
      height: 4.5,
      trunkRadius: 0.16,
      crownRadius: 1.35,
      foliageColor: '#3d682d',
      barkColor: '#4a3728',
      seed: 303,
    });
    tree3.position.set(0.5, 0, -4.5);
    envGroup.add(tree3);

    // 4. Character in clear footing zone at [0, 0, 0]
    // Demonstrates zero Z-fighting at character feet and visual separation
    // between 2.5D character (with ink outlines) and true 3D environment (zero ink outlines)
    const character = buildCharacter({
      name: 'ShowcaseHero',
      seed: 77,
      skin: '#f3efe9',
      baseBodyColor: '#27a694',
      outfitStyle: 'scholarRobe',
      hairStyle: 'scholarBun',
      emotion: 'grin',
      polishMode: 'plastic',
    });
    character.position.set(0, 0, 0);
    character.rotation.y = 0.12;

    return {
      envGroup,
      character,
    };
  }, []);

  useFrame(() => {
    const t = frame / fps;

    // Deterministic wind breeze sway on trees (Safeguard 2)
    animateEnvironment(sceneData.envGroup, t, {
      windSpeed: 1.7,
      windStrength: 0.028,
    });

    // Character dialogue & expression animation
    animateCharacter(sceneData.character, t, {
      emotion: 'grin',
      speaking: true,
    });
  });

  return (
    <>
      <primitive object={sceneData.envGroup} />
      <primitive object={sceneData.character} />
    </>
  );
}

export const EnvironmentShowcase = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#d0cbc1'}}>
      <ThreeCanvas
        width={720}
        height={1280}
        shadows={{type: THREE.PCFSoftShadowMap}}
        camera={{fov: 40, near: 0.1, far: 50, position: [0.35, 1.65, 4.4]}}
      >
        <EnvironmentStageSetup />
        <EnvironmentScene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
