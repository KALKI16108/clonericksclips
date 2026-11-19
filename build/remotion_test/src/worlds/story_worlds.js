import * as THREE from 'three';
import {ground, box, outlined, toonMat, paintedTexture, INK} from '../kit.js';
import {makeCharacter} from '../char3.js';

// ============================================================================
// SIGNAGE & TEXTURE HELPERS (100% In-World Physical Signage)
// ============================================================================

// Canvas texture generator for wooden signposts and plaques
function createSignTexture(lines, {
  w = 512,
  h = 256,
  bg = '#e3d2b2',
  fg = '#24231f',
  font = 'bold 36px Georgia, serif',
  border = true,
  woodGrain = true,
} = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Base background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Wood grain / weathering streaks
  if (woodGrain) {
    ctx.strokeStyle = 'rgba(60, 40, 25, 0.08)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      const y = (i * 15) + (Math.sin(i) * 5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + 10, w * 0.7, y - 8, w, y + 4);
      ctx.stroke();
    }
  }

  // Border
  if (border) {
    ctx.strokeStyle = fg;
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);
  }

  // Text lines
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lineCount = lines.length;
  const startY = h / 2 - ((lineCount - 1) * 24);
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + (i * 48), w - 40);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Stenciled crate front texture
function createCrateTexture(lines, {w = 512, h = 256, bg = '#b8423f'} = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Wood planks horizontal lines
  ctx.strokeStyle = '#24231f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.33); ctx.lineTo(w, h * 0.33);
  ctx.moveTo(0, h * 0.66); ctx.lineTo(w, h * 0.66);
  ctx.stroke();

  // Stenciled military block text
  ctx.fillStyle = '#1b1817';
  ctx.font = 'bold 38px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const startY = h / 2 - ((lines.length - 1) * 26);
  lines.forEach((l, i) => {
    ctx.fillText(l, w / 2, startY + (i * 52), w - 40);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Hand-drawn Tactical Whiteboard Texture
function createWhiteboardTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Whiteboard face
  ctx.fillStyle = '#f8f6f0';
  ctx.fillRect(0, 0, 1024, 512);

  // Border
  ctx.strokeStyle = '#24231f';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 1004, 492);

  // Title
  ctx.fillStyle = '#1b1817';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('OPERATION: WHALE DISPOSAL', 512, 65);

  // Divider line
  ctx.beginPath();
  ctx.moveTo(80, 95); ctx.lineTo(944, 95);
  ctx.lineWidth = 5; ctx.stroke();

  // Step 1: Whale + Dynamite
  ctx.fillStyle = '#443e40';
  ctx.beginPath();
  ctx.ellipse(220, 240, 110, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#24231f';
  ctx.lineWidth = 6; ctx.stroke();

  // Tail fin
  ctx.beginPath();
  ctx.moveTo(110, 240); ctx.lineTo(70, 200); ctx.lineTo(70, 280); ctx.closePath();
  ctx.fillStyle = '#443e40'; ctx.fill(); ctx.stroke();

  // Dynamite bundle under whale
  ctx.fillStyle = '#e5525b';
  ctx.fillRect(200, 295, 80, 25);
  ctx.strokeRect(200, 295, 80, 25);
  ctx.fillStyle = '#1b1817';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('1/2 TON DYNAMITE', 240, 345);

  // Arrow 1
  ctx.strokeStyle = '#b8423f';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(370, 240); ctx.lineTo(460, 240);
  ctx.lineTo(440, 220); ctx.moveTo(460, 240); ctx.lineTo(440, 260);
  ctx.stroke();

  // Step 2: Explosion burst
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  const cx = 560, cy = 240;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const r1 = 90, r2 = 45;
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a + Math.PI/16) * r2, cy + Math.sin(a + Math.PI/16) * r2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#24231f';
  ctx.lineWidth = 6; ctx.stroke();

  ctx.fillStyle = '#e5525b';
  ctx.font = 'bold 36px Impact, sans-serif';
  ctx.fillText('KA-BOOM!', 560, 248);

  // Arrow 2
  ctx.strokeStyle = '#b8423f';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(670, 240); ctx.lineTo(760, 240);
  ctx.lineTo(740, 220); ctx.moveTo(760, 240); ctx.lineTo(740, 260);
  ctx.stroke();

  // Step 3: Seagulls
  ctx.fillStyle = '#1b1817';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.fillText('v   v', 860, 220);
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillStyle = '#186e61';
  ctx.fillText('SEAGULLS', 860, 280);
  ctx.fillText('CLEANUP CREW', 860, 310);
  ctx.fillStyle = '#b8423f';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('(COST: $0.00)', 860, 345);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Dealership Billboard Texture (Shot 9)
function createBillboardTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Background
  ctx.fillStyle = '#f7f1e5';
  ctx.fillRect(0, 0, 1024, 512);

  // Vintage blue & red border
  ctx.strokeStyle = '#224263';
  ctx.lineWidth = 18;
  ctx.strokeRect(12, 12, 1000, 488);
  ctx.strokeStyle = '#d94b36';
  ctx.lineWidth = 6;
  ctx.strokeRect(26, 26, 972, 460);

  // Header
  ctx.fillStyle = '#224263';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('WALT PEFFER BUICK', 512, 95);

  // Dealership Punchline
  ctx.fillStyle = '#d94b36';
  ctx.font = 'bold 50px "Impact", sans-serif';
  ctx.fillText('★ A WHALE OF A DEAL TODAY! ★', 512, 185);

  // Smiling Whale Cartoon Graphic
  ctx.fillStyle = '#4c87b9';
  ctx.beginPath();
  ctx.ellipse(512, 320, 140, 65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#24231f';
  ctx.lineWidth = 7;
  ctx.stroke();

  // Whale smile & eye
  ctx.beginPath();
  ctx.arc(430, 310, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.beginPath();
  ctx.arc(430, 310, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#24231f'; ctx.fill();

  ctx.beginPath();
  ctx.arc(435, 340, 35, 0.2, Math.PI * 0.8);
  ctx.lineWidth = 5; ctx.stroke();

  // Water spout
  ctx.strokeStyle = '#68b5e8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(512, 255); ctx.lineTo(512, 220);
  ctx.moveTo(512, 230); ctx.lineTo(490, 205);
  ctx.moveTo(512, 230); ctx.lineTo(534, 205);
  ctx.stroke();

  // Footer
  ctx.fillStyle = '#24231f';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText('FLORENCE, OR — NEW & USED AUTOMOBILES', 512, 445);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ----------------------------------------------------------------------------
// 3D PHYSICAL SIGN & PROP CONSTRUCTORS
// ----------------------------------------------------------------------------

export function makeWoodSign({
  lines = ['SIGN'],
  w = 1.6,
  h = 0.65,
  postH = 1.4,
  bg = '#dfcaa0',
  fg = '#24231f',
  font = 'bold 36px Georgia, serif',
} = {}) {
  const g = new THREE.Group();
  const woodMat = toonMat('#6b4a2e');

  // Vertical support post
  const post = box(0.12, postH, 0.12, woodMat, {thickness: 0.018});
  post.position.y = postH / 2;
  g.add(post);

  // Sign face box
  const tex = createSignTexture(lines, {w: 512, h: Math.round(512 * h / w), bg, fg, font});
  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), [
    woodMat, woodMat, woodMat, woodMat,
    new THREE.MeshBasicMaterial({map: tex}),
    woodMat,
  ]);
  signMesh.position.y = postH - (h * 0.35);
  outlined(signMesh, {thickness: 0.02});
  g.add(signMesh);

  return g;
}

export function makeStenciledCrate({
  lines = ['DANGER', 'EXPLOSIVES'],
  w = 0.65,
  h = 0.45,
  d = 0.55,
  bg = '#b8423f',
} = {}) {
  const woodMat = toonMat(paintedTexture(bg, {seed: 14}));
  const tex = createCrateTexture(lines, {w: 512, h: 256, bg});
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [
    woodMat, woodMat, woodMat, woodMat,
    new THREE.MeshBasicMaterial({map: tex}),
    woodMat,
  ]);
  m.castShadow = true;
  return outlined(m, {thickness: 0.022});
}

export function makeSeaGrassTuft(scale = 1.0) {
  const g = new THREE.Group();
  const grassMat = toonMat('#7a8d56');
  for (let i = 0; i < 7; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.04 * scale, 0.75 * scale, 4), grassMat);
    blade.position.set((i - 3) * 0.08 * scale, 0.375 * scale, (i % 2) * 0.06 * scale);
    blade.rotation.z = (i - 3) * 0.09;
    blade.rotation.x = ((i % 3) - 1) * 0.08;
    outlined(blade, {thickness: 0.012});
    g.add(blade);
  }
  return g;
}

