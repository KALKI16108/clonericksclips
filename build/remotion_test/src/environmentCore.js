// environmentCore.js
// Batch 1 3D Environment System for Three.js / Remotion.
// Provides realistic 3D Trees (tapered trunk, root flare, secondary limbs, layered 3D foliage),
// 3D Cobblestone Wall (recessed mortar, individually varied/tilted stone blocks, beveled coping cap),
// and 3D Road ('cobblestone', 'normal', 'modern' with raised 3D curbs and zero Z-fighting).
// Enforces:
// 1. True 3D geometry (no flat planes or cardboard cutouts).
// 2. Zero #1b1817 ink outlines on environment meshes.
// 3. PCFSoftShadowMap casting/receiving and THREE.FogExp2 atmospheric depth haze.
// 4. Deterministic breeze sway driven by t in seconds with fixed branch pivot points.

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

export function generateBarkTexture(baseColor = '#533e2d', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Vertical bark striations with subtle horizontal wave
  const numStreaks = 260;
  for (let i = 0; i < numStreaks; i++) {
    const xBase = r() * size;
    const w = 1.2 + r() * 3.2;
    const alpha = 0.12 + r() * 0.20;
    const isDark = r() > 0.4;
    ctx.strokeStyle = isDark ? `rgba(28, 19, 13, ${alpha})` : `rgba(135, 105, 80, ${alpha})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(xBase, 0);

    const freq = 0.015 + r() * 0.018;
    const amp = 3 + r() * 5;
    for (let y = 0; y <= size; y += 16) {
      const x = xBase + Math.sin(y * freq) * amp;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Bark knots / pores
  const knots = 14;
  for (let k = 0; k < knots; k++) {
    const kx = r() * size;
    const ky = r() * size;
    const krx = 5 + r() * 9;
    const kry = 12 + r() * 26;
    ctx.fillStyle = `rgba(22, 14, 9, ${0.25 + r() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(kx, ky, krx, kry, (r() - 0.5) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function generateFoliageTexture(baseColor = '#4e7e38', { size = 256, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const colors = [
    'rgba(42, 70, 30, 0.28)',
    'rgba(95, 145, 68, 0.32)',
    'rgba(122, 175, 85, 0.26)',
    'rgba(30, 52, 22, 0.35)',
  ];

  for (let i = 0; i < 450; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 4 + r() * 10;
    ctx.fillStyle = colors[Math.floor(r() * colors.length)];
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function generateStoneTexture(baseColor = '#948c82', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Sedimentary grain specks
  for (let i = 0; i < 700; i++) {
    const x = r() * size;
    const y = r() * size;
    const w = 1.5 + r() * 3.5;
    const h = 1.5 + r() * 3.0;
    const isDark = r() > 0.45;
    ctx.fillStyle = isDark
      ? `rgba(48, 42, 38, ${0.10 + r() * 0.16})`
      : `rgba(225, 218, 208, ${0.14 + r() * 0.20})`;
    ctx.fillRect(x, y, w, h);
  }

  // Faint micro-fractures
  for (let v = 0; v < 10; v++) {
    let vx = r() * size;
    let vy = r() * size;
    ctx.strokeStyle = `rgba(40, 35, 30, ${0.14 + r() * 0.18})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    for (let s = 0; s < 6; s++) {
      vx += (r() - 0.5) * 45;
      vy += r() * 40;
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function generateAsphaltTexture(style = 'normal', { size = 512, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = rng(seed);

  const base = style === 'modern' ? '#25272b' : '#3e4145';
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const count = style === 'modern' ? 600 : 1400;
  for (let i = 0; i < count; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 0.8 + r() * (style === 'modern' ? 1.5 : 2.5);
    const alpha = 0.10 + r() * 0.18;
    const isBright = r() > 0.48;
    ctx.fillStyle = isBright
      ? `rgba(205, 208, 212, ${alpha})`
      : `rgba(14, 15, 16, ${alpha * 1.3})`;
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

// ---------------------------------------------------------------------------
// 2. Realistic 3D Trees (buildRealisticTree3D)
// ---------------------------------------------------------------------------

export function buildRealisticTree3D({
  height = 4.4,
  trunkRadius = 0.16,
  crownRadius = 1.25,
  foliageColor = '#4e7e38',
  barkColor = '#533e2d',
  seed = 1,
} = {}) {
  const tree = new THREE.Group();
  tree.name = `tree_3d_${seed}`;
  const r = rng(seed);

  const barkTex = generateBarkTexture(barkColor, { size: 512, seed });
  const barkMat = new THREE.MeshStandardMaterial({
    map: barkTex,
    roughness: 0.90,
    metalness: 0.0,
  });

  const foliageTex = generateFoliageTexture(foliageColor, { size: 256, seed });
  const foliageMat = new THREE.MeshStandardMaterial({
    map: foliageTex,
    roughness: 0.72,
    metalness: 0.02,
  });

  // A. Root Flare Base (Ground level Y = 0)
  const rootFlareH = height * 0.12;
  const flareGeo = new THREE.CylinderGeometry(
    trunkRadius * 1.22,
    trunkRadius * 2.05,
    rootFlareH,
    14
  );
  const flareMesh = new THREE.Mesh(flareGeo, barkMat);
  flareMesh.position.y = rootFlareH / 2;
  flareMesh.castShadow = true;
  flareMesh.receiveShadow = true;
  tree.add(flareMesh);

  // 4 Organic Root Buttress projections
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + (r() - 0.5) * 0.4;
    const buttressLen = trunkRadius * 1.5;
    const bGeo = new THREE.ConeGeometry(trunkRadius * 0.65, rootFlareH * 1.25, 6);
    const buttress = new THREE.Mesh(bGeo, barkMat);
    buttress.position.set(
      Math.cos(angle) * (trunkRadius * 1.25),
      rootFlareH * 0.45,
      Math.sin(angle) * (trunkRadius * 1.25)
    );
    buttress.rotation.x = Math.sin(angle) * 0.38;
    buttress.rotation.z = -Math.cos(angle) * 0.38;
    buttress.castShadow = true;
    buttress.receiveShadow = true;
    tree.add(buttress);
  }

  // B. Main Tapered Trunk
  const trunkH = height * 0.68;
  const trunkGeo = new THREE.CylinderGeometry(
    trunkRadius * 0.65,
    trunkRadius * 1.22,
    trunkH,
    14
  );
  const trunkMesh = new THREE.Mesh(trunkGeo, barkMat);
  trunkMesh.position.y = rootFlareH + trunkH / 2;
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  tree.add(trunkMesh);

  // C. Secondary Branch Limbs with Fixed Attachment Pivots (Safeguard 2)
  const windBranches = [];
  const numBranches = 4;

  for (let b = 0; b < numBranches; b++) {
    const branchAngle = (b / numBranches) * Math.PI * 2 + (r() - 0.5) * 0.45;
    const branchHeightNorm = 0.45 + (b / numBranches) * 0.35;
    const attachY = rootFlareH + trunkH * branchHeightNorm;
    const trunkRadAtH = trunkRadius * (1.22 - branchHeightNorm * 0.57);

    // The pivot group is anchored EXACTLY at the trunk attachment point
    const pivot = new THREE.Group();
    pivot.position.set(
      Math.cos(branchAngle) * trunkRadAtH,
      attachY,
      Math.sin(branchAngle) * trunkRadAtH
    );
    pivot.userData = {
      baseRotX: 0,
      baseRotZ: 0,
      phase: b * 1.45 + r() * 0.8,
    };

    // Limb Geometry: Extends outward from (0, 0, 0)
    const limbLen = height * (0.28 + r() * 0.12);
    const limbRad = trunkRadius * (0.42 - b * 0.05);
    const limbGeo = new THREE.CylinderGeometry(limbRad * 0.55, limbRad, limbLen, 8);
    const limbMesh = new THREE.Mesh(limbGeo, barkMat);
    limbMesh.castShadow = true;
    limbMesh.receiveShadow = true;
    limbMesh.position.y = limbLen / 2;

    const limbHolder = new THREE.Group();
    limbHolder.add(limbMesh);

    // Angle limb outwards and upwards (38° to 52°)
    const elevation = 0.65 + (r() - 0.5) * 0.18;
    limbHolder.rotation.z = -elevation;
    limbHolder.rotation.y = branchAngle;
    pivot.add(limbHolder);

    // D. Layered 3D Foliage Clusters attached to limb tip
    const tipPos = new THREE.Vector3(
      Math.cos(branchAngle) * (Math.sin(elevation) * limbLen),
      Math.cos(elevation) * limbLen,
      Math.sin(branchAngle) * (Math.sin(elevation) * limbLen)
    );

    const clusterCount = 2;
    for (let c = 0; c < clusterCount; c++) {
      const cRad = crownRadius * (0.46 + r() * 0.20);
      const sphereGeo = new THREE.SphereGeometry(cRad, 12, 10);

      // Perturb vertices deterministically for organic lobe look
      const pos = sphereGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const dist = Math.hypot(vx, vy, vz) || 1;
        const noise = 1 + (r() - 0.5) * 0.20;
        pos.setXYZ(i, (vx / dist) * cRad * noise, (vy / dist) * cRad * noise, (vz / dist) * cRad * noise);
      }
      sphereGeo.computeVertexNormals();

      const clusterMesh = new THREE.Mesh(sphereGeo, foliageMat);
      clusterMesh.position.set(
        tipPos.x + (r() - 0.5) * 0.32,
        tipPos.y + (r() - 0.5) * 0.22,
        tipPos.z + (r() - 0.5) * 0.32
      );
      clusterMesh.castShadow = true;
      clusterMesh.receiveShadow = true;
      pivot.add(clusterMesh);
    }

    tree.add(pivot);
    windBranches.push(pivot);
  }

  // E. Apex Canopy Crown Cluster (top of the tree)
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, rootFlareH + trunkH * 0.95, 0);

  const mainCrownCount = 3;
  for (let m = 0; m < mainCrownCount; m++) {
    const cRad = crownRadius * (0.60 + r() * 0.25);
    const sphereGeo = new THREE.SphereGeometry(cRad, 14, 12);
    const pos = sphereGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const dist = Math.hypot(vx, vy, vz) || 1;
      const noise = 1 + (r() - 0.5) * 0.18;
      pos.setXYZ(i, (vx / dist) * cRad * noise, (vy / dist) * cRad * noise, (vz / dist) * cRad * noise);
    }
    sphereGeo.computeVertexNormals();

    const clusterMesh = new THREE.Mesh(sphereGeo, foliageMat);
    clusterMesh.position.set(
      (r() - 0.5) * 0.40,
      (m * 0.26) + (r() - 0.5) * 0.18,
      (r() - 0.5) * 0.40
    );
    clusterMesh.castShadow = true;
    clusterMesh.receiveShadow = true;
    crownGroup.add(clusterMesh);
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
// 3. 3D Cobblestone Wall (buildCobblestoneWall3D)
// ---------------------------------------------------------------------------

export function buildCobblestoneWall3D({
  length = 8.0,
  height = 1.25,
  thickness = 0.26,
  stoneColor = '#948c82',
  mortarColor = '#3a3532',
  seed = 42,
} = {}) {
  const wall = new THREE.Group();
  wall.name = `cobblestone_wall_3d_${seed}`;
  const r = rng(seed);

  const stoneTex = generateStoneTexture(stoneColor, { size: 512, seed });
  const stonePalette = [
    '#948c82',
    '#a49c92',
    '#827b72',
    '#b2a99e',
    '#767068',
    '#a89f94',
  ];

  const stoneMaterials = stonePalette.map(
    (col) =>
      new THREE.MeshStandardMaterial({
        color: col,
        map: stoneTex,
        roughness: 0.88,
        metalness: 0.02,
      })
  );

  const mortarMat = new THREE.MeshStandardMaterial({
    color: mortarColor,
    roughness: 0.96,
    metalness: 0.0,
  });

  // A. Recessed Mortar Backing Bed
  const mortarBed = new THREE.Mesh(
    new THREE.BoxGeometry(length, height, thickness * 0.78),
    mortarMat
  );
  mortarBed.position.set(0, height / 2, 0);
  mortarBed.castShadow = true;
  mortarBed.receiveShadow = true;
  wall.add(mortarBed);

  // B. Staggered Courses of Individually Varied 3D Stone Blocks
  const courseH = 0.14;
  const numCourses = Math.floor(height / courseH);

  for (let c = 0; c < numCourses; c++) {
    const courseY = c * courseH + courseH / 2;
    let currX = -length / 2;
    const rowOffset = (c % 2 === 0) ? 0 : 0.12;
    currX += rowOffset;

    while (currX < length / 2) {
      const stoneW = 0.22 + r() * 0.12;
      const stoneH = courseH * (0.86 + r() * 0.12);
      const stoneD = thickness * (0.88 + r() * 0.24);

      const blockGeo = new THREE.BoxGeometry(stoneW, stoneH, stoneD);
      const mat = stoneMaterials[Math.floor(r() * stoneMaterials.length)];
      const block = new THREE.Mesh(blockGeo, mat);

      // Depth offset & micro-tilts so sunlight catches individual stone faces
      const xPos = Math.min(currX + stoneW / 2, length / 2 - stoneW * 0.2);
      const zOffset = (r() - 0.5) * 0.028;
      block.position.set(xPos, courseY, zOffset);

      block.rotation.z = (r() - 0.5) * 0.035;
      block.rotation.y = (r() - 0.5) * 0.045;
      block.rotation.x = (r() - 0.5) * 0.035;

      block.castShadow = true;
      block.receiveShadow = true;
      wall.add(block);

      currX += stoneW + 0.018; // mortar joint gap
    }
  }

  // C. Beveled Top Coping Cap
  const capOverhang = 0.025;
  const capH = 0.09;
  const capGeo = new THREE.BoxGeometry(
    length + 0.04,
    capH,
    thickness + capOverhang * 2
  );
  const capMat = new THREE.MeshStandardMaterial({
    color: '#a49c92',
    map: stoneTex,
    roughness: 0.82,
    metalness: 0.02,
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(0, height + capH / 2, 0);
  cap.castShadow = true;
  cap.receiveShadow = true;
  wall.add(cap);

  // Peak ridge along coping center for sunlight highlight
  const ridgeGeo = new THREE.BoxGeometry(length + 0.04, 0.025, thickness * 0.5);
  const ridge = new THREE.Mesh(ridgeGeo, capMat);
  ridge.position.set(0, height + capH + 0.012, 0);
  ridge.castShadow = true;
  ridge.receiveShadow = true;
  wall.add(ridge);

  return wall;
}

// ---------------------------------------------------------------------------
// 4. 3D Road (buildRoad3D)
// ---------------------------------------------------------------------------

export function buildRoad3D({
  width = 2.4,
  length = 16.0,
  style = 'normal', // 'cobblestone' | 'normal' | 'modern'
  curbWidth = 0.20,
  curbHeight = 0.055,
  seed = 7,
} = {}) {
  const road = new THREE.Group();
  road.name = `road_3d_${style}_${seed}`;
  const r = rng(seed);

  // Road top surface is flush at Y = 0.0 for zero character footing Z-fighting (Safeguard 1)
  const roadBedH = 0.12;
  const roadBedGeo = new THREE.BoxGeometry(width, roadBedH, length);

  if (style === 'cobblestone') {
    // 3D Cobblestone Pavers & Sett Grid
    const mortarBedMat = new THREE.MeshStandardMaterial({
      color: '#34302d',
      roughness: 0.94,
    });
    const baseBed = new THREE.Mesh(roadBedGeo, mortarBedMat);
    baseBed.position.set(0, -roadBedH / 2, 0);
    baseBed.receiveShadow = true;
    road.add(baseBed);

    const stoneTex = generateStoneTexture('#756f6a', { size: 512, seed });
    const paverPalette = ['#756f6a', '#847e78', '#635e59', '#8f8881', '#6b6560'];
    const paverMaterials = paverPalette.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: c,
          map: stoneTex,
          roughness: 0.88,
          metalness: 0.02,
        })
    );

    const rowH = 0.22;
    const numRows = Math.floor(length / rowH);
    const paversPerRow = 7;
    const paverW = (width - 0.12) / paversPerRow;

    for (let row = 0; row < numRows; row++) {
      const zPos = -length / 2 + row * rowH + rowH / 2;
      const stagger = (row % 2 === 0) ? 0 : paverW * 0.45;

      for (let col = 0; col < paversPerRow; col++) {
        const xPos = -width / 2 + 0.06 + col * paverW + paverW / 2 + (stagger * 0.2);
        if (Math.abs(xPos) > width / 2 - 0.08) continue;

        // Skip exact character center [0, 0, 0] to maintain perfectly flat flush footing
        const isFootingZone = Math.hypot(xPos, zPos) < 0.35;
        const pH = isFootingZone ? 0.018 : 0.018 + (r() - 0.5) * 0.005;
        const paverGeo = new THREE.BoxGeometry(paverW * 0.88, pH, rowH * 0.86);
        const pMat = paverMaterials[Math.floor(r() * paverMaterials.length)];
        const paver = new THREE.Mesh(paverGeo, pMat);

        paver.position.set(xPos, -pH / 2 + 0.001, zPos);
        if (!isFootingZone) {
          paver.rotation.y = (r() - 0.5) * 0.04;
          paver.rotation.x = (r() - 0.5) * 0.02;
        }
        paver.receiveShadow = true;
        road.add(paver);
      }
    }
  } else {
    // Normal or Modern Asphalt Road
    const asphaltTex = generateAsphaltTexture(style, { size: 512, seed });
    const asphaltMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: style === 'modern' ? 0.62 : 0.86,
      metalness: 0.01,
    });
    const asphaltMesh = new THREE.Mesh(roadBedGeo, asphaltMat);
    asphaltMesh.position.set(0, -roadBedH / 2, 0);
    asphaltMesh.receiveShadow = true;
    road.add(asphaltMesh);

    // Markings with polygonOffset to guarantee zero Z-fighting (Safeguard 1)
    if (style === 'normal') {
      // Dashed Centerline (Safeguard 1: leaves clean opening around [0, 0, 0])
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
        // Avoid placing marking directly under [0, 0, 0] footing zone
        if (Math.abs(zCenter) < 0.45) continue;

        const dashGeo = new THREE.PlaneGeometry(dashW, dashLen);
        const dash = new THREE.Mesh(dashGeo, lineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.001, zCenter);
        dash.receiveShadow = true;
        road.add(dash);
      }
    } else if (style === 'modern') {
      // Solid White Side Shoulder Stripes
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

      // Dashed Amber Centerline (avoids [0, 0, 0] footing zone)
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

  // Raised 3D Curbs on left and right (Safeguard 1 & 3: raised cleanly without clipping)
  const curbMat = new THREE.MeshStandardMaterial({
    color: '#96918a',
    roughness: 0.85,
    metalness: 0.02,
  });

  [-1, 1].forEach((side) => {
    const curbGeo = new THREE.BoxGeometry(curbWidth, curbHeight, length);
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(
      side * (width / 2 + curbWidth / 2),
      curbHeight / 2,
      0
    );
    curb.castShadow = true;
    curb.receiveShadow = true;
    road.add(curb);

    // Beveled curb rim facing the road
    const bevelGeo = new THREE.BoxGeometry(0.03, 0.02, length);
    const bevel = new THREE.Mesh(bevelGeo, curbMat);
    bevel.position.set(
      side * (width / 2 + 0.015),
      curbHeight - 0.01,
      0
    );
    bevel.castShadow = true;
    bevel.receiveShadow = true;
    road.add(bevel);
  });

  return road;
}

// ---------------------------------------------------------------------------
// 5. Environment Stage & Atmospheric Lighting (setupEnvironmentStage)
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

  // Outdoor Ambient / Hemisphere Light (boosted for rich ambient bounce)
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
// 6. Deterministic Breeze Sway (animateEnvironment)
// ---------------------------------------------------------------------------

export function animateEnvironment(envGroup, t, { windSpeed = 1.6, windStrength = 0.026 } = {}) {
  if (!envGroup) return;

  envGroup.traverse((obj) => {
    if (obj.userData?.windBranches) {
      const branches = obj.userData.windBranches;
      for (let i = 0; i < branches.length; i++) {
        const b = branches[i];
        const phase = b.userData.phase || i * 1.3;
        // Deterministic sway driven strictly by t in seconds (Safeguard 2)
        const swayZ = Math.sin(t * windSpeed + phase) * windStrength;
        const swayX = Math.cos(t * (windSpeed * 0.8) + phase) * (windStrength * 0.65);
        b.rotation.z = (b.userData.baseRotZ || 0) + swayZ;
        b.rotation.x = (b.userData.baseRotX || 0) + swayX;
      }
    }

    if (obj.userData?.windCrown) {
      const crown = obj.userData.windCrown;
      crown.rotation.z = Math.sin(t * (windSpeed * 0.9)) * (windStrength * 0.6);
      crown.rotation.x = Math.cos(t * (windSpeed * 0.7)) * (windStrength * 0.4);
    }
  });
}
