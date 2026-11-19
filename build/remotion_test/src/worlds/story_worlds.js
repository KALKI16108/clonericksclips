import * as THREE from 'three';
import {ground, box, outlined, toonMat, paintedTexture, signBoard} from '../kit.js';
import {makeCharacter} from '../char3.js';

// Helper to make a low-poly seagull
function makeSeagull() {
  const g = new THREE.Group();
  const mat = toonMat('#f5efe6');
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), mat);
  body.rotation.x = Math.PI / 2.3;
  outlined(body, {thickness: 0.015});
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), mat);
  head.position.set(0, 0.12, 0.22);
  outlined(head, {thickness: 0.015});
  g.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), toonMat('#d4a037'));
  beak.rotation.x = -Math.PI / 2;
  beak.position.set(0, 0.1, 0.32);
  g.add(beak);

  const wingL = box(0.3, 0.02, 0.15, toonMat('#686c75'), {thickness: 0.015});
  wingL.position.set(-0.2, 0.06, 0.02);
  wingL.rotation.z = -0.2;
  g.add(wingL);

  const wingR = box(0.3, 0.02, 0.15, toonMat('#686c75'), {thickness: 0.015});
  wingR.position.set(0.2, 0.06, 0.02);
  wingR.rotation.z = 0.2;
  g.add(wingR);

  return g;
}

// Helper to make a 3D sedan car
function makeCar({color = '#eee1d7', crushed = false} = {}) {
  const g = new THREE.Group();
  const bodyMat = toonMat(paintedTexture(color, {seed: 12, scratches: crushed ? 20 : 4}));

  // Lower chassis
  const chassis = box(1.8, 0.6, 3.6, bodyMat, {thickness: 0.025});
  chassis.position.y = 0.55;
  g.add(chassis);

  // Cabin / Roof
  if (!crushed) {
    const cabin = box(1.5, 0.65, 1.8, bodyMat, {thickness: 0.025});
    cabin.position.set(0, 1.15, -0.2);
    g.add(cabin);

    // Windshield
    const glass = box(1.4, 0.5, 0.04, toonMat('#6f8fa8'), {thickness: 0.015});
    glass.position.set(0, 1.15, 0.72);
    glass.rotation.x = 0.3;
    g.add(glass);
  } else {
    // Crushed flat roof
    const crushedRoof = box(1.6, 0.15, 1.9, bodyMat, {thickness: 0.025});
    crushedRoof.position.set(0, 0.78, -0.2);
    crushedRoof.rotation.z = 0.08;
    g.add(crushedRoof);
  }

  // 4 Wheels
  const wheelMat = toonMat('#2d2d23');
  for (const x of [-0.95, 0.95]) {
    for (const z of [-1.1, 1.1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.32, z);
      wheel.castShadow = true;
      outlined(wheel, {thickness: 0.02});
      g.add(wheel);
    }
  }

  // Bumpers
  const bumperF = box(1.9, 0.15, 0.2, toonMat('#cec4b4'), {thickness: 0.02});
  bumperF.position.set(0, 0.4, 1.85);
  g.add(bumperF);

  const bumperR = box(1.9, 0.15, 0.2, toonMat('#cec4b4'), {thickness: 0.02});
  bumperR.position.set(0, 0.4, -1.85);
  g.add(bumperR);

  return g;
}

