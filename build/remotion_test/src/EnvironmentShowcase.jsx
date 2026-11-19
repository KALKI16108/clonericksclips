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

function EnvironmentStageSetup({viewMode = 'master'}) {
  const {scene, gl, camera} = useThree();
  const initialized = useRef(false);

  if (!initialized.current) {
    setupEnvironmentStage(scene, gl, camera, {
      sunAngleDeg: -30,
      skyColor: '#d0cbc1',
      fogDensity: 0.016,
      shadows: true,
    });
    initialized.current = true;
  }

  useFrame(() => {
    if (viewMode === 'tree') {
      // Close-up focused on tree foliage, sprig leaf clusters, and curved branches
      camera.fov = 32;
      camera.position.set(-0.95, 1.95, 0.50);
      camera.lookAt(new THREE.Vector3(-1.45, 1.95, -1.5));
    } else if (viewMode === 'wall') {
      // Macro close-up focused on faceted extruded stones, mortar joint relief, and coping
      camera.fov = 30;
      camera.position.set(0.40, 0.88, 1.25);
      camera.lookAt(new THREE.Vector3(1.15, 0.78, 0.10));
    } else if (viewMode === 'road') {
      // Close-up focused on road curb, chamfer, gutter darkening, aggregate texture, and footing
      camera.fov = 30;
      camera.position.set(-0.25, 0.48, 1.45);
      camera.lookAt(new THREE.Vector3(-0.85, 0.05, 0.15));
    } else {
      // Master full shot capturing full tree, wall, road, and character
      camera.fov = 38;
      camera.position.set(0.35, 1.55, 4.2);
      camera.lookAt(new THREE.Vector3(0.05, 1.12, -0.3));
    }
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

    // 1. 3D Road running along Z axis
    // Roadbed with chamfered 3D curbs, gutter darkening, fine aggregate texture, and zero Z-fighting markings
    const road = buildRoad3D({
      width: 1.8,
      length: 16.0,
      style: 'normal',
      curbWidth: 0.18,
      curbHeight: 0.065,
      seed: 21,
    });
    road.position.set(0, 0, 0);
    envGroup.add(road);

    // 2. 3D Cobblestone Wall along the right road edge (X = 1.15)
    // Irregular 4–6 sided extruded faceted stones, recessed mortar, mossy base course, and beveled coping
    const wall = buildCobblestoneWall3D({
      length: 14.0,
      height: 1.15,
      thickness: 0.24,
      stoneColor: '#948c82',
      mortarColor: '#625b52',
      seed: 77,
    });
    wall.rotation.y = Math.PI / 2;
    wall.position.set(1.15, 0, 0);
    envGroup.add(wall);

    // 3. Realistic 3D Trees with curved tapered trunks, CatmullRom branches, and botanical sprig foliage
    // Tree 1: Left roadside verge tree with full visible trunk, roots, branches, and lush leaf cards
    const tree1 = buildRealisticTree3D({
      height: 3.3,
      trunkRadius: 0.13,
      crownRadius: 1.25,
      foliageColor: '#4e8236',
      barkColor: '#4d3929',
      seed: 101,
    });
    tree1.position.set(-1.45, 0, -1.5);
    envGroup.add(tree1);

    // Tree 2: Right tree behind the wall, arching over the cobblestones
    const tree2 = buildRealisticTree3D({
      height: 3.6,
      trunkRadius: 0.14,
      crownRadius: 1.30,
      foliageColor: '#5a9240',
      barkColor: '#463425',
      seed: 202,
    });
    tree2.position.set(1.75, 0, -0.6);
    envGroup.add(tree2);

    // Tree 3: Background tree down the road vista
    const tree3 = buildRealisticTree3D({
      height: 4.2,
      trunkRadius: 0.15,
      crownRadius: 1.35,
      foliageColor: '#3c6e28',
      barkColor: '#423122',
      seed: 303,
    });
    tree3.position.set(-0.4, 0, -5.2);
    envGroup.add(tree3);

    // 4. Character at [0, 0, 0] with clean, flush footing
    // Clear separation between 2.5D character (with ink outlines) and 3D environment (zero ink outlines)
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

    // Smooth deterministic breeze sway on branches and leaf sprigs
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

export const EnvironmentShowcase = ({viewMode = 'master'}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#d0cbc1'}}>
      <ThreeCanvas
        width={720}
        height={1280}
        shadows={{type: THREE.PCFSoftShadowMap}}
        camera={{fov: 38, near: 0.1, far: 50, position: [0.35, 1.55, 4.2]}}
      >
        <EnvironmentStageSetup viewMode={viewMode} />
        <EnvironmentScene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const EnvironmentTreeCloseup = () => <EnvironmentShowcase viewMode="tree" />;
export const EnvironmentWallCloseup = () => <EnvironmentShowcase viewMode="wall" />;
export const EnvironmentRoadCloseup = () => <EnvironmentShowcase viewMode="road" />;
