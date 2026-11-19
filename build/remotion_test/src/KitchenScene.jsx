import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer, Vignette} from '@react-three/postprocessing';
import * as THREE from 'three';
import {ovalPts, pillPts, flatPoly, inkedPoly, flatRibbonPts} from './characterFactory.js';
import {box, INK} from './kit.js';

// 1. Textures Generator
function makeCheckerboardFloorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d');
  const n = 8;
  const size = 1024 / n;

  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const isTeal = (r + col) % 2 === 0;
      ctx.fillStyle = isTeal ? '#18898e' : '#f5f7f6';
      ctx.fillRect(col * size, r * size, size, size);

      ctx.fillStyle = isTeal ? 'rgba(12, 60, 65, 0.16)' : 'rgba(215, 222, 222, 0.4)';
      ctx.fillRect(col * size, r * size, size, 2.5);
      ctx.fillRect(col * size, r * size, 2.5, size);

      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(col * size, r * size, size, size);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 2.2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSubwayTilesTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f8f8f6';
  ctx.fillRect(0, 0, 512, 256);

  const rows = 7;
  const rh = 256 / rows;
  const rw = 58;

  ctx.strokeStyle = '#c6c9cb';
  ctx.lineWidth = 1.6;

  for (let r = 0; r <= rows; r++) {
    const y = r * rh;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    const offset = (r % 2) * (rw / 2);
    for (let x = -offset; x <= 512 + rw; x += rw) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rh);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 1.8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCalendarTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 360;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 360);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 352);

  ctx.fillStyle = '#7ac2ea';
  ctx.fillRect(8, 8, 240, 100);
  ctx.fillStyle = '#65b542';
  ctx.fillRect(8, 90, 240, 22);

  const drawPumpkin = (px, py, pr) => {
    ctx.fillStyle = '#eb7325';
    ctx.beginPath();
    ctx.ellipse(px, py, pr * 1.15, pr, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = '#2f5b1d';
    ctx.fillRect(px - 2, py - pr - 5, 4, 6);
  };
  drawPumpkin(78, 86, 13);
  drawPumpkin(128, 82, 16);
  drawPumpkin(178, 86, 13);

  ctx.fillStyle = '#ce3124';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OCTOBER', 128, 138);

  ctx.fillStyle = '#444444';
  ctx.font = 'bold 11px sans-serif';
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 0; i < 7; i++) {
    ctx.fillText(days[i], 28 + i * 29, 158);
  }

  ctx.fillStyle = '#777777';
  ctx.font = '11px sans-serif';
  let dayNum = 1;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < 3) continue;
      if (dayNum > 31) break;
      const x = 28 + col * 29;
      const y = 180 + row * 24;
      ctx.fillText(String(dayNum), x, y);

      if (dayNum >= 12 && dayNum <= 18) {
        ctx.strokeStyle = '#ce3124';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 9); ctx.lineTo(x + 6, y + 2);
        ctx.moveTo(x + 6, y - 9); ctx.lineTo(x - 6, y + 2);
        ctx.stroke();
      }
      dayNum++;
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeGinghamCurtainTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 128, 128);

  const step = 16;
  ctx.fillStyle = 'rgba(215, 45, 45, 0.45)';
  for (let i = 0; i < 128; i += step * 2) {
    ctx.fillRect(i, 0, step, 128);
    ctx.fillRect(0, i, 128, step);
  }
  ctx.fillStyle = 'rgba(195, 25, 25, 0.8)';
  for (let x = 0; x < 128; x += step * 2) {
    for (let y = 0; y < 128; y += step * 2) {
      ctx.fillRect(x, y, step, step);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 2. Multi-Part Wall Phone Model
function buildWallPhone() {
  const g = new THREE.Group();
  g.name = 'wall_phone';

  // Blue bracket frame on wall
  const bracketMat = new THREE.MeshBasicMaterial({color: '#2b78d8'});
  const bW = 0.52, bH = 0.62, bT = 0.035;
  const barT = box(bW, bT, 0.01, bracketMat, {thickness: 0.008}); barT.position.set(0, bH / 2, 0);
  const barB = box(bW, bT, 0.01, bracketMat, {thickness: 0.008}); barB.position.set(0, -bH / 2, 0);
  const barL = box(bT, bH, 0.01, bracketMat, {thickness: 0.008}); barL.position.set(-bW / 2, 0, 0);
  const barR = box(bT, bH, 0.01, bracketMat, {thickness: 0.008}); barR.position.set(bW / 2, 0, 0);
  g.add(barT, barB, barL, barR);

  // Red housing body
  const redMat = new THREE.MeshBasicMaterial({color: '#cc292f'});
  const redDarkMat = new THREE.MeshBasicMaterial({color: '#8b191e'});
  const housing = box(0.32, 0.44, 0.14, redMat, {thickness: 0.015});
  housing.position.set(-0.04, 0.01, 0.07);
  g.add(housing);

  const shadowSide = box(0.03, 0.43, 0.13, redDarkMat, {outline: false});
  shadowSide.position.set(0.11, 0.01, 0.07);
  g.add(shadowSide);

  // Rotary dial
  const dialG = new THREE.Group();
  dialG.position.set(-0.04, 0.04, 0.15);

  const dialBase = flatPoly(ovalPts(0.095, 0.095, 1, 24), '#ffffff', 0.001);
  const dialInk = flatPoly(ovalPts(0.10, 0.10, 1, 24), INK, 0);
  const dialCenter = flatPoly(ovalPts(0.042, 0.042, 2, 20), '#cc292f', 0.003);
  const dialCenterInk = flatPoly(ovalPts(0.045, 0.045, 2, 20), INK, 0.002);
  dialG.add(dialBase, dialInk, dialCenter, dialCenterInk);

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 1.5 - Math.PI * 0.12;
    const hx = Math.cos(a) * 0.07;
    const hy = Math.sin(a) * 0.07;
    const hole = flatPoly(ovalPts(0.013, 0.013, 10 + i, 12), '#ffffff', 0.004);
    hole.position.set(hx, hy, 0.004);
    const holeInk = flatPoly(ovalPts(0.015, 0.015, 10 + i, 12), INK, 0.003);
    holeInk.position.set(hx, hy, 0.003);
    dialG.add(hole, holeInk);
  }
  g.add(dialG);

  // Cradle prongs
  const cradle = box(0.05, 0.08, 0.10, redDarkMat, {thickness: 0.009});
  cradle.position.set(0.11, 0.14, 0.07);
  g.add(cradle);

  return g;
}

// 3. Dad Character
function buildDadCharacter() {
  const root = new THREE.Group();
  root.name = 'character_dad';

  const body = new THREE.Group();
  root.add(body);

  // Soft small contact shadows under both feet
  const shadowMat = new THREE.MeshBasicMaterial({
    color: INK,
    transparent: true,
    opacity: 0.35,
  });
  const shadowL = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.09, 0.04, 1, 16))), shadowMat);
  shadowL.rotation.x = -Math.PI / 2;
  shadowL.position.set(-0.11, 0.002, 0);
  const shadowR = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.09, 0.04, 2, 16))), shadowMat);
  shadowR.rotation.x = -Math.PI / 2;
  shadowR.position.set(0.11, 0.002, 0);
  root.add(shadowL, shadowR);

  // Stick legs with horizontal L-bend feet
  const makeLeg = (xPos, footDir = 1) => {
    const legG = new THREE.Group();
    legG.position.set(xPos, 0.54, 0);

    const shin = flatPoly(
      [
        new THREE.Vector2(-0.014, 0),
        new THREE.Vector2(0.014, 0),
        new THREE.Vector2(0.012, -0.535),
        new THREE.Vector2(-0.012, -0.535),
      ],
      INK,
      0
    );

    const foot = flatPoly(
      [
        new THREE.Vector2(-0.012, -0.53),
        new THREE.Vector2(0.10 * footDir, -0.53),
        new THREE.Vector2(0.10 * footDir, -0.565),
        new THREE.Vector2(-0.012, -0.565),
      ],
      INK,
      0.002
    );

    legG.add(shin, foot);
    return legG;
  };

  body.add(makeLeg(-0.11, 1));
  body.add(makeLeg(0.11, 1));

  // Teal-Green Torso + Soft Cel Shading + White Collar Tab
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.54, 0.015);

  const torsoW = 0.28, torsoH = 0.42;
  const {group: torso} = inkedPoly(pillPts(torsoW, torsoH), '#1b8b80', 0.018, 10, 0);
  torsoGroup.add(torso);

  const torsoCel = flatPoly(
    [
      new THREE.Vector2(torsoW * 0.12, 0.02),
      new THREE.Vector2(torsoW * 0.44, 0.02),
      new THREE.Vector2(torsoW * 0.44, torsoH - 0.02),
      new THREE.Vector2(torsoW * 0.12, torsoH - 0.02),
    ],
    '#11615a',
    0.004,
    0.62
  );
  torsoGroup.add(torsoCel);

  const collarTab = flatPoly(
    [
      new THREE.Vector2(-0.014, torsoH - 0.01),
      new THREE.Vector2(0.014, torsoH - 0.01),
      new THREE.Vector2(0.011, torsoH - 0.065),
      new THREE.Vector2(-0.011, torsoH - 0.065),
    ],
    '#ffffff',
    0.006
  );
  const collarDot = flatPoly(ovalPts(0.009, 0.009, 11, 12), INK, 0.008);
  collarDot.position.set(0, torsoH - 0.042, 0.008);
  torsoGroup.add(collarTab, collarDot);

  body.add(torsoGroup);

  // Head Group (Smooth Off-White Oval Disc)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.20, 0.038);
  body.add(headGroup);

  const headRx = 0.21, headRy = 0.205;
  const {group: head} = inkedPoly(ovalPts(headRx, headRy, 20, 44), '#f7f4ee', 0.018, 21, 0);
  headGroup.add(head);

  // Brown Hair Cap sitting on top of head dome
  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, headRy * 0.88, 0.005);

  const {group: hairCap} = inkedPoly(
    ovalPts(headRx * 0.94, headRy * 0.32, 22, 36),
    '#4a2818',
    0.016,
    23,
    0
  );
  hairGroup.add(hairCap);

  // Highlight band
  const hairHighlight = flatPoly(
    ovalPts(headRx * 0.68, headRy * 0.14, 24, 24),
    '#75442b',
    0.005,
    0.85
  );
  hairHighlight.position.set(-0.02, 0.02, 0.005);
  hairGroup.add(hairHighlight);

  // Hair strands
  const tuft1 = flatPoly(
    [
      new THREE.Vector2(-0.022, headRy * 0.28),
      new THREE.Vector2(0.01, headRy * 0.28),
      new THREE.Vector2(-0.032, headRy * 0.72),
    ],
    '#4a2818',
    0.006
  );
  const tuft1Ink = flatPoly(
    [
      new THREE.Vector2(-0.028, headRy * 0.28),
      new THREE.Vector2(0.016, headRy * 0.28),
      new THREE.Vector2(-0.038, headRy * 0.75),
    ],
    INK,
    0.004
  );
  const tuft2 = flatPoly(
    [
      new THREE.Vector2(0.005, headRy * 0.28),
      new THREE.Vector2(0.032, headRy * 0.28),
      new THREE.Vector2(0.022, headRy * 0.65),
    ],
    '#4a2818',
    0.006
  );
  const tuft2Ink = flatPoly(
    [
      new THREE.Vector2(-0.001, headRy * 0.28),
      new THREE.Vector2(0.038, headRy * 0.28),
      new THREE.Vector2(0.026, headRy * 0.68),
    ],
    INK,
    0.004
  );
  hairGroup.add(tuft1Ink, tuft1, tuft2Ink, tuft2);
  headGroup.add(hairGroup);

  // Soft pink blush on left cheek
  const blush = flatPoly(ovalPts(0.055, 0.038, 25, 20), '#e88f8b', 0.006, 0.42);
  blush.position.set(-0.09, -0.04, 0.006);
  headGroup.add(blush);

  // Blue sweat drop on right temple
  const sweatG = new THREE.Group();
  sweatG.position.set(0.12, 0.06, 0.008);
  const sweatDrop = flatPoly(ovalPts(0.022, 0.032, 26, 16), '#96d5e8', 0.002, 0.95);
  const sweatInk = flatPoly(ovalPts(0.025, 0.035, 26, 16), INK, 0);
  sweatG.add(sweatInk, sweatDrop);
  headGroup.add(sweatG);

  // Eyeglasses
  const glassesGroup = new THREE.Group();
  glassesGroup.position.set(0, 0.01, 0.012);

  const makeLens = (xPos) => {
    const lg = new THREE.Group();
    lg.position.x = xPos;
    const outer = flatPoly(ovalPts(0.050, 0.050, 30, 24), INK, 0);
    const inner = flatPoly(ovalPts(0.040, 0.040, 30, 24), '#f7f4ee', 0.002);
    const pupil = flatPoly(ovalPts(0.016, 0.016, 31, 16), INK, 0.004);
    pupil.position.set(0.002, 0.002, 0.004);
    lg.add(outer, inner, pupil);
    return lg;
  };

  const lensL = makeLens(-0.062);
  const lensR = makeLens(0.062);
  const bridge = flatPoly(
    [
      new THREE.Vector2(-0.02, 0.004),
      new THREE.Vector2(0.02, 0.004),
      new THREE.Vector2(0.02, -0.004),
      new THREE.Vector2(-0.02, -0.004),
    ],
    INK,
    0.003
  );
  const templeL = flatPoly(
    [
      new THREE.Vector2(-0.10, 0.005),
      new THREE.Vector2(-0.17, 0.032),
      new THREE.Vector2(-0.17, 0.022),
      new THREE.Vector2(-0.10, -0.005),
    ],
    INK,
    0.003
  );
  glassesGroup.add(lensL, lensR, bridge, templeL);
  headGroup.add(glassesGroup);

  // Eyebrows
  const browL = flatPoly(
    [
      new THREE.Vector2(-0.032, 0.004),
      new THREE.Vector2(0.032, -0.004),
      new THREE.Vector2(0.032, -0.012),
      new THREE.Vector2(-0.032, -0.004),
    ],
    INK,
    0.012
  );
  browL.position.set(-0.062, 0.088, 0.012);
  browL.rotation.z = -0.16;

  const browR = flatPoly(
    [
      new THREE.Vector2(-0.032, -0.004),
      new THREE.Vector2(0.032, 0.004),
      new THREE.Vector2(0.032, -0.004),
      new THREE.Vector2(-0.032, -0.012),
    ],
    INK,
    0.012
  );
  browR.position.set(0.062, 0.088, 0.012);
  browR.rotation.z = 0.16;

  headGroup.add(browL, browR);

  // Small mouth
  const mouth = flatPoly(
    [
      new THREE.Vector2(-0.02, 0.003),
      new THREE.Vector2(0.02, 0.003),
      new THREE.Vector2(0.02, -0.004),
      new THREE.Vector2(-0.02, -0.004),
    ],
    INK,
    0.012
  );
  mouth.position.set(0.0, -0.07, 0.012);
  headGroup.add(mouth);

  // Arms:
  // Right arm holding handset
  const armPhone = new THREE.Group();
  armPhone.position.set(0.11, 0.90, 0.042);

  const armPhoneRibbon = flatRibbonPts(
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.18, 0.16),
    new THREE.Vector2(0.12, 0.35),
    0.014,
    20
  );
  const {group: phoneArmMesh} = inkedPoly(armPhoneRibbon, INK, 0.006, 60, 0);
  const handPhone = flatPoly(ovalPts(0.022, 0.022, 61, 16), INK, 0.004);
  handPhone.position.set(0.12, 0.35, 0.004);
  armPhone.add(phoneArmMesh, handPhone);

  const handsetG = new THREE.Group();
  handsetG.position.set(0.13, 0.35, 0.015);
  handsetG.rotation.z = 0.22;
  const bar = box(0.045, 0.22, 0.055, new THREE.MeshBasicMaterial({color: '#cc292f'}), {thickness: 0.009});
  const eTop = box(0.08, 0.065, 0.075, new THREE.MeshBasicMaterial({color: '#a62025'}), {thickness: 0.009});
  eTop.position.y = 0.11;
  const eBot = box(0.08, 0.065, 0.075, new THREE.MeshBasicMaterial({color: '#a62025'}), {thickness: 0.009});
  eBot.position.y = -0.11;
  handsetG.add(bar, eTop, eBot);
  armPhone.add(handsetG);

  body.add(armPhone);

  // Left arm holding coffee mug at chest level
  const armMug = new THREE.Group();
  armMug.position.set(-0.11, 0.90, 0.042);

  const armMugRibbon = flatRibbonPts(
    new THREE.Vector2(0, 0),
    new THREE.Vector2(-0.15, -0.08),
    new THREE.Vector2(-0.06, -0.20),
    0.014,
    20
  );
  const {group: mugArmMesh} = inkedPoly(armMugRibbon, INK, 0.006, 62, 0);
  const handMug = flatPoly(ovalPts(0.022, 0.022, 63, 16), INK, 0.004);
  handMug.position.set(-0.06, -0.20, 0.004);
  armMug.add(mugArmMesh, handMug);

  const mugG = new THREE.Group();
  mugG.position.set(-0.06, -0.20, 0.012);
  const mugB = box(0.085, 0.105, 0.075, new THREE.MeshBasicMaterial({color: '#f8f8f6'}), {thickness: 0.01});
  const mugH = box(0.025, 0.065, 0.025, new THREE.MeshBasicMaterial({color: '#e4e4e0'}), {thickness: 0.007});
  mugH.position.set(-0.055, 0, 0);
  mugG.add(mugB, mugH);
  armMug.add(mugG);

  body.add(armMug);

  return root;
}