export function makeDriftwoodLog(length = 2.2, r = 0.16) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.85, r, length, 8),
    toonMat(paintedTexture('#6d5e50', {seed: 9, scratches: 12}))
  );
  m.rotation.z = Math.PI / 2;
  m.castShadow = true;
  return outlined(m, {thickness: 0.02});
}

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

    // Rear window with Dealership Decal
    const decalTex = createSignTexture(['WALT PEFFER MOTORS', 'A WHALE OF A DEAL!'], {
      w: 512, h: 180, bg: '#f1e6d4', fg: '#b83b32', font: 'bold 32px sans-serif'
    });
    const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.42), new THREE.MeshBasicMaterial({map: decalTex}));
    decalMesh.position.set(0, 1.15, -1.12);
    decalMesh.rotation.y = Math.PI;
    g.add(decalMesh);
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

  // Bumpers with stamped metal license plate
  const bumperF = box(1.9, 0.15, 0.2, toonMat('#cec4b4'), {thickness: 0.02});
  bumperF.position.set(0, 0.4, 1.85);
  g.add(bumperF);

  const plateTex = createSignTexture(['OREGON 70', 'DEAL'], {
    w: 256, h: 128, bg: '#f2e8cf', fg: '#2b3a4a', font: 'bold 36px monospace', border: true
  });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.2), new THREE.MeshBasicMaterial({map: plateTex}));
  plate.position.set(0, 0.4, 1.96);
  g.add(plate);

  const bumperR = box(1.9, 0.15, 0.2, toonMat('#cec4b4'), {thickness: 0.02});
  bumperR.position.set(0, 0.4, -1.85);
  g.add(bumperR);

  return g;
}