// -------------------------------------------------------------
// SHOT 1: George packing dynamite under whale (x = 0)
// -------------------------------------------------------------
export function buildShot1(x = 0) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 11));

  // Beached whale body positioned in midground
  const whaleMat = toonMat(paintedTexture('#443e40', {seed: 7, stains: 8}));
  const whale = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 6.5, 12), whaleMat);
  whale.rotation.z = Math.PI / 2;
  whale.position.set(0.6, 1.0, -2.4);
  whale.castShadow = true;
  outlined(whale, {thickness: 0.035});
  g.add(whale);

  // Red dynamite sticks neatly on sand in foreground
  const dynMat = toonMat('#e5525b');
  for (let i = 0; i < 5; i++) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), dynMat);
    stick.rotation.z = Math.PI / 2 + (i * 0.12);
    stick.position.set(-0.15 + (i * 0.12), 0.06, 1.05);
    outlined(stick, {thickness: 0.01});
    g.add(stick);
  }

  // Open dynamite crate
  const crate = box(0.65, 0.4, 0.45, toonMat(paintedTexture('#b8423f', {seed: 5})), {thickness: 0.02});
  crate.position.set(-0.65, 0.2, 0.95);
  g.add(crate);

  // George crouching beside crate
  const george = makeCharacter({palette: 'engineer', hat: 'hard', seed: 42});
  george.position.set(0.1, 0, 0.8);
  g.add(george);

  return {group: g, characters: [george]};
}

// -------------------------------------------------------------
// SHOT 2: Crowd holding noses around rotting carcass (x = 40)
// -------------------------------------------------------------
export function buildShot2(x = 40) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 12));

  // Whale carcass in midground
  const whaleMat = toonMat(paintedTexture('#3d3739', {seed: 8, stains: 14}));
  const whale = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.75, 6.8, 12), whaleMat);
  whale.rotation.z = Math.PI / 2;
  whale.position.set(0.2, 1.1, -3.2);
  outlined(whale, {thickness: 0.035});
  g.add(whale);

  // Stink fumes: curved wavy stink trails
  for (let i = -1; i <= 1; i++) {
    const fume = box(0.08, 1.1, 0.08, toonMat('#847864'), {thickness: 0.015});
    fume.position.set(i * 1.2, 2.6, -3.2);
    fume.rotation.z = i * 0.22;
    g.add(fume);
  }

  // 3 Spectators tightly arranged across the 9:16 vertical view
  const c1 = makeCharacter({palette: 'clerk', hat: 'bowler', seed: 101});
  c1.position.set(-0.85, 0, 0.85);
  g.add(c1);

  const c2 = makeCharacter({palette: 'boss', hat: 'top', glasses: true, seed: 102});
  c2.position.set(0.0, 0, 1.05);
  g.add(c2);

  const c3 = makeCharacter({palette: 'worker', hat: 'cap', seed: 103});
  c3.position.set(0.85, 0, 0.85);
  g.add(c3);

  return {group: g, characters: [c1, c2, c3]};
}

// -------------------------------------------------------------
// SHOT 3: George with whiteboard plan and seagulls (x = 80)
// -------------------------------------------------------------
export function buildShot3(x = 80) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 13));

  // Plan Whiteboard scaled and positioned to the right of George
  const board = signBoard('PLAN: DYNAMITE -> SEAGULLS', 2.1, 1.05);
  board.position.set(0.65, 1.48, -0.3);
  g.add(board);

  // Sand dune with seagulls in background right
  const mound = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.85, 8), toonMat('#c2a075'));
  mound.position.set(1.9, 0.42, -0.7);
  outlined(mound, {thickness: 0.025});
  g.add(mound);

  const gull1 = makeSeagull();
  gull1.position.set(1.7, 1.0, -0.6);
  g.add(gull1);

  const gull2 = makeSeagull();
  gull2.position.set(2.1, 0.95, -0.8);
  gull2.rotation.y = -0.5;
  g.add(gull2);

  // George presenting clearly on left
  const george = makeCharacter({palette: 'engineer', hat: 'hard', seed: 104});
  george.position.set(-0.7, 0, 0.85);
  g.add(george);

  return {group: g, characters: [george]};
}