// 4. Kitchen 3D Environment (Perspective Tiles, Counter with Sink & Pumpkin, Window, Door, Fridge, Wall, Lighting)
function KitchenEnvironment() {
  const env = useMemo(() => {
    const grp = new THREE.Group();

    // Floor with checkerboard texture
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorTex = makeCheckerboardFloorTexture();
    const floorMat = new THREE.MeshBasicMaterial({map: floorTex});
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, 0);
    grp.add(floorMesh);

    // Soft, semi-transparent warm light patch from window streaming across floor
    const lightShape = new THREE.Shape();
    lightShape.moveTo(-1.4, -1.2);
    lightShape.lineTo(2.2, -0.8);
    lightShape.lineTo(2.6, 2.8);
    lightShape.lineTo(-0.6, 3.2);
    lightShape.closePath();

    const lightPatchMat = new THREE.MeshBasicMaterial({
      color: '#ffe58a',
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const lightPatch = new THREE.Mesh(new THREE.ShapeGeometry(lightShape), lightPatchMat);
    lightPatch.rotation.x = -Math.PI / 2;
    lightPatch.position.set(0.05, 0.003, -0.1);
    grp.add(lightPatch);

    // Butter-Yellow Back Wall with soft warm gradient
    const wallGeo = new THREE.PlaneGeometry(16, 10);
    const wallMat = new THREE.MeshBasicMaterial({color: '#f6df62'});
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 4.0, -3.2);
    grp.add(wall);

    const wallShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 10),
      new THREE.MeshBasicMaterial({color: '#e5be38', transparent: true, opacity: 0.28})
    );
    wallShadow.position.set(0, 4.0, -3.19);
    grp.add(wallShadow);

    // Subway Tile Backsplash behind counter
    const splashTex = makeSubwayTilesTexture();
    const backsplash = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 1.5),
      new THREE.MeshBasicMaterial({map: splashTex})
    );
    backsplash.position.set(-1.0, 1.9, -3.18);
    grp.add(backsplash);

    // White Ceiling angled down toward left
    const ceilGeo = new THREE.PlaneGeometry(16, 12);
    const ceilMat = new THREE.MeshBasicMaterial({color: '#f7f6f2'});
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4.6, 0);
    grp.add(ceiling);

    const ceilInk = box(16, 0.05, 0.05, new THREE.MeshBasicMaterial({color: INK}), {outline: false});
    ceilInk.position.set(0, 4.6, -3.2);
    grp.add(ceilInk);

    // Turquoise Pendant Lamp (Hanging at top left)
    const lampG = new THREE.Group();
    lampG.position.set(-0.45, 2.9, -1.0);
    const cord = box(0.02, 1.6, 0.02, new THREE.MeshBasicMaterial({color: INK}), {outline: false});
    cord.position.y = 0.8;
    const shadeGeo = new THREE.ConeGeometry(0.48, 0.32, 24, 1, true);
    const shade = new THREE.Mesh(shadeGeo, new THREE.MeshBasicMaterial({color: '#34a2a6'}));
    const rimInk = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.015, 12, 32), new THREE.MeshBasicMaterial({color: INK}));
    rimInk.rotation.x = Math.PI / 2;
    rimInk.position.y = -0.16;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshBasicMaterial({color: '#fffbe8'}));
    bulb.position.y = -0.04;
    lampG.add(cord, shade, rimInk, bulb);
    grp.add(lampG);

    // Kitchen Counter & Turquoise Cabinets (Moved rightward so sink, faucet & pumpkin are in shot!)
    const counterG = new THREE.Group();
    counterG.position.set(-1.1, 0, -2.4);

    const cabBody = box(2.6, 1.4, 1.2, new THREE.MeshBasicMaterial({color: '#389e99'}), {thickness: 0.02});
    cabBody.position.set(0, 0.7, 0);
    counterG.add(cabBody);

    for (let c = 0; c < 2; c++) {
      const dx = -0.6 + c * 1.2;
      const doorPanel = box(0.95, 0.95, 0.02, new THREE.MeshBasicMaterial({color: '#308c87'}), {thickness: 0.015});
      doorPanel.position.set(dx, 0.65, 0.61);
      const knob = flatPoly(ovalPts(0.022, 0.022, 100 + c, 12), INK, 0.02);
      knob.position.set(dx + 0.38, 0.85, 0.62);
      counterG.add(doorPanel, knob);
    }

    const counterTop = box(2.7, 0.09, 1.3, new THREE.MeshBasicMaterial({color: '#f8f8f5'}), {thickness: 0.02});
    counterTop.position.set(0, 1.44, 0);
    counterG.add(counterTop);

    // Stainless sink & faucet (clearly visible in midground behind character)
    const sink = box(0.85, 0.03, 0.7, new THREE.MeshBasicMaterial({color: '#c8d2d6'}), {thickness: 0.015});
    sink.position.set(0.15, 1.48, 0.1);
    const faucet = box(0.04, 0.28, 0.04, new THREE.MeshBasicMaterial({color: '#768286'}), {thickness: 0.01});
    faucet.position.set(0.15, 1.62, -0.2);
    counterG.add(sink, faucet);

    // Spilled juice on counter
    const spillShape = new THREE.Shape();
    spillShape.moveTo(0.5, -0.2);
    spillShape.lineTo(1.1, -0.15);
    spillShape.lineTo(1.3, 0.3);
    spillShape.lineTo(0.8, 0.45);
    spillShape.lineTo(0.4, 0.25);
    spillShape.closePath();
    const spillMesh = new THREE.Mesh(new THREE.ShapeGeometry(spillShape), new THREE.MeshBasicMaterial({color: '#f5a623'}));
    spillMesh.rotation.x = -Math.PI / 2;
    spillMesh.position.set(0.1, 1.49, 0.1);
    counterG.add(spillMesh);

    // Small pumpkin on counter
    const pumpGeo = new THREE.SphereGeometry(0.16, 16, 12);
    pumpGeo.scale(1.2, 0.9, 1.2);
    const pumpkin = new THREE.Mesh(pumpGeo, new THREE.MeshBasicMaterial({color: '#ea6e21'}));
    pumpkin.position.set(-0.85, 1.58, 0.2);
    const pumpStem = box(0.03, 0.08, 0.03, new THREE.MeshBasicMaterial({color: '#3b5826'}), {thickness: 0.008});
    pumpStem.position.set(-0.85, 1.74, 0.2);
    counterG.add(pumpkin, pumpStem);

    grp.add(counterG);

    // Kitchen Window above sink with Gingham Curtains
    const winG = new THREE.Group();
    winG.position.set(-1.1, 2.75, -3.15);

    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshBasicMaterial({color: '#eb7842'}));
    winGlass.position.z = -0.02;
    const winFrame = box(1.3, 1.5, 0.06, new THREE.MeshBasicMaterial({color: '#ffffff'}), {thickness: 0.016});
    const winBarH = box(1.2, 0.05, 0.07, new THREE.MeshBasicMaterial({color: '#ffffff'}), {thickness: 0.012});
    const winBarV = box(0.05, 1.4, 0.07, new THREE.MeshBasicMaterial({color: '#ffffff'}), {thickness: 0.012});
    winG.add(winGlass, winFrame, winBarH, winBarV);

    const curtainTex = makeGinghamCurtainTexture();
    const curtainMat = new THREE.MeshBasicMaterial({map: curtainTex});
    const curtainL = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 1.2), curtainMat);
    curtainL.position.set(-0.42, -0.05, 0.04);
    const curtainR = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 1.2), curtainMat);
    curtainR.position.set(0.42, -0.05, 0.04);
    winG.add(curtainL, curtainR);

    grp.add(winG);

    // October Calendar
    const calTex = makeCalendarTexture();
    const calendar = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.95), new THREE.MeshBasicMaterial({map: calTex}));
    calendar.position.set(0.62, 2.9, -3.16);
    grp.add(calendar);

    // Multi-part Wall Telephone on Blue Bracket
    const phone = buildWallPhone();
    phone.position.set(0.65, 1.88, -3.15);
    grp.add(phone);

    // Red coiled curly cord connecting wall phone body to the handset in character's hand!
    const cordCatenary = flatRibbonPts(
      new THREE.Vector2(0.61, 1.66), // bottom of phone
      new THREE.Vector2(0.42, 1.15), // dipping curve
      new THREE.Vector2(0.24, 1.48), // handset in hand
      0.010,
      24
    );
    const {group: phoneConnectingCord} = inkedPoly(cordCatenary, '#c4262c', 0.005, 95, -1.8);
    grp.add(phoneConnectingCord);

    // White Interior Door (Right)
    const doorG = new THREE.Group();
    doorG.position.set(1.68, 1.7, -3.0);
    const doorFrame = box(1.2, 3.4, 0.12, new THREE.MeshBasicMaterial({color: '#ffffff'}), {thickness: 0.018});
    doorG.add(doorFrame);

    const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.3), new THREE.MeshBasicMaterial({color: '#e898aa'}));
    doorGlass.position.set(0, 0.5, 0.04);
    doorG.add(doorGlass);

    for (let gx = -0.25; gx <= 0.25; gx += 0.25) {
      const gBarV = box(0.03, 1.3, 0.05, new THREE.MeshBasicMaterial({color: '#ffffff'}), {thickness: 0.01});
      gBarV.position.set(gx, 0.5, 0.06);
      doorG.add(gBarV);
    }
    for (let gy = 0.1; gy <= 0.9; gy += 0.4) {
      const gBarH = box(0.8, 0.03, 0.05, new THREE.MeshBasicMaterial({color: '#ffffff'}), {thickness: 0.01});
      gBarH.position.set(0, gy, 0.06);
      doorG.add(gBarH);
    }

    const doorPanel = box(0.8, 1.05, 0.04, new THREE.MeshBasicMaterial({color: '#f0ede6'}), {thickness: 0.015});
    doorPanel.position.set(0, -0.85, 0.05);
    doorG.add(doorPanel);

    const hinge1 = box(0.04, 0.12, 0.06, new THREE.MeshBasicMaterial({color: '#d4b045'}), {thickness: 0.008});
    hinge1.position.set(-0.58, 0.95, 0.05);
    const hinge2 = box(0.04, 0.12, 0.06, new THREE.MeshBasicMaterial({color: '#d4b045'}), {thickness: 0.008});
    hinge2.position.set(-0.58, -0.85, 0.05);
    doorG.add(hinge1, hinge2);

    grp.add(doorG);

    // Retro Fridge (Right Foreground)
    const fridgeG = new THREE.Group();
    fridgeG.position.set(1.48, 1.05, -0.7);
    const fridgeBody = box(1.0, 2.4, 1.0, new THREE.MeshBasicMaterial({color: '#8ecac6'}), {thickness: 0.022});
    fridgeG.add(fridgeBody);

    const note1 = box(0.24, 0.24, 0.01, new THREE.MeshBasicMaterial({color: '#e69838'}), {thickness: 0.01});
    note1.position.set(-0.32, 0.4, 0.51);
    const note2 = box(0.44, 0.28, 0.01, new THREE.MeshBasicMaterial({color: '#ffffff'}), {thickness: 0.01});
    note2.position.set(-0.22, 0.05, 0.51);
    const note3 = box(0.22, 0.22, 0.01, new THREE.MeshBasicMaterial({color: '#e0c83a'}), {thickness: 0.01});
    note3.position.set(-0.32, -0.35, 0.51);
    const magRed = flatPoly(ovalPts(0.028, 0.028, 120, 12), '#d9382e', 0.52);
    magRed.position.set(-0.42, 0.15, 0.52);
    const magBlue = flatPoly(ovalPts(0.028, 0.028, 121, 12), '#2e6fd9', 0.52);
    magBlue.position.set(-0.42, -0.55, 0.52);
    fridgeG.add(note1, note2, note3, magRed, magBlue);

    grp.add(fridgeG);

    return grp;
  }, []);

  return <primitive object={env} />;
}

function CameraRig() {
  const {camera} = useThree();
  useFrame(() => {
    // Camera framing: character fills about 50% of the frame height, centered with props
    camera.position.set(0.12, 1.42, 3.25);
    camera.lookAt(new THREE.Vector3(0.04, 1.30, -1.45));
  });
  return null;
}

export const KitchenScene = () => {
  const character = useMemo(() => {
    const c = buildDadCharacter();
    c.position.set(0.08, 0.0, -1.45);
    return c;
  }, []);

  return (
    <AbsoluteFill style={{backgroundColor: '#fae372'}}>
      <ThreeCanvas
        width={720}
        height={1280}
        camera={{fov: 40, near: 0.1, far: 50, position: [0.12, 1.42, 3.25]}}
      >
        <CameraRig />
        <KitchenEnvironment />
        <primitive object={character} />
        <EffectComposer>
          <Vignette eskil={false} offset={0.35} darkness={0.20} />
        </EffectComposer>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