// ============================================================================
// 9 DETAILED SHOT WORLD CONSTRUCTORS (Matching script/camera_plan.md)
// ============================================================================

// -------------------------------------------------------------
// SHOT 1: George packing dynamite under whale (x = 0)
// -------------------------------------------------------------
export function buildShot1(x = 0) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 11));

  // FOREGROUND LAYER (Z: +2.0m to +2.8m): Parallax driftwood & sea grass
  const log = makeDriftwoodLog(2.4, 0.18);
  log.position.set(0.9, 0.14, 2.3);
  log.rotation.y = -0.4;
  g.add(log);

  const grass1 = makeSeaGrassTuft(1.2);
  grass1.position.set(-1.1, 0, 2.1);
  g.add(grass1);

  const grass2 = makeSeaGrassTuft(0.9);
  grass2.position.set(1.4, 0, 2.6);
  g.add(grass2);

  // IN-WORLD PHYSICAL SIGN 1: Carved wooden boundary marker in sand
  const sign = makeWoodSign({
    lines: ['OREGON HWY DEPT', 'DISTRICT 4 — JETTY'],
    w: 1.5,
    h: 0.65,
    postH: 1.25,
    bg: '#d6c098',
    fg: '#24231f',
    font: 'bold 32px Georgia, serif'
  });
  sign.position.set(-1.5, 0, 1.3);
  sign.rotation.y = 0.25;
  g.add(sign);

  // MIDGROUND LAYER (Z: +0.7m to +1.1m): George & Dynamite Crate
  // In-World Stenciled Dynamite Crate
  const crate = makeStenciledCrate({
    lines: ['DANGER', 'HIGH EXPLOSIVES', '50 LBS NET'],
    w: 0.7,
    h: 0.42,
    d: 0.5,
    bg: '#b8423f'
  });
  crate.position.set(-0.65, 0.21, 0.95);
  crate.rotation.y = 0.15;
  g.add(crate);

  // 5 Red Dynamite Sticks on sand
  const dynMat = toonMat('#e5525b');
  for (let i = 0; i < 5; i++) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), dynMat);
    stick.rotation.z = Math.PI / 2 + (i * 0.12);
    stick.position.set(-0.15 + (i * 0.12), 0.06, 1.05);
    outlined(stick, {thickness: 0.01});
    g.add(stick);
  }

  // George crouching beside crate
  const george = makeCharacter({palette: 'engineer', hat: 'hard', seed: 42});
  george.position.set(0.1, 0, 0.8);
  g.add(george);

  // BACKGROUND LAYER (Z: -2.4m to -12.0m): Beached Whale Carcass & Dunes
  const whaleMat = toonMat(paintedTexture('#443e40', {seed: 7, stains: 8}));
  const whale = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 6.5, 12), whaleMat);
  whale.rotation.z = Math.PI / 2;
  whale.position.set(0.6, 1.0, -2.4);
  whale.castShadow = true;
  outlined(whale, {thickness: 0.035});
  g.add(whale);

  // Background sand dunes
  const dune = new THREE.Mesh(new THREE.ConeGeometry(5.0, 1.8, 8), toonMat('#baa893'));
  dune.position.set(-3.5, 0.9, -8.0);
  outlined(dune, {thickness: 0.03});
  g.add(dune);

  return {group: g, characters: [george]};
}