// -------------------------------------------------------------
// SHOT 4: Veteran pleading before towering dynamite crates (x = 120)
// -------------------------------------------------------------
export function buildShot4(x = 120) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 14));

  // Towering pyramid of red dynamite crates directly behind / beside Veteran
  const crateMat = toonMat(paintedTexture('#c43e38', {seed: 20}));
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < (4 - row); col++) {
      const c = box(0.65, 0.45, 0.55, crateMat, {thickness: 0.022});
      c.position.set(0.35 + (col * 0.7) + (row * 0.35), 0.225 + (row * 0.47), -0.3);
      g.add(c);
    }
  }

  // Veteran pleading framed in center-left with worried expression
  const veteran = makeCharacter({palette: 'veteran', hat: 'cap', expression: 'worried', seed: 105});
  veteran.position.set(-0.35, 0, 0.85);
  g.add(veteran);

  return {group: g, characters: [veteran]};
}

// -------------------------------------------------------------
// SHOT 5: George behind barricade gripping plunger (x = 160)
// -------------------------------------------------------------
export function buildShot5(x = 160) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 15));

  // Highway barrier placed in front of George
  const barrier = box(2.6, 0.85, 0.25, toonMat('#cec4b4'), {thickness: 0.025});
  barrier.position.set(0, 0.425, 0.8);
  g.add(barrier);

  // Dynamite plunger box mounted on barrier
  const plungerBox = box(0.28, 0.35, 0.28, toonMat('#6b4a2e'), {thickness: 0.02});
  plungerBox.position.set(0.2, 0.9, 0.8);
  g.add(plungerBox);

  // Plunger vertical metal rod
  const rod = box(0.04, 0.25, 0.04, toonMat('#2d2d23'), {thickness: 0.01});
  rod.position.set(0.2, 1.15, 0.8);
  g.add(rod);

  // Plunger T-handle
  const tHandle = box(0.22, 0.05, 0.05, toonMat('#2d2d23'), {thickness: 0.015});
  tHandle.position.set(0.2, 1.3, 0.8);
  g.add(tHandle);

  // Black detonator wire trailing into distance
  const wire = box(0.03, 0.03, 7.0, toonMat('#24231f'));
  wire.position.set(0.2, 0.05, -2.5);
  g.add(wire);

  // George crouching right behind the barrier
  const george = makeCharacter({palette: 'engineer', hat: 'hard', seed: 106});
  george.position.set(-0.25, 0, 0.55);
  g.add(george);

  return {group: g, characters: [george]};
}

// -------------------------------------------------------------
// SHOT 6: Massive explosion plume on beach (x = 200)
// -------------------------------------------------------------
export function buildShot6(x = 200) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 16));

  // Bright, stylized fiery explosion cloud: orange, cream, and warm dust
  const smokeOrange = toonMat(paintedTexture('#e5525b', {seed: 31}));
  const smokeCream = toonMat(paintedTexture('#f4e2b8', {seed: 32}));
  const smokeDust = toonMat(paintedTexture('#9d8272', {seed: 30}));

  // Lower fiery base
  const b1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8), smokeOrange);
  b1.position.set(0, 1.6, -2.0);
  outlined(b1, {thickness: 0.04});
  g.add(b1);

  // Main central dust plume
  const b2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5), smokeDust);
  b2.position.set(0.3, 3.5, -2.2);
  outlined(b2, {thickness: 0.045});
  g.add(b2);

  // Upper billowing cream mushroom cap
  const b3 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.9), smokeCream);
  b3.position.set(-0.2, 5.6, -2.5);
  outlined(b3, {thickness: 0.045});
  g.add(b3);

  // Top blast cap
  const b4 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9), smokeOrange);
  b4.position.set(0.1, 7.5, -2.7);
  outlined(b4, {thickness: 0.035});
  g.add(b4);

  // Flying debris chunks
  for (let i = 0; i < 6; i++) {
    const chunk = box(0.3, 0.22, 0.3, smokeOrange, {thickness: 0.02});
    chunk.position.set((i - 2.5) * 1.3, 2.5 + (i % 3) * 1.6, -0.8 + (i % 2));
    chunk.rotation.set(i, i * 0.5, i * 0.2);
    g.add(chunk);
  }

  return {group: g, characters: []};
}

