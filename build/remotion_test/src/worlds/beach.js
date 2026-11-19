import * as THREE from 'three';
import {ground, box, outlined, toonMat, paintedTexture, signBoard} from '../kit.js';
import {makeCharacter} from '../char3.js';

export function buildBeach(x = 0) {
  const g = new THREE.Group();
  g.position.x = x;

  // 1. Warm sandy ground (palette #c5a378)
  const sand = ground(80, '#c5a378', 15);
  g.add(sand);

  // Background coastal sand dunes ridge at z = -14
  const duneMat = toonMat(paintedTexture('#9d8262', {seed: 22, stains: 12}));
  for (let i = -3; i <= 3; i++) {
    const dune = new THREE.Mesh(new THREE.ConeGeometry(4.5 + Math.abs(i) * 0.5, 3.2, 7), duneMat);
    dune.position.set(i * 4.2, 0.8, -14);
    dune.rotation.y = i * 0.4;
    outlined(dune, {thickness: 0.035});
    g.add(dune);
  }

  // 2. Foreground blurred post/dune (z = 4.8) - near the camera at start (z = 6.8)
  const fgPost = box(0.25, 1.4, 0.25, toonMat('#5c4f3e'), {thickness: 0.025});
  fgPost.position.set(-1.8, 0.7, 4.2);
  g.add(fgPost);

  // 3. Wooden guardrails & fence along the left (x = -2.5 to -3.0)
  for (let i = 0; i < 6; i++) {
    const post = box(0.18, 1.1, 0.18, toonMat(paintedTexture('#7d7466', {seed: 10 + i})), {thickness: 0.02});
    post.position.set(-2.2, 0.55, -2 + i * 1.5);
    g.add(post);
  }
  const rail = box(0.1, 0.14, 9.0, toonMat('#5c4f3e'), {thickness: 0.02});
  rail.position.set(-2.2, 0.9, 1.75);
  g.add(rail);

  // 4. Red Dynamite Crates stack (palette #e5525b & #5c4f3e)
  const crateMat = toonMat(paintedTexture('#b8423f', {seed: 4, scratches: 12}));
  const crate1 = box(0.8, 0.55, 0.6, crateMat, {thickness: 0.022});
  crate1.position.set(1.6, 0.275, 0.5);
  g.add(crate1);

  const crate2 = box(0.75, 0.5, 0.55, crateMat, {thickness: 0.022});
  crate2.position.set(1.55, 0.8, 0.5);
  crate2.rotation.y = 0.12;
  g.add(crate2);

  const crate3 = box(0.7, 0.5, 0.55, crateMat, {thickness: 0.022});
  crate3.position.set(2.3, 0.25, 0.7);
  crate3.rotation.y = -0.15;
  g.add(crate3);

  // 5. In-world Beach sign ("FLORENCE BEACH")
  const sign = signBoard('FLORENCE BEACH', 2.2, 0.7);
  sign.position.set(-2.2, 2.0, 0.0);
  sign.rotation.y = 0.35;
  g.add(sign);

  // 6. Background 3D Beached Whale silhouette (resting at z = -4.5, x = 0.5)
  const whaleGroup = new THREE.Group();
  whaleGroup.position.set(1.2, 0, -4.5);
  whaleGroup.rotation.y = -0.25;

  const whaleMat = toonMat(paintedTexture('#3a3536', {seed: 7, stains: 10}));
  const whaleBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 6.5, 12), whaleMat);
  whaleBody.rotation.z = Math.PI / 2;
  whaleBody.position.y = 1.0;
  whaleBody.castShadow = whaleBody.receiveShadow = true;
  outlined(whaleBody, {thickness: 0.03});
  whaleGroup.add(whaleBody);

  // Whale head bulge
  const whaleHead = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8), whaleMat);
  whaleHead.position.set(-3.2, 1.0, 0);
  whaleHead.scale.set(1.2, 0.9, 0.9);
  whaleHead.castShadow = true;
  outlined(whaleHead, {thickness: 0.03});
  whaleGroup.add(whaleHead);

  // Whale tail fin
  const tail = box(0.2, 1.8, 0.8, whaleMat, {thickness: 0.025});
  tail.position.set(3.4, 1.2, 0);
  tail.rotation.x = 0.4;
  whaleGroup.add(tail);

  g.add(whaleGroup);

  // 7. The 2D Cutout Character (George, Engineer with hard hat #d2ac7f and vest #e5525b)
  // Positioned at midground (x = 0, z = 0.8)
  const character = makeCharacter({
    palette: 'engineer',
    hat: 'hard',
    glasses: false,
    seed: 42
  });
  character.position.set(0.0, 0.0, 0.8);
  g.add(character);

  return {group: g, characters: [character]};
}

export const WORLDS = {beach: buildBeach};