// -------------------------------------------------------------
// SHOT 2: Crowd holding noses around rotting carcass (x = 40)
// -------------------------------------------------------------
export function buildShot2(x = 40) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 12));

  // FOREGROUND LAYER (Z: +2.2m to +2.8m): Crowd barrier posts & yellow hazard rope
  const ropeMat = toonMat('#f2c14e');
  const postMat = toonMat('#5c4a38');
  for (const px of [-1.5, 0.0, 1.5]) {
    const post = box(0.1, 0.9, 0.1, postMat, {thickness: 0.015});
    post.position.set(px, 0.45, 2.4);
    g.add(post);
  }
  const rope = box(3.2, 0.04, 0.04, ropeMat, {thickness: 0.01});
  rope.position.set(0, 0.75, 2.4);
  g.add(rope);

  // IN-WORLD PHYSICAL SIGN 2: Beach Closed Bio-Hazard Notice Board
  const noticeBoard = makeWoodSign({
    lines: ['BEACH CLOSED', 'ROTTING CARCASS', 'ODOR HAZARD'],
    w: 1.8,
    h: 0.75,
    postH: 1.45,
    bg: '#f3e8d2',
    fg: '#8a2b2b',
    font: 'bold 34px Georgia, serif'
  });
  noticeBoard.position.set(1.9, 0, 1.4);
  noticeBoard.rotation.y = -0.3;
  g.add(noticeBoard);

  // MIDGROUND LAYER (Z: +0.85m to +1.05m): 3 Spectators holding noses
  const c1 = makeCharacter({palette: 'clerk', hat: 'bowler', seed: 101});
  c1.position.set(-0.85, 0, 0.85);
  g.add(c1);

  const c2 = makeCharacter({palette: 'boss', hat: 'top', glasses: true, seed: 102});
  c2.position.set(0.0, 0, 1.05);
  g.add(c2);

  const c3 = makeCharacter({palette: 'worker', hat: 'cap', seed: 103});
  c3.position.set(0.85, 0, 0.85);
  g.add(c3);

  // BACKGROUND LAYER (Z: -3.2m to -12.0m): Rotting Whale Carcass & Stink Fumes
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

  return {group: g, characters: [c1, c2, c3]};
}

// -------------------------------------------------------------
// SHOT 3: George with whiteboard plan and seagulls (x = 80)
// -------------------------------------------------------------
export function buildShot3(x = 80) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 13));

  // FOREGROUND LAYER (Z: +1.8m to +2.4m): Survey tripod & tall grass
  const tripodMat = toonMat('#6b4a2e');
  const leg1 = box(0.06, 1.3, 0.06, tripodMat, {thickness: 0.01});
  leg1.position.set(-1.4, 0.65, 2.0); leg1.rotation.z = 0.2; g.add(leg1);
  const leg2 = box(0.06, 1.3, 0.06, tripodMat, {thickness: 0.01});
  leg2.position.set(-1.1, 0.65, 2.2); leg2.rotation.z = -0.2; g.add(leg2);
  const grass = makeSeaGrassTuft(1.1);
  grass.position.set(-1.3, 0, 1.9); g.add(grass);

  // MIDGROUND LAYER: George on left, Whiteboard on right
  const george = makeCharacter({palette: 'engineer', hat: 'hard', seed: 104});
  george.position.set(-0.7, 0, 0.85);
  g.add(george);

  // Wooden Pointer Dowel in George's hand
  const dowel = box(0.03, 0.85, 0.03, toonMat('#d4a037'), {thickness: 0.01});
  dowel.position.set(-0.35, 1.25, 0.65);
  dowel.rotation.z = -0.65;
  g.add(dowel);

  // IN-WORLD PHYSICAL SIGN 3: Large Tactical Whiteboard on Easel
  const boardGroup = new THREE.Group();
  const boardTex = createWhiteboardTexture();
  const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 0.08), [
    toonMat('#5c4a38'), toonMat('#5c4a38'), toonMat('#5c4a38'), toonMat('#5c4a38'),
    new THREE.MeshBasicMaterial({map: boardTex}),
    toonMat('#5c4a38'),
  ]);
  outlined(boardMesh, {thickness: 0.02});
  boardGroup.add(boardMesh);

  // Easel legs
  const easelLegL = box(0.08, 1.7, 0.08, toonMat('#5c4a38'), {thickness: 0.012});
  easelLegL.position.set(-0.9, -0.2, -0.05); boardGroup.add(easelLegL);
  const easelLegR = box(0.08, 1.7, 0.08, toonMat('#5c4a38'), {thickness: 0.012});
  easelLegR.position.set(0.9, -0.2, -0.05); boardGroup.add(easelLegR);

  boardGroup.position.set(0.7, 1.45, -0.2);
  g.add(boardGroup);

  // BACKGROUND LAYER: Dune mound with 2 Seagulls
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

  return {group: g, characters: [george]};
}