// -------------------------------------------------------------
// SHOT 7: Shocked crowd looking up as blubber rains (x = 240)
// -------------------------------------------------------------
export function buildShot7(x = 240) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 17));

  // 3 Characters looking up in frozen shock with disc eyes
  const george = makeCharacter({palette: 'engineer', hat: 'hard', expression: 'shock', seed: 107});
  george.position.set(-0.75, 0, 0.8);
  g.add(george);

  const veteran = makeCharacter({palette: 'veteran', hat: 'cap', expression: 'shock', seed: 108});
  veteran.position.set(0.0, 0, 0.95);
  g.add(veteran);

  const clerk = makeCharacter({palette: 'clerk', hat: 'bowler', expression: 'shock', seed: 109});
  clerk.position.set(0.75, 0, 0.8);
  g.add(clerk);

  // Raining blubber slabs suspended visibly in the sky overhead
  const blubberMat = toonMat(paintedTexture('#2e2527', {seed: 40, stains: 8}));
  for (let i = 0; i < 7; i++) {
    const blob = box(0.42, 0.28, 0.32, blubberMat, {thickness: 0.025});
    blob.position.set((i - 3) * 0.65, 2.4 + (i * 0.4), 0.5 + (i % 2) * 0.4);
    blob.rotation.set(0.4 * i, 0.2 * i, 0.5 * i);
    g.add(blob);
  }

  return {group: g, characters: [george, veteran, clerk]};
}

// -------------------------------------------------------------
// SHOT 8: Coffee-table slab crushing brand new sedan (x = 280)
// -------------------------------------------------------------
export function buildShot8(x = 280) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 18));

  // Crushed cream sedan at a 3/4 perspective angle
  const car = makeCar({color: '#eee1d7', crushed: true});
  car.position.set(0, 0, 0.0);
  car.rotation.y = 0.42;
  g.add(car);

  // Massive coffee-table sized blubber slab resting on crushed roof
  const slabMat = toonMat(paintedTexture('#2e2527', {seed: 50, stains: 15}));
  const slab = box(1.6, 0.42, 1.2, slabMat, {thickness: 0.035});
  slab.position.set(0.05, 0.95, -0.05);
  slab.rotation.y = 0.42;
  slab.rotation.z = -0.06;
  g.add(slab);

  return {group: g, characters: []};
}

// -------------------------------------------------------------
// SHOT 9: Veteran standing beside crushed car holding keys (x = 320)
// -------------------------------------------------------------
export function buildShot9(x = 320) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 19));

  // Crushed car on the right
  const car = makeCar({color: '#eee1d7', crushed: true});
  car.position.set(0.95, 0, -0.2);
  car.rotation.y = 0.35;
  g.add(car);

  // Blubber on car roof
  const slab = box(1.5, 0.38, 1.1, toonMat('#2e2527'), {thickness: 0.03});
  slab.position.set(0.98, 0.95, -0.2);
  slab.rotation.y = 0.35;
  g.add(slab);

  // Seagull perched visibly on car hood facing camera
  const gull = makeSeagull();
  gull.position.set(0.85, 0.95, 0.7);
  gull.rotation.y = 0.2;
  g.add(gull);

  // Veteran standing on left holding dangling keys with deadpan expression
  const veteran = makeCharacter({palette: 'veteran', hat: 'cap', expression: 'deadpan', seed: 110});
  veteran.position.set(-0.45, 0, 0.85);
  g.add(veteran);

  // Golden car keys dangling prominently from hand
  const keyMat = toonMat('#d4a037');
  const key = box(0.08, 0.18, 0.03, keyMat, {thickness: 0.01});
  key.position.set(-0.22, 0.62, 0.88);
  g.add(key);

  return {group: g, characters: [veteran]};
}

export const WORLDS = {
  shot1: buildShot1,
  shot2: buildShot2,
  shot3: buildShot3,
  shot4: buildShot4,
  shot5: buildShot5,
  shot6: buildShot6,
  shot7: buildShot7,
  shot8: buildShot8,
  shot9: buildShot9,
};
