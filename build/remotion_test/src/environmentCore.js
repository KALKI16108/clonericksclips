// environmentCore.js
// Batch 1 3D Environment System for Three.js / Remotion.
// Provides:
// 1. Realistic 3D Trees:
//    - Curved tapered trunk and forked primary/secondary branches built using CatmullRomCurve3 + tapered TubeGeometry.
//    - Multi-leaf sprig botanical canvas textures on small angled 3D leaf clusters/cards grouped around branch tips.
//    - Vertical bark ridges/furrows via procedural bark canvas map + bumpMap (roughness ~0.90).
//    - Smooth deterministic breeze sway in animateEnvironment(envGroup, t).
// 2. 3D Cobblestone Wall:
//    - Irregular 4–6 sided rounded/faceted stone Shapes extruded with ExtrudeGeometry (bevelEnabled: true).
//    - Staggered courses over a recessed mortar backing bed.
//    - Subtle color variation across warm grey, sandstone, and weathered slate.
//    - Base moss/grime on lowest course and a beveled coping slab cap.
// 3. 3D Road ('cobblestone', 'normal', 'modern'):
//    - 3D roadbed with chamfered/beveled 3D curbs and gutter darkening along curb lines.
//    - Detailed procedural textures (map + bumpMap + roughnessMap) with fine aggregate grain and micro-wear.
//    - Crisp markings using polygonOffset (zero Z-fighting).
//    - 'cobblestone' mode with irregular beveled 3D stone pavers and recessed mortar joints.
//
// Rules enforced:
// - True 3D geometry throughout.
// - Zero #1b1817 ink outlines on environment meshes.
// - Character footing at [0, 0, 0] is completely clear, flush, and Z-fight free.
// - PCFSoftShadowMap enabled, soft shadows on trunk/limbs/walls/curbs, leaf cards avoid shadow acne.

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Seeded PRNG & Procedural Texture Generators
// ---------------------------------------------------------------------------