// -------------------------------------------------------------
// SHOT 4: Veteran pleading before towering dynamite crates (x = 120)
// -------------------------------------------------------------
export function buildShot4(x = 120) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 14));

  // FOREGROUND LAYER (Z: +2.0m to +2.6m): Military Jerrycan & Canvas tent post
  const jerrycan = box(0.35, 0.45, 0.22, toonMat('#4b5320'), {thickness: 0.015});
  jerrycan.position.set(-1.1, 0.225, 2.2);
  jerrycan.rotation.y = 0.3;
  g.add(jerrycan);

  const tentPole = box(0.08, 2.8, 0.08, toonMat('#6b4a2e'), {thickness: 0.015});
  tentPole.position.set(1.4, 1.4, 2.4);
  g.add(tentPole);

  // IN-WORLD PHYSICAL SIGN 4: Staked Munitions Warning Sign
  const warnSign = makeWoodSign({
    lines: ['MUNITIONS DEPOT', 'KEEP MATCHES AWAY!'],
    w: 1.4,
    h: 0.6,
    postH: 1.2,
    bg: '#e8c950',
    fg: '#1b1817',
    font: 'bold 30px sans-serif'
  });
  warnSign.position.set(-1.5, 0, 1.2);
  warnSign.rotation.y = 0.3;
  g.add(warnSign);

  // MIDGROUND LAYER: Veteran pleading in center-left
  const veteran = makeCharacter({palette: 'veteran', hat: 'cap', expression: 'worried', seed: 105});
  veteran.position.set(-0.35, 0, 0.85);
  g.add(veteran);

  // BACKGROUND LAYER: Towering Pyramid of 20 Stenciled Dynamite Crates
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < (4 - row); col++) {
      const c = makeStenciledCrate({
        lines: ['DYNAMITE 40%', '20 CASES (1,000 LBS)'],
        w: 0.65,
        h: 0.45,
        d: 0.55,
        bg: '#b8423f'
      });
      c.position.set(0.35 + (col * 0.7) + (row * 0.35), 0.225 + (row * 0.47), -0.3);
      g.add(c);
    }
  }

  // Sandbag wall in background
  const sandbagMat = toonMat('#a3937b');
  for (let i = -2; i <= 2; i++) {
    const bag = box(0.8, 0.3, 0.4, sandbagMat, {thickness: 0.015});
    bag.position.set(i * 0.75 + 1.2, 0.15, -1.2);
    g.add(bag);
  }

  return {group: g, characters: [veteran]};
}

// -------------------------------------------------------------
// SHOT 5: George behind barricade gripping plunger (x = 160)
// -------------------------------------------------------------
export function buildShot5(x = 160) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 15));

  // FOREGROUND LAYER (Z: +1.6m to +2.2m): Asphalt curb & yellow hazard barrel
  const curb = box(5.0, 0.18, 0.35, toonMat('#787570'), {thickness: 0.02});
  curb.position.set(0, 0.09, 1.9);
  g.add(curb);

  const barrelMat = toonMat(paintedTexture('#d4a037', {seed: 22}));
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12), barrelMat);
  drum.position.set(-1.3, 0.45, 1.8);
  outlined(drum, {thickness: 0.02});
  g.add(drum);

  // Black detonator wire trailing across foreground
  const wire = box(0.03, 0.03, 8.0, toonMat('#24231f'));
  wire.position.set(0.2, 0.05, -2.5);
  g.add(wire);

  // IN-WORLD PHYSICAL SIGN 5: Reflective Highway Milepost Sign
  const hwySign = makeWoodSign({
    lines: ['OREGON 101', 'BLAST ZONE — 1/4 MILE'],
    w: 1.6,
    h: 0.7,
    postH: 1.5,
    bg: '#255a36',
    fg: '#ffffff',
    font: 'bold 30px sans-serif'
  });
  hwySign.position.set(1.5, 0, 1.1);
  hwySign.rotation.y = -0.25;
  g.add(hwySign);

  // MIDGROUND LAYER: Concrete Barrier & George crouching with Plunger
  const barrier = box(2.8, 0.85, 0.25, toonMat('#cec4b4'), {thickness: 0.025});
  barrier.position.set(0, 0.425, 0.8);
  g.add(barrier);

  // Oak Blasting Machine Box
  const plungerBox = box(0.28, 0.35, 0.28, toonMat('#6b4a2e'), {thickness: 0.02});
  plungerBox.position.set(0.2, 0.9, 0.8);
  g.add(plungerBox);

  // In-World Brass Machine Plaque on plunger face
  const plaqueTex = createSignTexture(['DU PONT BLASTING', 'MACHINE NO. 3'], {
    w: 256, h: 128, bg: '#d4af37', fg: '#1b1817', font: 'bold 24px monospace'
  });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({map: plaqueTex}));
  plaque.position.set(0.2, 0.9, 0.95);
  g.add(plaque);

  // Vertical Plunger Rod & T-Handle
  const rod = box(0.04, 0.25, 0.04, toonMat('#2d2d23'), {thickness: 0.01});
  rod.position.set(0.2, 1.15, 0.8);
  g.add(rod);

  const tHandle = box(0.22, 0.05, 0.05, toonMat('#2d2d23'), {thickness: 0.015});
  tHandle.position.set(0.2, 1.3, 0.8);
  g.add(tHandle);

  // George crouching behind the barrier
  const george = makeCharacter({palette: 'engineer', hat: 'hard', seed: 106});
  george.position.set(-0.25, 0, 0.55);
  g.add(george);

  // BACKGROUND LAYER: Distant telephone poles along highway
  const pole = box(0.12, 3.8, 0.12, toonMat('#4a3b32'), {thickness: 0.018});
  pole.position.set(-2.5, 1.9, -5.0);
  g.add(pole);

  return {group: g, characters: [george]};
}

// -------------------------------------------------------------
// SHOT 6: Massive explosion plume on beach (x = 200)
// -------------------------------------------------------------
export function buildShot6(x = 200) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 16));

  // FOREGROUND LAYER (Z: +5.0m to +7.0m): Flying driftwood planks & sand shockwave
  const flyPlank1 = box(0.8, 0.15, 0.08, toonMat('#5c4a38'), {thickness: 0.015});
  flyPlank1.position.set(-1.8, 2.2, 6.0);
  flyPlank1.rotation.set(0.4, 0.6, 0.8);
  g.add(flyPlank1);

  const flyPlank2 = box(0.9, 0.16, 0.08, toonMat('#5c4a38'), {thickness: 0.015});
  flyPlank2.position.set(2.0, 3.0, 5.5);
  flyPlank2.rotation.set(-0.3, -0.4, 0.5);
  g.add(flyPlank2);

  // IN-WORLD PHYSICAL SIGN 6: Tumbling Splintered Beach Signboard in midair
  const flySignTex = createSignTexture(['FLORENCE BEACH', 'ENJOY YOUR VISIT!'], {
    w: 512, h: 220, bg: '#dfcaa0', fg: '#24231f', font: 'bold 36px Georgia, serif'
  });
  const flySign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 0.06), [
    toonMat('#5c4a38'), toonMat('#5c4a38'), toonMat('#5c4a38'), toonMat('#5c4a38'),
    new THREE.MeshBasicMaterial({map: flySignTex}), toonMat('#5c4a38')
  ]);
  flySign.position.set(1.4, 4.2, 1.0);
  flySign.rotation.set(0.6, 0.8, -0.4);
  outlined(flySign, {thickness: 0.02});
  g.add(flySign);

  // MIDGROUND LAYER: Massive Multi-Tiered Low-Poly Explosion Cloud
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

  // Flying blubber & sand debris chunks
  const debrisMat = toonMat(paintedTexture('#2e2527', {seed: 35}));
  for (let i = 0; i < 8; i++) {
    const chunk = box(0.35, 0.25, 0.32, debrisMat, {thickness: 0.02});
    chunk.position.set((i - 3.5) * 1.2, 2.5 + (i % 4) * 1.5, -0.8 + (i % 2) * 0.8);
    chunk.rotation.set(i * 0.8, i * 0.5, i * 0.3);
    g.add(chunk);
  }

  // Dynamic update hook for shot 6 plume evolution
  const update = (t) => {
    const elapsed = Math.max(0, t - 26.82);
    const growth = Math.min(1.0, elapsed / 2.5);
    b1.scale.setScalar(0.7 + growth * 0.4);
    b2.scale.setScalar(0.6 + growth * 0.5);
    b3.scale.setScalar(0.4 + growth * 0.7);
    b4.scale.setScalar(0.3 + growth * 0.8);
    flySign.rotation.x = 0.6 + elapsed * 1.2;
    flySign.rotation.y = 0.8 + elapsed * 0.9;
  };

  return {group: g, characters: [], update};
}