export function rng(seed = 1) {
  let s = (Math.abs(Math.floor(seed)) || 1) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Procedural Bark Diffuse Texture:
 * Features rich warm woody tones with vertical fibrous furrows, wavy growth striations,
 * and subtle lighter lichen / weathered flecks.
 */
export function generateBarkTexture(baseColor = '#4a3728', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Vertical fibrous striations with wavy organic deflection
  const numStreaks = 360;
  for (let i = 0; i < numStreaks; i++) {
    const xBase = r() * size;
    const w = 1.0 + r() * 3.4;
    const alpha = 0.14 + r() * 0.22;
    const isDark = r() > 0.38;
    ctx.strokeStyle = isDark ? `rgba(22, 14, 9, ${alpha})` : `rgba(142, 115, 86, ${alpha * 0.9})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(xBase, 0);

    const freq = 0.012 + r() * 0.018;
    const amp = 3.5 + r() * 6.0;
    for (let y = 0; y <= size; y += 12) {
      const x = xBase + Math.sin(y * freq) * amp;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Deep vertical fissure clefts
  const clefts = 24;
  for (let cIdx = 0; cIdx < clefts; cIdx++) {
    let cx = r() * size;
    ctx.strokeStyle = `rgba(16, 10, 6, ${0.38 + r() * 0.35})`;
    ctx.lineWidth = 2.2 + r() * 2.8;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    for (let y = 0; y <= size; y += 16) {
      cx += (r() - 0.5) * 4.5;
      ctx.lineTo(cx, y);
    }
    ctx.stroke();
  }

  // Weathered lichen / moss flecks
  const flecks = 75;
  for (let f = 0; f < flecks; f++) {
    const fx = r() * size;
    const fy = r() * size;
    const fr = 3 + r() * 7;
    const isMoss = r() > 0.55;
    ctx.fillStyle = isMoss ? `rgba(90, 108, 62, ${0.20 + r() * 0.25})` : `rgba(180, 172, 148, ${0.15 + r() * 0.20})`;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Bark Bump Map:
 * Grayscale height map where deep bark furrows are dark (#151515)
 * and raised bark ridges are bright (#e2e2e2), generating crisp geometric relief under directional sunlight.
 */
export function generateBarkBumpMap({ size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed + 99);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Raised plateaus
  for (let i = 0; i < 280; i++) {
    const xBase = r() * size;
    const w = 2.5 + r() * 5.0;
    const bright = Math.floor(180 + r() * 70);
    ctx.strokeStyle = `rgba(${bright}, ${bright}, ${bright}, 0.28)`;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(xBase, 0);
    const freq = 0.014 + r() * 0.016;
    const amp = 3.0 + r() * 5.0;
    for (let y = 0; y <= size; y += 12) {
      const x = xBase + Math.sin(y * freq) * amp;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Dark furrow recesses
  for (let i = 0; i < 180; i++) {
    const xBase = r() * size;
    const w = 1.5 + r() * 3.0;
    const dark = Math.floor(10 + r() * 40);
    ctx.strokeStyle = `rgba(${dark}, ${dark}, ${dark}, 0.40)`;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(xBase, 0);
    const freq = 0.015 + r() * 0.020;
    const amp = 4.0 + r() * 6.0;
    for (let y = 0; y <= size; y += 10) {
      const x = xBase + Math.sin(y * freq) * amp;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Botanical Multi-Leaf Sprig Texture:
 * Renders an organic botanical sprig with a central flexible stem and 8–12 realistic,
 * pointed ovate leaves with gradient shading, leaf ribs, lateral veins, and transparent background.
 */
export function generateLeafSprigTexture(baseGreen = '#4e8236', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  ctx.clearRect(0, 0, size, size);

  // Central twig stem
  const startX = size * 0.50;
  const startY = size * 0.96;
  const endX = size * (0.48 + (r() - 0.5) * 0.06);
  const endY = size * 0.08;
  const ctrlX = size * (0.52 + (r() - 0.5) * 0.10);
  const ctrlY = size * 0.52;

  ctx.strokeStyle = '#433b25';
  ctx.lineWidth = 5.0;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
  ctx.stroke();

  // Helper: draw single organic leaf
  function drawLeaf(x0, y0, angle, leafLength, leafWidth, leafColor, highlightColor) {
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(angle);

    // Leaf blade path with curved belly and pointed apex
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      leafLength * 0.35, -leafWidth * 0.65,
      leafLength * 0.70, -leafWidth * 0.55,
      leafLength, 0
    );
    ctx.bezierCurveTo(
      leafLength * 0.70, leafWidth * 0.55,
      leafLength * 0.35, leafWidth * 0.65,
      0, 0
    );
    ctx.closePath();

    // Leaf gradient fill
    const grad = ctx.createLinearGradient(0, 0, leafLength, 0);
    grad.addColorStop(0, '#2d541e');
    grad.addColorStop(0.45, leafColor);
    grad.addColorStop(1, highlightColor);
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle leaf rim for definition
    ctx.strokeStyle = 'rgba(28, 48, 16, 0.45)';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Leaf central rib
    ctx.strokeStyle = 'rgba(175, 218, 130, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(leafLength * 0.5, -leafWidth * 0.04, leafLength * 0.94, 0);
    ctx.stroke();

    // Secondary side veins
    const numVeins = 4;
    ctx.strokeStyle = 'rgba(175, 218, 130, 0.28)';
    ctx.lineWidth = 0.9;
    for (let v = 1; v <= numVeins; v++) {
      const vx = leafLength * (v / (numVeins + 1));
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx + leafLength * 0.12, -leafWidth * 0.38);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx + leafLength * 0.12, leafWidth * 0.38);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Nodes along the stem
  const numNodes = 7;
  const leafPalette = [
    { base: '#4e8236', hi: '#82c253' },
    { base: '#3f702b', hi: '#73b044' },
    { base: '#5c9441', hi: '#94d65e' },
    { base: '#366122', hi: '#6ca83a' },
  ];

  for (let n = 1; n <= numNodes; n++) {
    const u = n / (numNodes + 0.8);
    const inv = 1 - u;
    const nx = inv * inv * startX + 2 * inv * u * ctrlX + u * u * endX;
    const ny = inv * inv * startY + 2 * inv * u * ctrlY + u * u * endY;

    const tx = 2 * (1 - u) * (ctrlX - startX) + 2 * u * (endX - ctrlX);
    const ty = 2 * (1 - u) * (ctrlY - startY) + 2 * u * (endY - ctrlY);
    const stemAngle = Math.atan2(ty, tx);

    const leafSizeScale = (0.75 + (1 - u) * 0.45) * (size * 0.22);
    const pair = leafPalette[Math.floor(r() * leafPalette.length)];

    // Left leaf
    const leftAngle = stemAngle - (Math.PI * 0.42 + (r() - 0.5) * 0.25);
    drawLeaf(nx, ny, leftAngle, leafSizeScale * (0.9 + r() * 0.2), leafSizeScale * 0.42, pair.base, pair.hi);

    // Right leaf
    const rightAngle = stemAngle + (Math.PI * 0.42 + (r() - 0.5) * 0.25);
    drawLeaf(nx, ny, rightAngle, leafSizeScale * (0.9 + r() * 0.2), leafSizeScale * 0.42, pair.base, pair.hi);
  }

  // Apex terminal leaves
  const apexPair = leafPalette[0];
  drawLeaf(endX, endY, -Math.PI / 2, size * 0.16, size * 0.07, apexPair.base, apexPair.hi);
  drawLeaf(endX, endY, -Math.PI / 2 - 0.35, size * 0.14, size * 0.06, apexPair.base, apexPair.hi);
  drawLeaf(endX, endY, -Math.PI / 2 + 0.35, size * 0.14, size * 0.06, apexPair.base, apexPair.hi);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function generateFoliageTexture(baseColor = '#4e7e38', { size = 256, seed = 1 } = {}) {
  return generateLeafSprigTexture(baseColor, { size, seed });
}

/**
 * Procedural Stone Wall / Pavement Texture:
 * Fine sedimentary grains, micro-pits, and delicate hairline fractures.
 */
export function generateStoneTexture(baseColor = '#948c82', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Micro mineral specks
  for (let i = 0; i < 900; i++) {
    const x = r() * size;
    const y = r() * size;
    const w = 1.2 + r() * 3.0;
    const h = 1.2 + r() * 2.8;
    const isDark = r() > 0.42;
    ctx.fillStyle = isDark
      ? `rgba(45, 39, 34, ${0.12 + r() * 0.18})`
      : `rgba(235, 228, 218, ${0.14 + r() * 0.22})`;
    ctx.fillRect(x, y, w, h);
  }

  // Hairline surface micro-fractures
  for (let v = 0; v < 12; v++) {
    let vx = r() * size;
    let vy = r() * size;
    ctx.strokeStyle = `rgba(38, 33, 28, ${0.18 + r() * 0.22})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    for (let s = 0; s < 7; s++) {
      vx += (r() - 0.5) * 36;
      vy += r() * 32;
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function generateStoneBumpMap({ size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed + 44);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 800; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 1.0 + r() * 3.2;
    const isRaised = r() > 0.5;
    ctx.fillStyle = isRaised ? 'rgba(230, 230, 230, 0.18)' : 'rgba(30, 30, 30, 0.22)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Procedural Road Asphalt Map:
 * Crushed aggregate specks, bitumen matrix, subtle traffic wear streaks.
 */
export function generateAsphaltTexture(style = 'normal', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  const base = style === 'modern' ? '#27292d' : '#3c3f44';
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Subtle longitudinal traffic wear track
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.28, 'rgba(25, 26, 28, 0.35)');
  grad.addColorStop(0.50, 'rgba(0,0,0,0)');
  grad.addColorStop(0.72, 'rgba(25, 26, 28, 0.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fine mineral aggregate specks
  const count = style === 'modern' ? 1200 : 2200;
  for (let i = 0; i < count; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 0.8 + r() * (style === 'modern' ? 1.6 : 2.4);
    const alpha = 0.12 + r() * 0.22;
    const isBright = r() > 0.46;
    ctx.fillStyle = isBright
      ? `rgba(215, 218, 222, ${alpha})`
      : `rgba(16, 17, 18, ${alpha * 1.4})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function generateAsphaltBumpMap(style = 'normal', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed + 12);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const count = style === 'modern' ? 800 : 1600;
  for (let i = 0; i < count; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 0.7 + r() * 2.0;
    const isHigh = r() > 0.5;
    ctx.fillStyle = isHigh ? 'rgba(220, 220, 220, 0.20)' : 'rgba(30, 30, 30, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  return tex;
}

export function generateAsphaltRoughnessMap(style = 'normal', { size = 256, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');

  const baseGrey = style === 'modern' ? 160 : 210;
  ctx.fillStyle = `rgb(${baseGrey}, ${baseGrey}, ${baseGrey})`;
  ctx.fillRect(0, 0, size, size);

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.28, 'rgba(50, 50, 50, 0.32)');
  grad.addColorStop(0.50, 'rgba(0,0,0,0)');
  grad.addColorStop(0.72, 'rgba(50, 50, 50, 0.32)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  return tex;
}

// ---------------------------------------------------------------------------
// 2. Tapered Tube Geometry Builder (Curved limbs & branches)
// ---------------------------------------------------------------------------

/**
 * Builds a continuous, seamless 3D tapered tube along a CatmullRomCurve3,
 * smoothly interpolating radius from rStart at u=0 to rEnd at u=1 with proper Frenet frames.
 * UV mapping is aligned so vertical bark striations on the canvas run UP the trunk length.
 */
export function createTaperedTubeGeometry(
  curve,
  tubularSegments = 20,
  radialSegments = 12,
  rStart = 0.20,
  rEnd = 0.05,
  uRepeat = 2.0
) {
  const points = curve.getSpacedPoints(tubularSegments);
  const frames = curve.computeFrenetFrames(tubularSegments, false);

  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    const p = points[i];
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = rStart + (rEnd - rStart) * u;

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const theta = v * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = -Math.cos(theta);

      const nx = cos * N.x + sin * B.x;
      const ny = cos * N.y + sin * B.y;
      const nz = cos * N.z + sin * B.z;

      vertices.push(p.x + r * nx, p.y + r * ny, p.z + r * nz);
      normals.push(nx, ny, nz);
      // Canvas Y has vertical bark striations; map u (length) along Y, and v (radial) along X
      uvs.push(v * 2.0, u * uRepeat);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

// ---------------------------------------------------------------------------
// 3. Realistic 3D Trees (buildRealisticTree3D)
// ---------------------------------------------------------------------------

export function buildRealisticTree3D({
  height = 3.4,
  trunkRadius = 0.15,
  crownRadius = 1.30,
  foliageColor = '#4e8236',
  barkColor = '#4d3929',
  seed = 1,
} = {}) {
  const tree = new THREE.Group();
  tree.name = `realistic_tree_3d_${seed}`;
  const r = rng(seed);

  // High-detail bark material with bumpMap for vertical ridges/furrows
  const barkTex = generateBarkTexture(barkColor, { size: 512, seed });
  const barkBump = generateBarkBumpMap({ size: 512, seed });
  const barkMat = new THREE.MeshStandardMaterial({
    map: barkTex,
    bumpMap: barkBump,
    bumpScale: 0.065,
    roughness: 0.90,
    metalness: 0.0,
  });

  // Multi-leaf botanical sprig textures in varied green tones
  const sprigColors = ['#4e8236', '#3e702a', '#5c9641', '#68a348'];
  const sprigMaterials = sprigColors.map((col, idx) => {
    const sprigTex = generateLeafSprigTexture(col, { size: 512, seed: seed + idx * 17 });
    return new THREE.MeshStandardMaterial({
      map: sprigTex,
      alphaTest: 0.32,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.72,
      metalness: 0.02,
    });
  });

  // A. Organic Root Buttresses at Base
  const rootCount = 4;
  for (let i = 0; i < rootCount; i++) {
    const angle = (i / rootCount) * Math.PI * 2 + (r() - 0.5) * 0.35;
    const rootLen = trunkRadius * (1.6 + r() * 0.6);
    const rootP0 = new THREE.Vector3(0, trunkRadius * 1.1, 0);
    const rootP1 = new THREE.Vector3(
      Math.cos(angle) * (trunkRadius * 1.25),
      trunkRadius * 0.40,
      Math.sin(angle) * (trunkRadius * 1.25)
    );
    const rootP2 = new THREE.Vector3(
      Math.cos(angle) * (trunkRadius + rootLen),
      0.002,
      Math.sin(angle) * (trunkRadius + rootLen)
    );
    const rootCurve = new THREE.CatmullRomCurve3([rootP0, rootP1, rootP2]);
    const rootGeo = createTaperedTubeGeometry(rootCurve, 10, 8, trunkRadius * 0.60, trunkRadius * 0.14, 1.0);
    const rootMesh = new THREE.Mesh(rootGeo, barkMat);
    rootMesh.castShadow = true;
    rootMesh.receiveShadow = true;
    tree.add(rootMesh);
  }

  // B. Main Curved Tapered Trunk
  const leanX = (r() - 0.5) * 0.18;
  const leanZ = (r() - 0.5) * 0.16;
  const trunkTopY = height * 0.82;

  const trunkP0 = new THREE.Vector3(0, 0, 0);
  const trunkP1 = new THREE.Vector3(leanX * 0.35, height * 0.28, leanZ * 0.35);
  const trunkP2 = new THREE.Vector3(leanX * 0.75, height * 0.58, leanZ * 0.75);
  const trunkP3 = new THREE.Vector3(leanX, trunkTopY, leanZ);

  const trunkCurve = new THREE.CatmullRomCurve3([trunkP0, trunkP1, trunkP2, trunkP3]);
  const trunkGeo = createTaperedTubeGeometry(
    trunkCurve,
    24,
    14,
    trunkRadius * 1.40,
    trunkRadius * 0.40,
    3.5
  );
  const trunkMesh = new THREE.Mesh(trunkGeo, barkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  tree.add(trunkMesh);

  // Helper: Create 3D Leaf Cluster of Angled Botanical Sprig Cards
  function createSprigCluster(numCards = 7, clusterRadius = 0.42) {
    const cluster = new THREE.Group();
    for (let c = 0; c < numCards; c++) {
      const cardW = clusterRadius * (0.82 + r() * 0.35);
      const cardH = cardW * 1.15;
      const cardGeo = new THREE.PlaneGeometry(cardW, cardH);
      cardGeo.translate(0, cardH * 0.42, 0);

      const mat = sprigMaterials[Math.floor(r() * sprigMaterials.length)];
      const card = new THREE.Mesh(cardGeo, mat);

      const phi = r() * Math.PI * 2;
      const theta = (0.2 + r() * 0.65) * (Math.PI / 2);
      const dist = clusterRadius * (0.22 + r() * 0.45);

      card.position.set(
        Math.cos(phi) * Math.sin(theta) * dist,
        Math.cos(theta) * dist,
        Math.sin(phi) * Math.sin(theta) * dist
      );

      card.rotation.x = (r() - 0.5) * 1.4;
      card.rotation.y = phi + (r() - 0.5) * 0.8;
      card.rotation.z = (r() - 0.5) * 0.9;

      card.castShadow = false;
      card.receiveShadow = true;
      cluster.add(card);
    }
    return cluster;
  }

  // C. 5 Forked Primary and Secondary Branches
  const windBranches = [];
  const numPrimary = 5;

  for (let b = 0; b < numPrimary; b++) {
    // Branches attach starting nicely in mid-trunk (38% to 78% height)
    const uAttach = 0.38 + (b / numPrimary) * 0.40;
    const attachPt = trunkCurve.getPointAt(uAttach);
    const branchAngle = (b / numPrimary) * Math.PI * 2 + (r() - 0.5) * 0.45;

    const pivot = new THREE.Group();
    pivot.position.copy(attachPt);
    pivot.userData = {
      baseRotX: 0,
      baseRotZ: 0,
      phase: b * 1.35 + r() * 0.7,
      leafClusters: [],
    };

    const branchLen = height * (0.32 + r() * 0.12);
    const outX = Math.cos(branchAngle) * branchLen;
    const outZ = Math.sin(branchAngle) * branchLen;
    const liftY = branchLen * (0.42 + (r() - 0.5) * 0.14);

    const bP0 = new THREE.Vector3(0, 0, 0);
    const bP1 = new THREE.Vector3(outX * 0.48, liftY * 0.40, outZ * 0.48);
    const bP2 = new THREE.Vector3(outX, liftY, outZ);

    const branchCurve = new THREE.CatmullRomCurve3([bP0, bP1, bP2]);
    const branchRadStart = trunkRadius * (0.44 - (uAttach - 0.3) * 0.18);
    const branchRadEnd = trunkRadius * 0.12;
    const branchGeo = createTaperedTubeGeometry(branchCurve, 14, 10, branchRadStart, branchRadEnd, 2.0);
    const branchMesh = new THREE.Mesh(branchGeo, barkMat);
    branchMesh.castShadow = true;
    branchMesh.receiveShadow = true;
    pivot.add(branchMesh);

    // Primary branch tip leaf cluster
    const tipCluster = createSprigCluster(8, crownRadius * 0.40);
    tipCluster.position.copy(bP2);
    pivot.add(tipCluster);
    pivot.userData.leafClusters.push(tipCluster);

    // Mid-branch leaf cluster for lush foliage volume
    const midPt = branchCurve.getPointAt(0.62);
    const midCluster = createSprigCluster(6, crownRadius * 0.32);
    midCluster.position.copy(midPt);
    pivot.add(midCluster);
    pivot.userData.leafClusters.push(midCluster);

    // 1–2 Secondary Forked Branches splitting off
    const numSecondary = 1 + (r() > 0.4 ? 1 : 0);
    for (let s = 0; s < numSecondary; s++) {
      const uSec = 0.50 + s * 0.25;
      const secAttach = branchCurve.getPointAt(uSec);
      const secLen = branchLen * (0.44 + r() * 0.18);
      const secAngleOffset = (s === 0 ? 0.65 : -0.65) + (r() - 0.5) * 0.22;
      const secAngle = branchAngle + secAngleOffset;

      const secOutX = Math.cos(secAngle) * secLen;
      const secOutZ = Math.sin(secAngle) * secLen;
      const secLiftY = secLen * 0.55;

      const sP0 = secAttach.clone();
      const sP1 = new THREE.Vector3(secAttach.x + secOutX * 0.52, secAttach.y + secLiftY * 0.42, secAttach.z + secOutZ * 0.52);
      const sP2 = new THREE.Vector3(secAttach.x + secOutX, secAttach.y + secLiftY, secAttach.z + secOutZ);

      const secCurve = new THREE.CatmullRomCurve3([sP0, sP1, sP2]);
      const secGeo = createTaperedTubeGeometry(secCurve, 10, 8, branchRadStart * 0.50, trunkRadius * 0.08, 1.5);
      const secMesh = new THREE.Mesh(secGeo, barkMat);
      secMesh.castShadow = true;
      secMesh.receiveShadow = true;
      pivot.add(secMesh);

      const secCluster = createSprigCluster(6, crownRadius * 0.32);
      secCluster.position.copy(sP2);
      pivot.add(secCluster);
      pivot.userData.leafClusters.push(secCluster);
    }

    tree.add(pivot);
    windBranches.push(pivot);
  }

  // D. Apex Canopy Crown (top forks of the trunk)
  const crownGroup = new THREE.Group();
  crownGroup.position.copy(trunkP3);

  for (let a = 0; a < 3; a++) {
    const aAngle = (a / 3) * Math.PI * 2 + (r() - 0.5) * 0.4;
    const aLen = height * 0.20;
    const aX = Math.cos(aAngle) * aLen;
    const aZ = Math.sin(aAngle) * aLen;
    const aY = aLen * 0.80;

    const aP0 = new THREE.Vector3(0, 0, 0);
    const aP1 = new THREE.Vector3(aX * 0.5, aY * 0.5, aZ * 0.5);
    const aP2 = new THREE.Vector3(aX, aY, aZ);
    const aCurve = new THREE.CatmullRomCurve3([aP0, aP1, aP2]);
    const aGeo = createTaperedTubeGeometry(aCurve, 10, 8, trunkRadius * 0.32, trunkRadius * 0.08, 1.5);
    const aMesh = new THREE.Mesh(aGeo, barkMat);
    aMesh.castShadow = true;
    aMesh.receiveShadow = true;
    crownGroup.add(aMesh);

    const apexCluster = createSprigCluster(9, crownRadius * 0.42);
    apexCluster.position.copy(aP2);
    crownGroup.add(apexCluster);
  }

  tree.add(crownGroup);

  tree.userData = {
    windBranches,
    windCrown: crownGroup,
    seed,
  };

  return tree;
}

// ---------------------------------------------------------------------------
// 4. 3D Cobblestone Wall (buildCobblestoneWall3D)
// ---------------------------------------------------------------------------

export function buildCobblestoneWall3D({
  length = 8.0,
  height = 1.25,
  thickness = 0.26,
  stoneColor = '#948c82',
  mortarColor = '#665d54',
  seed = 42,
} = {}) {
  const wall = new THREE.Group();
  wall.name = `cobblestone_wall_3d_${seed}`;
  const r = rng(seed);

  const stoneTex = generateStoneTexture(stoneColor, { size: 512, seed });
  const stoneBump = generateStoneBumpMap({ size: 512, seed });

  // Natural quarried stone palette: warm grey, sandstone, weathered slate, and base moss/grime
  const stoneMaterials = {
    warmGrey: [
      new THREE.MeshStandardMaterial({ color: '#8e8880', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.88, metalness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: '#9d968e', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.86, metalness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: '#7c766f', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.90, metalness: 0.02 }),
    ],
    sandstone: [
      new THREE.MeshStandardMaterial({ color: '#b6a793', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.86, metalness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: '#a89885', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.87, metalness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: '#c4b49f', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.84, metalness: 0.02 }),
    ],
    slate: [
      new THREE.MeshStandardMaterial({ color: '#686662', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.89, metalness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: '#777470', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.88, metalness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: '#595754', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.92, metalness: 0.02 }),
    ],
    mossyBase: [
      new THREE.MeshStandardMaterial({ color: '#525b3e', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.92, metalness: 0.01 }),
      new THREE.MeshStandardMaterial({ color: '#444d32', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.94, metalness: 0.01 }),
      new THREE.MeshStandardMaterial({ color: '#5e6847', map: stoneTex, bumpMap: stoneBump, bumpScale: 0.035, roughness: 0.90, metalness: 0.01 }),
    ],
  };

  const mortarMat = new THREE.MeshStandardMaterial({
    color: mortarColor,
    roughness: 0.94,
    metalness: 0.0,
  });

  // A. Recessed Mortar Backing Bed
  const mortarBed = new THREE.Mesh(
    new THREE.BoxGeometry(length, height, thickness * 0.82),
    mortarMat
  );
  mortarBed.position.set(0, height / 2, 0);
  mortarBed.castShadow = true;
  mortarBed.receiveShadow = true;
  wall.add(mortarBed);

  // Helper: Generate Irregular 4–6 Sided Rounded/Faceted Stone Shape
  function createFacetedStoneShape(w, h, numPoints = 5) {
    const pts = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * Math.PI * 2;
      const radNoiseX = 1 + (r() - 0.5) * 0.24;
      const radNoiseY = 1 + (r() - 0.5) * 0.24;
      const x = (Math.cos(theta) * (w * 0.5)) * radNoiseX;
      const y = (Math.sin(theta) * (h * 0.5)) * radNoiseY;
      pts.push(new THREE.Vector2(x, y));
    }
    const shape = new THREE.Shape();
    shape.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i].x, pts[i].y);
    }
    shape.closePath();
    return shape;
  }

  // B. Staggered Courses of Individually Extruded Faceted Stone Blocks
  const courseH = 0.145;
  const numCourses = Math.floor(height / courseH);

  for (let c = 0; c < numCourses; c++) {
    const courseY = c * courseH + courseH / 2;
    let currX = -length / 2 + 0.02;
    const rowOffset = (c % 2 === 0) ? 0 : 0.12;
    currX += rowOffset;

    const isBottomCourse = c === 0;

    while (currX < length / 2 - 0.04) {
      const stoneW = 0.24 + r() * 0.16;
      const stoneH = courseH * (0.88 + r() * 0.12);
      const stoneD = thickness * (0.90 + r() * 0.18);
      const numVerts = 4 + Math.floor(r() * 3);

      const shape = createFacetedStoneShape(stoneW, stoneH, numVerts);
      const blockGeo = new THREE.ExtrudeGeometry(shape, {
        depth: stoneD,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.013,
        bevelSegments: 2,
      });
      blockGeo.center();

      let mat;
      if (isBottomCourse && r() > 0.25) {
        mat = stoneMaterials.mossyBase[Math.floor(r() * stoneMaterials.mossyBase.length)];
      } else {
        const pRoll = r();
        if (pRoll < 0.45) {
          mat = stoneMaterials.warmGrey[Math.floor(r() * stoneMaterials.warmGrey.length)];
        } else if (pRoll < 0.80) {
          mat = stoneMaterials.sandstone[Math.floor(r() * stoneMaterials.sandstone.length)];
        } else {
          mat = stoneMaterials.slate[Math.floor(r() * stoneMaterials.slate.length)];
        }
      }

      const block = new THREE.Mesh(blockGeo, mat);
      const xPos = Math.min(currX + stoneW / 2, length / 2 - stoneW * 0.45);
      const zOffset = (r() - 0.5) * 0.022;

      block.position.set(xPos, courseY, zOffset);
      block.rotation.z = (r() - 0.5) * 0.035;
      block.rotation.y = (r() - 0.5) * 0.045;
      block.rotation.x = (r() - 0.5) * 0.035;

      block.castShadow = true;
      block.receiveShadow = true;
      wall.add(block);

      currX += stoneW + 0.012; // Tight mortar joint
    }
  }

  // C. Beveled Top Coping Slab
  const capOverhang = 0.035;
  const capH = 0.085;
  const capW = thickness + capOverhang * 2;
  const capShape = new THREE.Shape();
  const ch = 0.018;
  capShape.moveTo(-capW / 2, 0);
  capShape.lineTo(capW / 2, 0);
  capShape.lineTo(capW / 2, capH - ch);
  capShape.lineTo(capW / 2 - ch, capH);
  capShape.lineTo(-capW / 2 + ch, capH);
  capShape.lineTo(-capW / 2, capH - ch);
  capShape.closePath();

  const capGeo = new THREE.ExtrudeGeometry(capShape, {
    depth: length + 0.06,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
  capGeo.center();

  const capMat = new THREE.MeshStandardMaterial({
    color: '#a0988e',
    map: stoneTex,
    bumpMap: stoneBump,
    bumpScale: 0.03,
    roughness: 0.82,
    metalness: 0.02,
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.rotation.y = Math.PI / 2;
  cap.position.set(0, height + capH / 2, 0);
  cap.castShadow = true;
  cap.receiveShadow = true;
  wall.add(cap);

  return wall;
}

// ---------------------------------------------------------------------------
// 5. 3D Road (buildRoad3D)
// ---------------------------------------------------------------------------

export function buildRoad3D({
  width = 2.4,
  length = 16.0,
  style = 'normal', // 'cobblestone' | 'normal' | 'modern'
  curbWidth = 0.20,
  curbHeight = 0.065,
  seed = 7,
} = {}) {
  const road = new THREE.Group();
  road.name = `road_3d_${style}_${seed}`;
  const r = rng(seed);

  const roadBedH = 0.12;

  if (style === 'cobblestone') {
    // 3D Cobblestone Pavers & Recessed Mortar Joints
    const mortarBedMat = new THREE.MeshStandardMaterial({
      color: '#2a2624',
      roughness: 0.96,
      metalness: 0.0,
    });
    const baseBed = new THREE.Mesh(
      new THREE.BoxGeometry(width, roadBedH, length),
      mortarBedMat
    );
    baseBed.position.set(0, -roadBedH / 2, 0);
    baseBed.receiveShadow = true;
    road.add(baseBed);

    const stoneTex = generateStoneTexture('#6e6862', { size: 512, seed });
    const stoneBump = generateStoneBumpMap({ size: 512, seed });
    const paverPalette = ['#6e6862', '#7d7770', '#5a5550', '#8a837c', '#625c56'];
    const paverMaterials = paverPalette.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: c,
          map: stoneTex,
          bumpMap: stoneBump,
          bumpScale: 0.03,
          roughness: 0.86,
          metalness: 0.02,
        })
    );

    const rowH = 0.22;
    const numRows = Math.floor(length / rowH);
    const paversPerRow = 7;
    const paverW = (width - 0.14) / paversPerRow;

    for (let row = 0; row < numRows; row++) {
      const zPos = -length / 2 + row * rowH + rowH / 2;
      const stagger = (row % 2 === 0) ? 0 : paverW * 0.45;

      for (let col = 0; col < paversPerRow; col++) {
        const xPos = -width / 2 + 0.07 + col * paverW + paverW / 2 + (stagger * 0.2);
        if (Math.abs(xPos) > width / 2 - 0.08) continue;

        const isFootingZone = Math.hypot(xPos, zPos) < 0.38;
        const pH = isFootingZone ? 0.020 : 0.020 + (r() - 0.5) * 0.005;

        const pShape = new THREE.Shape();
        const pw = (paverW * 0.86) / 2;
        const ph = (rowH * 0.86) / 2;
        const rad = 0.015;
        pShape.moveTo(-pw + rad, -ph);
        pShape.lineTo(pw - rad, -ph);
        pShape.quadraticCurveTo(pw, -ph, pw, -ph + rad);
        pShape.lineTo(pw, ph - rad);
        pShape.quadraticCurveTo(pw, ph, pw - rad, ph);
        pShape.lineTo(-pw + rad, ph);
        pShape.quadraticCurveTo(-pw, ph, -pw, ph - rad);
        pShape.lineTo(-pw, -ph + rad);
        pShape.quadraticCurveTo(-pw, -ph, -pw + rad, -ph);

        const paverGeo = new THREE.ExtrudeGeometry(pShape, {
          depth: pH,
          bevelEnabled: true,
          bevelThickness: 0.005,
          bevelSize: 0.005,
          bevelSegments: 2,
        });
        paverGeo.center();

        const pMat = paverMaterials[Math.floor(r() * paverMaterials.length)];
        const paver = new THREE.Mesh(paverGeo, pMat);
        paver.rotation.x = -Math.PI / 2;

        paver.position.set(xPos, -pH * 0.2 + 0.002, zPos);
        if (!isFootingZone) {
          paver.rotation.z = (r() - 0.5) * 0.04;
          paver.position.y += (r() - 0.5) * 0.003;
        }
        paver.receiveShadow = true;
        road.add(paver);
      }
    }
  } else {
    // Normal or Modern Asphalt Road with procedural Map + Bump + Roughness
    const asphaltTex = generateAsphaltTexture(style, { size: 1024, seed });
    const asphaltBump = generateAsphaltBumpMap(style, { size: 512, seed });
    const asphaltRough = generateAsphaltRoughnessMap(style, { size: 256, seed });

    const asphaltMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      bumpMap: asphaltBump,
      bumpScale: 0.028,
      roughnessMap: asphaltRough,
      roughness: style === 'modern' ? 0.65 : 0.84,
      metalness: 0.01,
    });
    const asphaltMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, roadBedH, length),
      asphaltMat
    );
    asphaltMesh.position.set(0, -roadBedH / 2, 0);
    asphaltMesh.receiveShadow = true;
    road.add(asphaltMesh);

    // Gutter edge darkening along curb line (width 0.08m)
    const gutterW = 0.08;
    const gutterMat = new THREE.MeshStandardMaterial({
      color: '#282a2c',
      roughness: 0.60,
      metalness: 0.02,
    });
    [-1, 1].forEach((side) => {
      const gutter = new THREE.Mesh(
        new THREE.PlaneGeometry(gutterW, length),
        gutterMat
      );
      gutter.rotation.x = -Math.PI / 2;
      gutter.position.set(side * (width / 2 - gutterW / 2), 0.0005, 0);
      gutter.receiveShadow = true;
      road.add(gutter);
    });

    // Crisp Road Markings using polygonOffset to guarantee zero Z-fighting
    if (style === 'normal') {
      const dashLen = 0.8;
      const gapLen = 0.8;
      const dashW = 0.10;
      const numDashes = Math.floor(length / (dashLen + gapLen));

      const lineMat = new THREE.MeshBasicMaterial({
        color: '#ede7dc',
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      for (let d = 0; d < numDashes; d++) {
        const zCenter = -length / 2 + d * (dashLen + gapLen) + dashLen / 2;
        // Keep clear around character footing [0, 0, 0]
        if (Math.abs(zCenter) < 0.45) continue;

        const dashGeo = new THREE.PlaneGeometry(dashW, dashLen);
        const dash = new THREE.Mesh(dashGeo, lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.001, zCenter);
        dash.receiveShadow = true;
        road.add(dash);
      }
    } else if (style === 'modern') {
      const stripeW = 0.09;
      const stripeMat = new THREE.MeshBasicMaterial({
        color: '#f5f7f8',
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      [-1, 1].forEach((side) => {
        const stripeGeo = new THREE.PlaneGeometry(stripeW, length);
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(side * (width / 2 - curbWidth - stripeW / 2 - 0.04), 0.001, 0);
        stripe.receiveShadow = true;
        road.add(stripe);
      });

      const yellowMat = new THREE.MeshBasicMaterial({
        color: '#f2b824',
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const dashLen = 0.9;
      const gapLen = 0.7;
      const numDashes = Math.floor(length / (dashLen + gapLen));

      for (let d = 0; d < numDashes; d++) {
        const zCenter = -length / 2 + d * (dashLen + gapLen) + dashLen / 2;
        if (Math.abs(zCenter) < 0.45) continue;

        const dashGeo = new THREE.PlaneGeometry(0.11, dashLen);
        const dash = new THREE.Mesh(dashGeo, yellowMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.001, zCenter);
        dash.receiveShadow = true;
        road.add(dash);
      }
    }
  }

  // 3D Chamfered / Beveled Curbs running parallel along Z
  const curbTex = generateStoneTexture('#948e86', { size: 512, seed });
  const curbBump = generateStoneBumpMap({ size: 512, seed });
  const curbMat = new THREE.MeshStandardMaterial({
    color: '#948e86',
    map: curbTex,
    bumpMap: curbBump,
    bumpScale: 0.03,
    roughness: 0.85,
    metalness: 0.02,
  });

  const chamfer = 0.032;
  // Battered curb cross-section in XY plane:
  // (0,0) is bottom with chamfer above it; (curbWidth, 0) is vertical back
  const curbShape = new THREE.Shape();
  curbShape.moveTo(0, 0);
  curbShape.lineTo(curbWidth, 0);
  curbShape.lineTo(curbWidth, curbHeight);
  curbShape.lineTo(chamfer, curbHeight);
  curbShape.lineTo(0, curbHeight - chamfer);
  curbShape.closePath();

  // Extruded along Z (length 16.0)
  const curbGeo = new THREE.ExtrudeGeometry(curbShape, {
    depth: length,
    bevelEnabled: false,
  });
  curbGeo.center();

  // Right Curb: placed at +X. Chamfer at -curbWidth/2 faces inward (-X) toward the road
  const curbRight = new THREE.Mesh(curbGeo, curbMat);
  curbRight.position.set(width / 2 + curbWidth / 2, curbHeight / 2, 0);
  curbRight.castShadow = true;
  curbRight.receiveShadow = true;
  road.add(curbRight);

  // Left Curb: placed at -X. Rotate by PI around Y so chamfer faces inward (+X) toward the road
  const curbLeft = new THREE.Mesh(curbGeo.clone(), curbMat);
  curbLeft.rotation.y = Math.PI;
  curbLeft.position.set(-(width / 2 + curbWidth / 2), curbHeight / 2, 0);
  curbLeft.castShadow = true;
  curbLeft.receiveShadow = true;
  road.add(curbLeft);

  return road;
}

// ---------------------------------------------------------------------------
// 6. Environment Stage & Atmospheric Lighting (setupEnvironmentStage)
// ---------------------------------------------------------------------------

export function setupEnvironmentStage(scene, renderer, camera, {
  sunAngleDeg = -32,
  skyColor = '#d2cdc3',
  fogDensity = 0.022,
  shadows = true,
} = {}) {
  scene.background = new THREE.Color(skyColor);
  scene.fog = new THREE.FogExp2(skyColor, fogDensity);

  if (renderer) {
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
  }

  if (camera) {
    camera.fov = 36;
    camera.position.set(0.5, 1.7, 4.2);
    camera.lookAt(0.1, 0.98, -0.2);
    camera.updateProjectionMatrix();
  }

  // Outdoor Ambient / Hemisphere Light
  const hemi = new THREE.HemisphereLight('#fff8ea', '#5c5448', 1.05);
  scene.add(hemi);

  // Directional Sun Key Light with PCF Soft Shadows
  const sunLight = new THREE.DirectionalLight('#fff4dc', 1.45);
  sunLight.position.set(-4.5, 8.8, 4.8);
  sunLight.castShadow = shadows;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 30;
  sunLight.shadow.camera.left = -8;
  sunLight.shadow.camera.right = 8;
  sunLight.shadow.camera.top = 8;
  sunLight.shadow.camera.bottom = -4;
  sunLight.shadow.bias = -0.0003;
  scene.add(sunLight);

  // Soft fill light
  const fillLight = new THREE.DirectionalLight('#e0e8f5', 0.45);
  fillLight.position.set(4, 5, 2);
  scene.add(fillLight);

  // Ground plane receiving shadows
  const groundGeo = new THREE.PlaneGeometry(40, 40);
  const groundMat = new THREE.MeshStandardMaterial({
    color: '#8a8277',
    roughness: 0.94,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.002;
  ground.receiveShadow = true;
  scene.add(ground);

  return { hemi, sunLight, fillLight, ground };
}

// ---------------------------------------------------------------------------
// 7. Deterministic Breeze Sway (animateEnvironment)
// ---------------------------------------------------------------------------

export function animateEnvironment(envGroup, t, { windSpeed = 1.6, windStrength = 0.026 } = {}) {
  if (!envGroup) return;

  envGroup.traverse((obj) => {
    if (obj.userData?.windBranches) {
      const branches = obj.userData.windBranches;
      for (let i = 0; i < branches.length; i++) {
        const b = branches[i];
        const phase = b.userData.phase || i * 1.3;
        // Deterministic sway driven strictly by t in seconds
        const swayZ = Math.sin(t * windSpeed + phase) * windStrength;
        const swayX = Math.cos(t * (windSpeed * 0.82) + phase) * (windStrength * 0.70);
        b.rotation.z = (b.userData.baseRotZ || 0) + swayZ;
        b.rotation.x = (b.userData.baseRotX || 0) + swayX;

        // Leaf flutter on secondary sprig clusters
        if (b.userData.leafClusters) {
          for (let j = 0; j < b.userData.leafClusters.length; j++) {
            const lc = b.userData.leafClusters[j];
            const flutter = Math.sin(t * 3.4 + phase + j) * 0.016;
            lc.rotation.z = flutter;
          }
        }
      }
    }

    if (obj.userData?.windCrown) {
      const crown = obj.userData.windCrown;
      crown.rotation.z = Math.sin(t * (windSpeed * 0.9)) * (windStrength * 0.6);
      crown.rotation.x = Math.cos(t * (windSpeed * 0.7)) * (windStrength * 0.4);
    }
  });
}