// -------------------------------------------------------------
// SHOT 7: Shocked crowd looking up as blubber rains (x = 240)
// -------------------------------------------------------------
export function buildShot7(x = 240) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 17));

  // FOREGROUND LAYER (Z: +1.2m to +2.2m): Raining blubber slabs passing lens
  const blubberMat = toonMat(paintedTexture('#2e2527', {seed: 40, stains: 8}));
  const fallingSlabs = [];
  for (let i = 0; i < 8; i++) {
    const blob = box(0.42, 0.28, 0.32, blubberMat, {thickness: 0.025});
    blob.position.set((i - 3.5) * 0.7, 3.2 + (i * 0.4), 1.0 + (i % 3) * 0.4);
    blob.rotation.set(0.4 * i, 0.2 * i, 0.5 * i);
    g.add(blob);
    fallingSlabs.push(blob);
  }

  // IN-WORLD PHYSICAL SIGN 7: Wooden Directional Fingerpost
  const fingerpost = makeWoodSign({
    lines: ['[->] PARKING LOT', '[<-] BEACH OVERLOOK'],
    w: 1.6,
    h: 0.65,
    postH: 1.35,
    bg: '#d6c098',
    fg: '#24231f',
    font: 'bold 30px monospace'
  });
  fingerpost.position.set(1.65, 0, 1.2);
  fingerpost.rotation.y = -0.35;
  g.add(fingerpost);

  // MIDGROUND LAYER: 3 Characters looking up in frozen shock with disc eyes
  const george = makeCharacter({palette: 'engineer', hat: 'hard', expression: 'shock', seed: 107});
  george.position.set(-0.75, 0, 0.8);
  g.add(george);

  const veteran = makeCharacter({palette: 'veteran', hat: 'cap', expression: 'shock', seed: 108});
  veteran.position.set(0.0, 0, 0.95);
  g.add(veteran);

  const clerk = makeCharacter({palette: 'clerk', hat: 'bowler', expression: 'shock', seed: 109});
  clerk.position.set(0.75, 0, 0.8);
  g.add(clerk);

  // BACKGROUND LAYER: Sand dunes and leaden clouds
  const dune = new THREE.Mesh(new THREE.ConeGeometry(4.5, 1.5, 8), toonMat('#baa893'));
  dune.position.set(-2.8, 0.75, -5.0);
  outlined(dune, {thickness: 0.025});
  g.add(dune);

  const update = (t) => {
    const elapsed = Math.max(0, t - 32.28);
    fallingSlabs.forEach((s, idx) => {
      s.position.y = 4.5 - ((elapsed * 1.2 + idx * 0.5) % 4.0);
      s.rotation.x += 0.02;
    });
  };

  return {group: g, characters: [george, veteran, clerk], update};
}

// -------------------------------------------------------------
// SHOT 8: Coffee-table slab crushing brand new sedan (x = 280)
// -------------------------------------------------------------
export function buildShot8(x = 280) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 18));

  // FOREGROUND LAYER (Z: +1.8m to +2.4m): Timber parking stop & glass shards
  const curb = box(3.2, 0.16, 0.22, toonMat('#6b4a2e'), {thickness: 0.015});
  curb.position.set(0, 0.08, 2.0);
  g.add(curb);

  // Glass shards
  const glassMat = toonMat('#6f8fa8');
  for (let i = 0; i < 6; i++) {
    const shard = box(0.12, 0.02, 0.12, glassMat, {thickness: 0.008});
    shard.position.set((i - 2.5) * 0.35, 0.02, 1.7 + (i % 2) * 0.2);
    shard.rotation.y = i * 0.4;
    g.add(shard);
  }

  // MIDGROUND LAYER: 1970 Luxury Sedan (Intact vs Crushed states)
  const intactCar = makeCar({color: '#eee1d7', crushed: false});
  intactCar.position.set(0, 0, 0.0);
  intactCar.rotation.y = 0.42;
  g.add(intactCar);

  const crushedCar = makeCar({color: '#eee1d7', crushed: true});
  crushedCar.position.set(0, 0, 0.0);
  crushedCar.rotation.y = 0.42;
  crushedCar.visible = false;
  g.add(crushedCar);

  // Massive coffee-table sized blubber slab
  const slabMat = toonMat(paintedTexture('#2e2527', {seed: 50, stains: 15}));
  const slab = box(1.6, 0.42, 1.2, slabMat, {thickness: 0.035});
  slab.position.set(0.05, 4.2, -0.05);
  slab.rotation.y = 0.42;
  slab.rotation.z = -0.06;
  g.add(slab);

  // Dynamic car crushing update hook
  const update = (t) => {
    // Impact lands at t = 41.5s
    if (t < 41.5) {
      intactCar.visible = true;
      crushedCar.visible = false;
      const progress = Math.max(0, (t - 39.34) / (41.5 - 39.34));
      slab.position.y = 4.2 - (progress * 3.25);
    } else {
      intactCar.visible = false;
      crushedCar.visible = true;
      slab.position.y = 0.95;
    }
  };

  return {group: g, characters: [], update};
}

// -------------------------------------------------------------
// SHOT 9: Veteran standing beside crushed car holding keys (x = 320)
// -------------------------------------------------------------
export function buildShot9(x = 320) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(60, '#c5a378', 19));

  // FOREGROUND LAYER (Z: +0.88m to +1.8m): Dangling golden car key & tire tracks
  const keyMat = toonMat('#d4a037');
  const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 8, 16), keyMat);
  keyRing.position.set(-0.22, 0.72, 0.88);
  g.add(keyRing);

  const keyBlade = box(0.04, 0.16, 0.015, keyMat, {thickness: 0.008});
  keyBlade.position.set(-0.22, 0.62, 0.88);
  g.add(keyBlade);

  // MIDGROUND LAYER: Veteran on Left, Crushed Car & Perched Seagull on Right
  const veteran = makeCharacter({palette: 'veteran', hat: 'cap', expression: 'deadpan', seed: 110});
  veteran.position.set(-0.45, 0, 0.85);
  g.add(veteran);

  // Crushed car on right
  const car = makeCar({color: '#eee1d7', crushed: true});
  car.position.set(0.95, 0, -0.2);
  car.rotation.y = 0.35;
  g.add(car);

  // Blubber slab resting on crushed roof
  const slab = box(1.5, 0.38, 1.1, toonMat('#2e2527'), {thickness: 0.03});
  slab.position.set(0.98, 0.95, -0.2);
  slab.rotation.y = 0.35;
  g.add(slab);

  // Seagull perched on car hood
  const gull = makeSeagull();
  gull.position.set(0.85, 0.95, 0.7);
  gull.rotation.y = 0.2;
  g.add(gull);

  // IN-WORLD PHYSICAL SIGN 9: Giant Roadside Dealership Billboard
  const billboardGroup = new THREE.Group();
  const billboardTex = createBillboardTexture();
  const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 0.12), [
    toonMat('#5c4a38'), toonMat('#5c4a38'), toonMat('#5c4a38'), toonMat('#5c4a38'),
    new THREE.MeshBasicMaterial({map: billboardTex}), toonMat('#5c4a38')
  ]);
  outlined(boardMesh, {thickness: 0.03});
  billboardGroup.add(boardMesh);

  // Twin support timber posts
  const postL = box(0.16, 3.2, 0.16, toonMat('#5c4a38'), {thickness: 0.02});
  postL.position.set(-1.2, -0.8, -0.08); billboardGroup.add(postL);
  const postR = box(0.16, 3.2, 0.16, toonMat('#5c4a38'), {thickness: 0.02});
  postR.position.set(1.2, -0.8, -0.08); billboardGroup.add(postR);

  billboardGroup.position.set(1.8, 2.2, -3.5);
  g.add(billboardGroup);

  const update = (t) => {
    // Seagull head tilt
    const elapsed = Math.max(0, t - 44.28);
    gull.rotation.z = Math.sin(elapsed * 3) * 0.12;
  };

  return {group: g, characters: [veteran], update};
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
