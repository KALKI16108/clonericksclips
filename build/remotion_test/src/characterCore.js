// characterCore.js
// Upgraded preset-free 2.5D character & studio builder for Three.js / Remotion.
// Includes setupStudioStage(), modular buildOutfit/buildHair/buildHat helpers,
// smooth Catmull-Rom ink outlines, satin-vinyl plastic finish, rising-purple anger shout,
// and 12 comic expression states.
import * as THREE from 'three';

export const INK = '#1b1817';

export const Z = {
  shadow: 0.002,
  backArm: -0.008,
  legBack: 0.0,
  legFront: 0.005,
  torso: 0.015,
  outfitDetail: 0.019,
  torsoPolish: 0.023,
  frontArm: 0.028,
  head: 0.038,
  angerFill: 0.041,
  hair: 0.044,
  headPolish: 0.049,
  face: 0.053,
  emotionFx: 0.056,
  headgear: 0.060,
};

export function rng(seed = 1) {
  let s = (Math.abs(Math.floor(seed)) || 1) % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 1. Studio Stage & Lighting Rig (matches preview 1:1)
export function setupStudioStage(scene, renderer, camera, {
  bgColor = '#ded9cf',
  lightAngleDeg = -26,
  shadows = true,
} = {}) {
  scene.background = new THREE.Color(bgColor);

  if (renderer) {
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
  }

  if (camera) {
    camera.fov = 32;
    camera.position.set(0, 1.02, 2.85);
    camera.lookAt(0, 0.94, 0);
    camera.updateProjectionMatrix();
  }

  const hemi = new THREE.HemisphereLight('#fffaf0', '#b8b0a2', 0.92);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight('#fff8eb', 1.35);
  const rad = THREE.MathUtils.degToRad(lightAngleDeg);
  keyLight.position.set(Math.sin(rad) * 3.2, 2.8, Math.cos(rad) * 3.2);
  keyLight.castShadow = shadows;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 10;
  keyLight.shadow.camera.left = -2.2;
  keyLight.shadow.camera.right = 2.2;
  keyLight.shadow.camera.top = 2.4;
  keyLight.shadow.camera.bottom = -0.5;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight('#f4f7ff', 0.35);
  fillLight.position.set(1.6, 1.4, 2.2);
  scene.add(fillLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.ShadowMaterial({ opacity: shadows ? 0.16 : 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  return { hemi, keyLight, fillLight, ground };
}

// 2. Materials & Smooth Outlines
export function createSurfaceMat(color, { polishMode = 'plastic', opacity = 1 } = {}) {
  if (polishMode === 'plastic') {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.48,
      metalness: 0.0,
      clearcoat: 0.42,
      clearcoatRoughness: 0.36,
      reflectivity: 0.45,
      side: THREE.DoubleSide,
      transparent: opacity < 1,
      opacity,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
  }
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.88,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
}

export const inkMat = (color = INK, opacity = 1) =>
  new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

export function ovalPts(rx, ry, seed = 1, n = 48) {
  const r = rng(seed);
  const p1 = r() * Math.PI * 2;
  const p2 = r() * Math.PI * 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const harmonic = 1 + 0.004 * Math.sin(a * 2 + p1) + 0.003 * Math.cos(a * 3 + p2);
    pts.push(new THREE.Vector2(Math.cos(a) * rx * harmonic, Math.sin(a) * ry * harmonic));
  }
  return pts;
}

export function pillPts(w, h, radius = w * 0.44) {
  const s = new THREE.Shape();
  const r = Math.min(radius, w * 0.49, h * 0.49);
  s.moveTo(-w / 2 + r, 0);
  s.lineTo(w / 2 - r, 0);
  s.quadraticCurveTo(w / 2, 0, w / 2, r);
  s.lineTo(w / 2, h - r);
  s.quadraticCurveTo(w / 2, h, w / 2 - r, h);
  s.lineTo(-w / 2 + r, h);
  s.quadraticCurveTo(-w / 2, h, -w / 2, h - r);
  s.lineTo(-w / 2, r);
  s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  return s.getPoints(44);
}

export function offsetSmoothLoop(pts, band) {
  const n = pts.length;
  if (n < 3) return pts;

  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    area += a.x * b.y - b.x * a.y;
  }
  const ccw = area >= 0 ? 1 : -1;

  const raw = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];

    const e1 = new THREE.Vector2().subVectors(curr, prev).normalize();
    const e2 = new THREE.Vector2().subVectors(next, curr).normalize();
    const n1 = new THREE.Vector2(e1.y * ccw, -e1.x * ccw);
    const n2 = new THREE.Vector2(e2.y * ccw, -e2.x * ccw);

    const bisector = new THREE.Vector2().addVectors(n1, n2);
    if (bisector.lengthSq() < 1e-6) bisector.copy(n1);
    else bisector.normalize();

    const miter = Math.min(1.45, 1 / Math.max(0.65, bisector.dot(n1)));
    raw.push(curr.clone().addScaledVector(bisector, band * miter));
  }

  const smoothed = raw.map((p, i) => {
    const pPrev = raw[(i - 1 + n) % n];
    const pNext = raw[(i + 1) % n];
    return new THREE.Vector2(
      pPrev.x * 0.2 + p.x * 0.6 + pNext.x * 0.2,
      pPrev.y * 0.2 + p.y * 0.6 + pNext.y * 0.2
    );
  });

  const curve = new THREE.CatmullRomCurve3(
    smoothed.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    true,
    'centripetal',
    0.5
  );
  return curve.getPoints(Math.max(48, n * 2)).map((v) => new THREE.Vector2(v.x, v.y));
}

export function createCutoutPart(
  pts,
  fillColor,
  {
    inkBand = 0.014,
    z = 0,
    polishMode = 'plastic',
    castShadow = true,
    receiveShadow = true,
    opacity = 1,
  } = {}
) {
  const g = new THREE.Group();
  g.position.z = z;

  if (inkBand > 0) {
    const inkPts = offsetSmoothLoop(pts, inkBand);
    const inkMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(new THREE.Shape(inkPts)),
      inkMat(INK, opacity)
    );
    inkMesh.castShadow = castShadow;
    g.add(inkMesh);
  }

  const fillMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(pts)),
    createSurfaceMat(fillColor, { polishMode, opacity })
  );
  fillMesh.position.z = 0.0015;
  fillMesh.castShadow = castShadow;
  fillMesh.receiveShadow = receiveShadow;
  g.add(fillMesh);

  return { group: g, fillMesh };
}

export function flatRibbonPts(p0, p1, p2, halfWidth, steps = 28) {
  const curve = new THREE.QuadraticBezierCurve(p0, p1, p2);
  const samples = curve.getPoints(steps);
  const left = [];
  const right = [];
  for (let i = 0; i < samples.length; i++) {
    const curr = samples[i];
    const prev = samples[Math.max(0, i - 1)];
    const next = samples[Math.min(samples.length - 1, i + 1)];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;
    left.push(new THREE.Vector2(curr.x + nx * halfWidth, curr.y + ny * halfWidth));
    right.unshift(new THREE.Vector2(curr.x - nx * halfWidth, curr.y - ny * halfWidth));
  }
  return [...left, ...right];
}

function createOverlayTexture(mode) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (mode === 'plastic') {
    const diag = ctx.createLinearGradient(8, 6, 110, 110);
    diag.addColorStop(0.0, 'rgba(255, 252, 245, 0.22)');
    diag.addColorStop(0.38, 'rgba(255, 252, 245, 0.06)');
    diag.addColorStop(1.0, 'rgba(255, 252, 245, 0.0)');
    ctx.fillStyle = diag;
    ctx.fillRect(0, 0, 128, 128);

    const spec = ctx.createRadialGradient(36, 30, 4, 42, 36, 46);
    spec.addColorStop(0.0, 'rgba(255, 253, 248, 0.26)');
    spec.addColorStop(0.55, 'rgba(255, 253, 248, 0.07)');
    spec.addColorStop(1.0, 'rgba(255, 253, 248, 0.0)');
    ctx.fillStyle = spec;
    ctx.fillRect(0, 0, 128, 128);
  } else if (mode === 'rim') {
    const grad = ctx.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0.0, 'rgba(255,246,226,0.0)');
    grad.addColorStop(0.76, 'rgba(255,246,226,0.0)');
    grad.addColorStop(0.92, 'rgba(255,246,226,0.28)');
    grad.addColorStop(1.0, 'rgba(255,246,226,0.06)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function attachSurfaceOverlay(pts, z, polishMode) {
  if (!polishMode || polishMode === 'raw') return null;
  const geom = new THREE.ShapeGeometry(new THREE.Shape(pts));
  geom.computeBoundingBox();
  const { min, max } = geom.boundingBox;
  const w = Math.max(1e-4, max.x - min.x);
  const h = Math.max(1e-4, max.y - min.y);
  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) - min.x) / w;
    uvs[i * 2 + 1] = (pos.getY(i) - min.y) / h;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshBasicMaterial({
      map: createOverlayTexture(polishMode),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
  );
  mesh.position.z = z;
  return mesh;
}

// 3. Built-In Modular Outfit, Sculpted Hair & Structured Hat Builders
export function buildOutfit(torsoGroup, {
  style = 'scholarRobe',
  torsoW = 0.24,
  torsoH = 0.44,
  accentColor = '#f4efe8',
  strapColor = '#785231',
  polishMode = 'plastic',
  seed = 1,
} = {}) {
  const dz = Z.outfitDetail - Z.torso;

  if (style === 'scholarRobe') {
    for (let i = -2; i <= 2; i++) {
      const stripe = new THREE.Mesh(
        new THREE.ShapeGeometry(
          new THREE.Shape([
            new THREE.Vector2(i * 0.036 - 0.003, 0.03),
            new THREE.Vector2(i * 0.036 + 0.003, 0.03),
            new THREE.Vector2(i * 0.036 + 0.003, torsoH - 0.03),
            new THREE.Vector2(i * 0.036 - 0.003, torsoH - 0.03),
          ])
        ),
        inkMat('#186e61', 0.45)
      );
      stripe.position.z = dz;
      torsoGroup.add(stripe);
    }
    const { group: sash } = createCutoutPart(
      [
        new THREE.Vector2(-0.07, torsoH - 0.03),
        new THREE.Vector2(-0.03, torsoH - 0.03),
        new THREE.Vector2(0.095, 0.03),
        new THREE.Vector2(0.055, 0.03),
      ],
      strapColor,
      { inkBand: 0.006, z: dz + 0.001, polishMode }
    );
    const { group: knot } = createCutoutPart(ovalPts(0.022, 0.018, seed + 15, 20), accentColor, {
      inkBand: 0.006,
      z: dz + 0.003,
      polishMode,
    });
    knot.position.set(0.025, torsoH - 0.075, dz + 0.003);
    torsoGroup.add(sash, knot);
  } else if (style === 'samuraiArmor') {
    for (let row = 0; row < 4; row++) {
      const y = 0.075 + row * 0.086;
      const plate = new THREE.Mesh(
        new THREE.ShapeGeometry(
          new THREE.Shape([
            new THREE.Vector2(-torsoW * 0.45, y),
            new THREE.Vector2(torsoW * 0.45, y),
            new THREE.Vector2(torsoW * 0.45, y + 0.012),
            new THREE.Vector2(-torsoW * 0.45, y + 0.012),
          ])
        ),
        inkMat(INK)
      );
      plate.position.z = dz;
      torsoGroup.add(plate);

      for (let col = -2; col <= 2; col++) {
        const stud = new THREE.Mesh(
          new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.008, 0.008, seed + row * 10 + col, 14))),
          createSurfaceMat(accentColor, { polishMode })
        );
        stud.position.set(col * 0.038, y + 0.044, dz + 0.0015);
        torsoGroup.add(stud);
      }
    }
  } else if (style === 'hoodie') {
    const { group: pocket } = createCutoutPart(
      [
        new THREE.Vector2(-0.075, 0.04),
        new THREE.Vector2(0.075, 0.04),
        new THREE.Vector2(0.06, 0.145),
        new THREE.Vector2(-0.06, 0.145),
      ],
      accentColor,
      { inkBand: 0.007, z: dz, polishMode }
    );
    const { group: collar } = createCutoutPart(
      ovalPts(0.075, 0.035, seed + 18, 24),
      accentColor,
      { inkBand: 0.008, z: dz + 0.001, polishMode }
    );
    collar.position.set(0, torsoH - 0.018, dz + 0.001);
    torsoGroup.add(pocket, collar);
  } else if (style === 'trenchCoat') {
    const { group: lapelL } = createCutoutPart(
      [
        new THREE.Vector2(-0.01, torsoH - 0.01),
        new THREE.Vector2(-0.075, torsoH - 0.02),
        new THREE.Vector2(-0.055, torsoH - 0.15),
        new THREE.Vector2(-0.008, torsoH - 0.11),
      ],
      accentColor,
      { inkBand: 0.006, z: dz + 0.001, polishMode }
    );
    const { group: lapelR } = createCutoutPart(
      [
        new THREE.Vector2(0.01, torsoH - 0.01),
        new THREE.Vector2(0.075, torsoH - 0.02),
        new THREE.Vector2(0.055, torsoH - 0.15),
        new THREE.Vector2(0.008, torsoH - 0.11),
      ],
      accentColor,
      { inkBand: 0.006, z: dz + 0.001, polishMode }
    );
    const { group: belt } = createCutoutPart(
      [
        new THREE.Vector2(-torsoW * 0.48, 0.16),
        new THREE.Vector2(torsoW * 0.48, 0.16),
        new THREE.Vector2(torsoW * 0.48, 0.205),
        new THREE.Vector2(-torsoW * 0.48, 0.205),
      ],
      strapColor,
      { inkBand: 0.007, z: dz + 0.002, polishMode }
    );
    torsoGroup.add(lapelL, lapelR, belt);
  } else {
    const { group: sash } = createCutoutPart(
      [
        new THREE.Vector2(-torsoW * 0.47, 0.14),
        new THREE.Vector2(torsoW * 0.47, 0.14),
        new THREE.Vector2(torsoW * 0.47, 0.185),
        new THREE.Vector2(-torsoW * 0.47, 0.185),
      ],
      strapColor,
      { inkBand: 0.007, z: dz, polishMode }
    );
    torsoGroup.add(sash);
  }
}

export function buildHair(headGroup, {
  style = 'scholarBun',
  hairColor = '#1f1c1b',
  headRx = 0.205,
  headRy = 0.215,
  polishMode = 'plastic',
  seed = 1,
} = {}) {
  if (!style || style === 'none') return;
  const hz = Z.hair - Z.head;

  // Sculpted Bezier hair crown with temple sideburns
  const s = new THREE.Shape();
  s.moveTo(-headRx * 0.99, 0.01);
  s.bezierCurveTo(-headRx * 1.06, headRy * 0.72, -headRx * 0.65, headRy * 1.14, 0, headRy * 1.12);
  s.bezierCurveTo(headRx * 0.65, headRy * 1.14, headRx * 1.06, headRy * 0.72, headRx * 0.99, 0.01);
  s.lineTo(headRx * 0.91, -0.025);
  s.lineTo(headRx * 0.85, headRy * 0.46);
  s.bezierCurveTo(headRx * 0.42, headRy * 0.62, -headRx * 0.42, headRy * 0.62, -headRx * 0.85, headRy * 0.46);
  s.lineTo(-headRx * 0.91, -0.025);
  s.closePath();

  const crownPts = s.getPoints(52);
  const { group: crown } = createCutoutPart(crownPts, hairColor, {
    inkBand: 0.014,
    z: hz,
    polishMode,
  });
  headGroup.add(crown);

  // Subtle hair strand parting lines + sheen
  const strand = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape(
        flatRibbonPts(
          new THREE.Vector2(-0.03, headRy * 1.02),
          new THREE.Vector2(-0.01, headRy * 0.78),
          new THREE.Vector2(0.015, headRy * 0.56),
          0.0025,
          14
        )
      )
    ),
    inkMat('#383331', 0.65)
  );
  strand.position.z = hz + 0.0025;
  headGroup.add(strand);

  if (style === 'scholarBun') {
    const { group: band } = createCutoutPart(
      [
        new THREE.Vector2(-headRx * 0.97, 0.088),
        new THREE.Vector2(headRx * 0.97, 0.088),
        new THREE.Vector2(headRx * 0.97, 0.112),
        new THREE.Vector2(-headRx * 0.97, 0.112),
      ],
      '#586069',
      { inkBand: 0.006, z: hz + 0.003, polishMode }
    );
    const { group: ring } = createCutoutPart(ovalPts(0.016, 0.016, seed + 26, 18), '#e5b84b', {
      inkBand: 0.005,
      z: hz + 0.0045,
      polishMode,
    });
    ring.position.set(-0.045, 0.1, hz + 0.0045);

    const { group: bun } = createCutoutPart(ovalPts(0.038, 0.046, seed + 27, 24), hairColor, {
      inkBand: 0.012,
      z: hz - 0.002,
      polishMode,
    });
    bun.position.set(0, headRy * 1.18, hz - 0.002);
    headGroup.add(band, ring, bun);
  } else if (style === 'topknot') {
    const { group: knot } = createCutoutPart(pillPts(0.056, 0.082, 0.022), hairColor, {
      inkBand: 0.012,
      z: hz - 0.002,
      polishMode,
    });
    knot.position.set(0, headRy * 1.02, hz - 0.002);
    const { group: tie } = createCutoutPart(
      [
        new THREE.Vector2(-0.032, headRy * 1.05),
        new THREE.Vector2(0.032, headRy * 1.05),
        new THREE.Vector2(0.032, headRy * 1.09),
        new THREE.Vector2(-0.032, headRy * 1.09),
      ],
      '#e5b84b',
      { inkBand: 0.005, z: hz + 0.002, polishMode }
    );
    headGroup.add(knot, tie);
  } else if (style === 'layeredLocks') {
    [-1, 1].forEach((side) => {
      const lock = new THREE.Shape();
      lock.moveTo(side * headRx * 0.86, 0.04);
      lock.quadraticCurveTo(side * headRx * 1.15, -0.05, side * headRx * 0.96, -0.16);
      lock.quadraticCurveTo(side * headRx * 0.82, -0.08, side * headRx * 0.82, 0.02);
      lock.closePath();
      const { group: lockPart } = createCutoutPart(lock.getPoints(24), hairColor, {
        inkBand: 0.011,
        z: hz + 0.001,
        polishMode,
      });
      headGroup.add(lockPart);
    });
  } else if (style === 'shaggyCut') {
    const bangs = new THREE.Shape();
    bangs.moveTo(-headRx * 0.86, headRy * 0.56);
    bangs.lineTo(-headRx * 0.55, headRy * 0.34);
    bangs.lineTo(-headRx * 0.25, headRy * 0.52);
    bangs.lineTo(0, headRy * 0.30);
    bangs.lineTo(headRx * 0.28, headRy * 0.52);
    bangs.lineTo(headRx * 0.58, headRy * 0.35);
    bangs.lineTo(headRx * 0.86, headRy * 0.56);
    bangs.closePath();
    const { group: bangPart } = createCutoutPart(bangs.getPoints(28), hairColor, {
      inkBand: 0.009,
      z: hz + 0.002,
      polishMode,
    });
    headGroup.add(bangPart);
  }
}

export function buildHat(headGroup, {
  style = 'none',
  accentColor = '#e6b85c',
  headRx = 0.205,
  headRy = 0.215,
  polishMode = 'plastic',
} = {}) {
  if (!style || style === 'none') return;
  const hatZ = Z.headgear - Z.head;

  if (style === 'kasaHat') {
    const brim = new THREE.Shape();
    brim.moveTo(-0.36, 0.09);
    brim.quadraticCurveTo(0, 0.29, 0.36, 0.09);
    brim.quadraticCurveTo(0, 0.135, -0.36, 0.09);
    brim.closePath();
    const { group: hat } = createCutoutPart(brim.getPoints(44), accentColor, {
      inkBand: 0.014,
      z: hatZ,
      polishMode,
    });
    const cord = new THREE.Mesh(
      new THREE.ShapeGeometry(
        new THREE.Shape(
          flatRibbonPts(
            new THREE.Vector2(-0.11, 0.08),
            new THREE.Vector2(0, -0.23),
            new THREE.Vector2(0.11, 0.08),
            0.0035,
            22
          )
        )
      ),
      inkMat('#5e432c')
    );
    cord.position.z = -0.004;
    headGroup.add(hat, cord);
  } else if (style === 'kabutoHelmet') {
    const bowl = new THREE.Shape();
    bowl.moveTo(-headRx * 1.16, 0.06);
    bowl.bezierCurveTo(-headRx * 1.15, headRy * 1.25, headRx * 1.15, headRy * 1.25, headRx * 1.16, 0.06);
    bowl.quadraticCurveTo(0, 0.12, -headRx * 1.16, 0.06);
    bowl.closePath();
    const { group: helmet } = createCutoutPart(bowl.getPoints(44), '#2c313a', {
      inkBand: 0.014,
      z: hatZ,
      polishMode,
    });

    const crest = new THREE.Shape();
    crest.moveTo(-0.11, headRy * 0.96);
    crest.quadraticCurveTo(0, headRy * 0.56, 0.11, headRy * 0.96);
    crest.quadraticCurveTo(0, headRy * 0.72, -0.11, headRy * 0.96);
    crest.closePath();
    const { group: crestPart } = createCutoutPart(crest.getPoints(32), '#f2b84b', {
      inkBand: 0.008,
      z: hatZ + 0.003,
      polishMode,
    });
    headGroup.add(helmet, crestPart);
  } else if (style === 'jingasaHat') {
    const warHat = new THREE.Shape();
    warHat.moveTo(-0.34, 0.085);
    warHat.quadraticCurveTo(0, 0.21, 0.34, 0.085);
    warHat.quadraticCurveTo(0, 0.115, -0.34, 0.085);
    warHat.closePath();
    const { group: hat } = createCutoutPart(warHat.getPoints(40), '#242224', {
      inkBand: 0.014,
      z: hatZ,
      polishMode,
    });
    const { group: mon } = createCutoutPart(ovalPts(0.022, 0.022, 99, 20), '#f2b84b', {
      inkBand: 0.005,
      z: hatZ + 0.003,
      polishMode,
    });
    mon.position.set(0, 0.135, hatZ + 0.003);
    headGroup.add(hat, mon);
  } else if (style === 'oniHorns') {
    [-1, 1].forEach((side) => {
      const horn = new THREE.Shape();
      horn.moveTo(side * 0.055, headRy * 0.78);
      horn.quadraticCurveTo(side * 0.13, headRy * 1.15, side * 0.085, headRy * 1.48);
      horn.quadraticCurveTo(side * 0.105, headRy * 1.05, side * 0.115, headRy * 0.74);
      horn.closePath();
      const { group: hPart } = createCutoutPart(horn.getPoints(26), accentColor, {
        inkBand: 0.011,
        z: hatZ,
        polishMode,
      });
      headGroup.add(hPart);
    });
  }
}

// 4. Anger Liquid Face-Fill & 12 Comic Expressions
function createAngerFillLayer(hPts, zOffset) {
  const geom = new THREE.ShapeGeometry(new THREE.Shape(hPts));
  geom.computeBoundingBox();
  const { min, max } = geom.boundingBox;
  const w = Math.max(1e-4, max.x - min.x);
  const h = Math.max(1e-4, max.y - min.y);

  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) - min.x) / w;
    uvs[i * 2 + 1] = (pos.getY(i) - min.y) / h;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    uniforms: {
      uFill: { value: 0.0 },
      uTime: { value: 0.0 },
      uBasePurple: { value: new THREE.Color('#7b3fa0') },
      uTopPurple: { value: new THREE.Color('#a45ee5') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uFill;
      uniform float uTime;
      uniform vec3 uBasePurple;
      uniform vec3 uTopPurple;
      varying vec2 vUv;

      void main() {
        if (uFill <= 0.001) discard;

        float wave = sin(vUv.x * 10.0 + uTime * 9.0) * 0.016
                   + cos(vUv.x * 5.0 - uTime * 6.0) * 0.010;
        float level = clamp(uFill, 0.0, 1.05) + wave * smoothstep(0.0, 0.15, uFill) * (1.0 - smoothstep(0.88, 1.0, uFill));

        float mask = 1.0 - smoothstep(level - 0.03, level + 0.005, vUv.y);
        if (mask <= 0.005) discard;

        vec3 col = mix(uBasePurple, uTopPurple, smoothstep(0.0, 1.0, vUv.y));
        float alpha = mask * mix(0.55, 0.82, uFill);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.z = zOffset;
  mesh.visible = false;
  return mesh;
}

function buildEmotionRig(headGroup, hPts, { headRx = 0.205, headRy = 0.215, seed = 1 } = {}) {
  const faceZ = Z.face - Z.head;
  const fxZ = Z.emotionFx - Z.head;

  // Blue gloom gradient
  const gloomGeom = new THREE.ShapeGeometry(new THREE.Shape(hPts));
  gloomGeom.computeBoundingBox();
  const { min, max } = gloomGeom.boundingBox;
  const w = Math.max(1e-4, max.x - min.x);
  const h = Math.max(1e-4, max.y - min.y);
  const pos = gloomGeom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) - min.x) / w;
    uvs[i * 2 + 1] = (pos.getY(i) - min.y) / h;
  }
  gloomGeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const gloomMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    uniforms: { uAmount: { value: 0.0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uAmount;
      varying vec2 vUv;
      void main(){
        if (uAmount <= 0.01) discard;
        float grad = smoothstep(0.32, 0.96, vUv.y);
        gl_FragColor = vec4(vec3(0.24, 0.34, 0.56), grad * 0.58 * uAmount);
      }
    `,
  });
  const gloomMesh = new THREE.Mesh(gloomGeom, gloomMat);
  gloomMesh.position.z = Z.angerFill - Z.head + 0.001;
  gloomMesh.visible = false;
  headGroup.add(gloomMesh);

  // Sweatdrop
  const sweatGroup = new THREE.Group();
  sweatGroup.position.set(headRx * 0.68, headRy * 0.42, fxZ);
  const dropShape = new THREE.Shape();
  dropShape.moveTo(0, 0.036);
  dropShape.bezierCurveTo(0.022, 0.008, 0.024, -0.024, 0, -0.028);
  dropShape.bezierCurveTo(-0.024, -0.024, -0.022, 0.008, 0, 0.036);
  const { group: dropCutout } = createCutoutPart(dropShape.getPoints(24), '#7ed6f7', {
    inkBand: 0.007,
    z: 0,
    polishMode: 'plastic',
    castShadow: false,
  });
  const dropGlint = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.005, 0.011, seed + 71, 12))),
    inkMat('#ffffff')
  );
  dropGlint.position.set(-0.006, -0.004, 0.004);
  sweatGroup.add(dropCutout, dropGlint);
  sweatGroup.visible = false;
  headGroup.add(sweatGroup);

  // Anger vein
  const veinGroup = new THREE.Group();
  veinGroup.position.set(-headRx * 0.58, headRy * 0.48, fxZ);
  const makeVeinCorner = (rot) => {
    const g = new THREE.Group();
    g.rotation.z = rot;
    const pts = flatRibbonPts(
      new THREE.Vector2(-0.022, 0.006),
      new THREE.Vector2(-0.005, 0.005),
      new THREE.Vector2(-0.006, 0.022),
      0.0032,
      12
    );
    const { group } = createCutoutPart(pts, '#e04854', {
      inkBand: 0.003,
      z: 0,
      polishMode: 'raw',
      castShadow: false,
    });
    g.add(group);
    return g;
  };
  veinGroup.add(
    makeVeinCorner(0),
    makeVeinCorner(Math.PI * 0.5),
    makeVeinCorner(Math.PI),
    makeVeinCorner(Math.PI * 1.5)
  );
  veinGroup.visible = false;
  headGroup.add(veinGroup);

  // Waterfall tears
  const tearsGroup = new THREE.Group();
  tearsGroup.position.z = faceZ + 0.002;
  const makeTearStream = (xPos) => {
    const s = new THREE.Shape();
    s.moveTo(xPos - 0.012, 0.004);
    s.lineTo(xPos + 0.012, 0.004);
    s.lineTo(xPos + 0.02, -0.13);
    s.lineTo(xPos - 0.02, -0.13);
    s.closePath();
    return new THREE.Mesh(new THREE.ShapeGeometry(s), inkMat('#79c9f5', 0.85));
  };
  tearsGroup.add(makeTearStream(-0.042), makeTearStream(0.045));
  tearsGroup.visible = false;
  headGroup.add(tearsGroup);

  // Heart eyes
  const makeHeartPts = (r = 0.026) => {
    const pts = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const x = r * 0.065 * 16 * Math.pow(Math.sin(a), 3);
      const y =
        r *
        0.065 *
        (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      pts.push(new THREE.Vector2(x, y));
    }
    return pts;
  };
  const heartL = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(makeHeartPts())),
    inkMat('#e84a64')
  );
  heartL.position.set(-0.042, 0.012, faceZ + 0.001);
  const heartR = heartL.clone();
  heartR.position.x = 0.045;
  const heartsGroup = new THREE.Group();
  heartsGroup.add(heartL, heartR);
  heartsGroup.visible = false;
  headGroup.add(heartsGroup);

  // Dizzy X-eyes
  const makeCrossEye = (xPos) => {
    const g = new THREE.Group();
    g.position.set(xPos, 0.012, faceZ + 0.001);
    const bar1 = new THREE.Mesh(
      new THREE.ShapeGeometry(
        new THREE.Shape([
          new THREE.Vector2(-0.022, 0.004),
          new THREE.Vector2(0.022, 0.004),
          new THREE.Vector2(0.022, -0.004),
          new THREE.Vector2(-0.022, -0.004),
        ])
      ),
      inkMat(INK)
    );
    bar1.rotation.z = Math.PI / 4;
    const bar2 = bar1.clone();
    bar2.rotation.z = -Math.PI / 4;
    g.add(bar1, bar2);
    return g;
  };
  const dizzyEyesGroup = new THREE.Group();
  dizzyEyesGroup.add(makeCrossEye(-0.042), makeCrossEye(0.045));
  dizzyEyesGroup.visible = false;
  headGroup.add(dizzyEyesGroup);

  // Wavy mouth
  const wavyPts = flatRibbonPts(
    new THREE.Vector2(-0.032, -0.068),
    new THREE.Vector2(0.0, -0.056),
    new THREE.Vector2(0.032, -0.072),
    0.004,
    18
  );
  const mouthWavy = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(wavyPts)), inkMat(INK));
  mouthWavy.position.z = faceZ;
  mouthWavy.visible = false;
  headGroup.add(mouthWavy);

  return {
    gloomMesh,
    sweatGroup,
    veinGroup,
    tearsGroup,
    heartsGroup,
    dizzyEyesGroup,
    mouthWavy,
  };
}

// 5. Main Preset-Free 2.5D Character Builder
export function buildCharacter({
  name = 'character',
  seed = 1,
  skin = '#f3efe9',
  baseBodyColor = '#27a694',
  outfitStyle = 'scholarRobe',
  hairStyle = 'scholarBun',
  hairColor = '#1f1c1b',
  hatStyle = 'none',
  accentColor = '#f4efe8',
  strapColor = '#785231',
  torsoW = 0.24,
  torsoH = 0.44,
  headRx = 0.205,
  headRy = 0.215,
  emotion = 'calm',
  polishMode = 'plastic',
  buildClothes = null,
  buildHairAndHat = null,
  buildProp = null,
} = {}) {
  const root = new THREE.Group();
  root.name = name;
  root.userData.emotion = emotion;

  const contact = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.21, 0.085, seed + 90, 32))),
    inkMat(INK, 0.16)
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = Z.shadow;
  root.add(contact);

  const body = new THREE.Group();
  root.add(body);

  const makeLeg = (xPos, zPos) => {
    const g = new THREE.Group();
    g.position.set(xPos, 0.56, zPos);
    const shin = new THREE.Mesh(
      new THREE.ShapeGeometry(
        new THREE.Shape([
          new THREE.Vector2(-0.015, 0),
          new THREE.Vector2(0.015, 0),
          new THREE.Vector2(0.013, -0.52),
          new THREE.Vector2(-0.013, -0.52),
        ])
      ),
      inkMat(INK)
    );
    shin.castShadow = true;

    const foot = new THREE.Mesh(
      new THREE.ShapeGeometry(
        new THREE.Shape([
          new THREE.Vector2(-0.013, -0.51),
          new THREE.Vector2(0.085, -0.51),
          new THREE.Vector2(0.085, -0.555),
          new THREE.Vector2(-0.013, -0.555),
        ])
      ),
      inkMat(INK)
    );
    foot.position.z = 0.002;
    foot.castShadow = true;
    g.add(shin, foot);
    return g;
  };
  body.add(makeLeg(-0.042, Z.legBack), makeLeg(0.042, Z.legFront));

  // Torso + Outfit
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.55, Z.torso);
  const tPts = pillPts(torsoW, torsoH);
  const { group: torsoBase } = createCutoutPart(tPts, baseBodyColor, {
    inkBand: 0.015,
    z: 0,
    polishMode,
  });
  torsoGroup.add(torsoBase);

  if (typeof buildClothes === 'function') {
    buildClothes({ torsoGroup, torsoW, torsoH, polishMode, seed });
  } else {
    buildOutfit(torsoGroup, {
      style: outfitStyle,
      torsoW,
      torsoH,
      accentColor,
      strapColor,
      polishMode,
      seed,
    });
  }

  const torsoOverlay = attachSurfaceOverlay(tPts, Z.torsoPolish - Z.torso, polishMode);
  if (torsoOverlay) torsoGroup.add(torsoOverlay);
  body.add(torsoGroup);

  // Curved 2D stick arms + ball hands
  const makeArm = (side, zPos) => {
    const g = new THREE.Group();
    g.position.set(side * (torsoW * 0.46), 0.55 + torsoH * 0.84, zPos);
    const ribbon = flatRibbonPts(
      new THREE.Vector2(0, 0),
      new THREE.Vector2(side * 0.13, -0.14),
      new THREE.Vector2(side * 0.07, -0.32),
      0.014,
      28
    );
    const { group: arm } = createCutoutPart(ribbon, INK, {
      inkBand: 0.004,
      z: 0,
      polishMode: 'raw',
    });
    const hand = new THREE.Mesh(
      new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.024, 0.024, seed + 35, 24))),
      inkMat(INK)
    );
    hand.position.set(side * 0.07, -0.32, 0.003);
    hand.castShadow = true;
    g.add(arm, hand);
    return g;
  };
  const armL = makeArm(-1, Z.frontArm);
  const armR = makeArm(1, Z.backArm);
  body.add(armL, armR);

  // Head + Anger Fill + Hair/Hat + Face + Emotions
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.55 + torsoH + headRy * 1.02, Z.head);
  body.add(headGroup);

  const hPts = ovalPts(headRx, headRy, seed + 20, 56);
  const { group: headBase } = createCutoutPart(hPts, skin, {
    inkBand: 0.016,
    z: 0,
    polishMode,
  });
  headGroup.add(headBase);

  const angerFillMesh = createAngerFillLayer(hPts, Z.angerFill - Z.head);
  headGroup.add(angerFillMesh);

  if (typeof buildHairAndHat === 'function') {
    buildHairAndHat({ headGroup, headRx, headRy, polishMode, seed });
  } else {
    buildHair(headGroup, { style: hairStyle, hairColor, headRx, headRy, polishMode, seed });
    buildHat(headGroup, { style: hatStyle, accentColor, headRx, headRy, polishMode });
  }

  const headOverlay = attachSurfaceOverlay(hPts, Z.headPolish - Z.head, polishMode);
  if (headOverlay) headGroup.add(headOverlay);

  const faceZ = Z.face - Z.head;
  const eyeL = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.018, 0.022, seed + 50, 20))),
    inkMat(INK)
  );
  eyeL.position.set(-0.042, 0.012, faceZ);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.045;

  const browL = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([
        new THREE.Vector2(-0.024, 0.004),
        new THREE.Vector2(0.024, 0.004),
        new THREE.Vector2(0.024, -0.004),
        new THREE.Vector2(-0.024, -0.004),
      ])
    ),
    inkMat(INK)
  );
  browL.position.set(-0.042, 0.052, faceZ);
  const browR = browL.clone();
  browR.position.x = 0.045;

  const mouthClosed = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([
        new THREE.Vector2(-0.02, 0.004),
        new THREE.Vector2(0.022, 0.004),
        new THREE.Vector2(0.022, -0.004),
        new THREE.Vector2(-0.02, -0.004),
      ])
    ),
    inkMat(INK)
  );
  mouthClosed.position.set(0.002, -0.068, faceZ);

  const mouthOpenGroup = new THREE.Group();
  mouthOpenGroup.position.set(0.004, -0.07, faceZ);
  const { group: mouthCav } = createCutoutPart(
    ovalPts(0.042, 0.032, seed + 55, 24),
    '#5b2226',
    { inkBand: 0.009, z: 0, polishMode: 'raw', castShadow: false }
  );
  const teeth = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([
        new THREE.Vector2(-0.03, 0.025),
        new THREE.Vector2(0.03, 0.025),
        new THREE.Vector2(0.026, 0.01),
        new THREE.Vector2(-0.026, 0.01),
      ])
    ),
    inkMat('#ffffff')
  );
  teeth.position.z = 0.003;
  const tongue = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.022, 0.012, seed + 57, 18))),
    inkMat('#d97a7a')
  );
  tongue.position.set(0, -0.015, 0.003);
  mouthOpenGroup.add(mouthCav, teeth, tongue);
  mouthOpenGroup.visible = false;

  const mouthShoutGroup = new THREE.Group();
  mouthShoutGroup.position.set(0.002, -0.072, faceZ);
  const { group: shoutCav } = createCutoutPart(
    ovalPts(0.062, 0.052, seed + 58, 28),
    '#4a1622',
    { inkBand: 0.011, z: 0, polishMode: 'raw', castShadow: false }
  );
  const shoutTopTeeth = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([
        new THREE.Vector2(-0.044, 0.042),
        new THREE.Vector2(0.044, 0.042),
        new THREE.Vector2(0.038, 0.022),
        new THREE.Vector2(-0.038, 0.022),
      ])
    ),
    inkMat('#ffffff')
  );
  shoutTopTeeth.position.z = 0.003;

  const shoutBotTeeth = new THREE.Mesh(
    new THREE.ShapeGeometry(
      new THREE.Shape([
        new THREE.Vector2(-0.036, -0.025),
        new THREE.Vector2(0.036, -0.025),
        new THREE.Vector2(0.040, -0.040),
        new THREE.Vector2(-0.040, -0.040),
      ])
    ),
    inkMat('#ffffff')
  );
  shoutBotTeeth.position.z = 0.003;

  const shoutTongue = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(ovalPts(0.032, 0.018, seed + 59, 20))),
    inkMat('#e06d7a')
  );
  shoutTongue.position.set(0, -0.014, 0.0025);

  mouthShoutGroup.add(shoutCav, shoutTopTeeth, shoutBotTeeth, shoutTongue);
  mouthShoutGroup.visible = false;

  headGroup.add(eyeL, eyeR, browL, browR, mouthClosed, mouthOpenGroup, mouthShoutGroup);

  const emotionFx = buildEmotionRig(headGroup, hPts, { headRx, headRy, seed });

  if (typeof buildProp === 'function') {
    buildProp({ root, armL, armR, polishMode, seed });
  }

  root.userData.rig = {
    body,
    headGroup,
    armL,
    armR,
    eyeL,
    eyeR,
    browL,
    browR,
    mouthClosed,
    mouthOpenGroup,
    mouthShoutGroup,
    angerFillMesh,
    emotionFx,
  };

  animateCharacter(root, 0, { emotion });
  return root;
}

export function replaceCharacter(scene, oldChar, nextChar) {
  if (oldChar) {
    nextChar.position.copy(oldChar.position);
    nextChar.rotation.copy(oldChar.rotation);
    nextChar.scale.copy(oldChar.scale);
    scene.remove(oldChar);
    oldChar.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }
  scene.add(nextChar);
  return nextChar;
}

export function animateCharacter(
  character,
  t,
  {
    emotion = character.userData?.emotion || 'calm',
    speaking = false,
    angerLevel = 0,
    shouting = false,
  } = {}
) {
  const rig = character.userData?.rig;
  if (!rig) return;
  const fx = rig.emotionFx;

  fx.gloomMesh.visible = false;
  fx.sweatGroup.visible = false;
  fx.veinGroup.visible = false;
  fx.tearsGroup.visible = false;
  fx.heartsGroup.visible = false;
  fx.dizzyEyesGroup.visible = false;
  fx.mouthWavy.visible = false;

  rig.eyeL.visible = true;
  rig.eyeR.visible = true;
  rig.browL.rotation.z = 0;
  rig.browR.rotation.z = 0;
  rig.browL.position.y = 0.052;
  rig.browR.position.y = 0.052;
  rig.mouthClosed.rotation.z = 0;

  let eyeScaleX = 1.0;
  let eyeScaleY = 1.0;
  let headTiltExtra = 0;
  let forceOpenMouth = false;
  let forceWavyMouth = false;

  let effectiveAnger = angerLevel;
  if (emotion === 'angry') effectiveAnger = Math.max(effectiveAnger, 0.35);
  if (emotion === 'shout') effectiveAnger = 1.0;

  switch (emotion) {
    case 'grin':
      forceOpenMouth = true;
      rig.browL.position.y = 0.06;
      rig.browR.position.y = 0.068;
      break;
    case 'shock':
      eyeScaleX = 1.32;
      eyeScaleY = 1.32;
      rig.browL.position.y = 0.074;
      rig.browR.position.y = 0.074;
      forceOpenMouth = true;
      break;
    case 'smug':
      rig.browL.rotation.z = 0.16;
      rig.browR.rotation.z = 0.28;
      rig.browR.position.y = 0.066;
      eyeScaleX = 1.1;
      eyeScaleY = 0.55;
      rig.mouthClosed.rotation.z = 0.18;
      break;
    case 'deadpan':
      rig.browL.position.y = 0.036;
      rig.browR.position.y = 0.036;
      eyeScaleX = 1.25;
      eyeScaleY = 0.32;
      break;
    case 'sad':
    case 'crying':
      fx.gloomMesh.visible = true;
      fx.gloomMesh.material.uniforms.uAmount.value = emotion === 'crying' ? 1.0 : 0.72;
      rig.browL.rotation.z = 0.28;
      rig.browR.rotation.z = -0.28;
      rig.browL.position.y = 0.044;
      rig.browR.position.y = 0.044;
      forceWavyMouth = true;
      if (emotion === 'crying') {
        fx.tearsGroup.visible = true;
        fx.tearsGroup.scale.y = 0.92 + Math.sin(t * 24) * 0.08;
      }
      break;
    case 'sweat':
      fx.sweatGroup.visible = true;
      fx.sweatGroup.position.y = 0.09 - ((t * 0.06) % 0.035);
      rig.browL.rotation.z = 0.22;
      rig.browR.rotation.z = -0.22;
      forceWavyMouth = true;
      break;
    case 'dizzy':
      rig.eyeL.visible = false;
      rig.eyeR.visible = false;
      fx.dizzyEyesGroup.visible = true;
      fx.dizzyEyesGroup.children.forEach((c, idx) => {
        c.rotation.z = t * (idx === 0 ? 5 : -5);
      });
      forceWavyMouth = true;
      headTiltExtra = Math.sin(t * 5) * 0.11;
      break;
    case 'love': {
      rig.eyeL.visible = false;
      rig.eyeR.visible = false;
      fx.heartsGroup.visible = true;
      const beat = 1 + Math.abs(Math.sin(t * 8)) * 0.22;
      fx.heartsGroup.children.forEach((h) => h.scale.set(beat, beat, 1));
      forceOpenMouth = true;
      break;
    }
    case 'angry':
    case 'shout': {
      fx.veinGroup.visible = true;
      const pulse = 1 + Math.sin(t * 18) * 0.15;
      fx.veinGroup.scale.set(pulse, pulse, 1);
      break;
    }
  }

  const clampedAnger = THREE.MathUtils.clamp(effectiveAnger, 0, 1);
  const isShouting = shouting || emotion === 'shout' || clampedAnger >= 0.78;

  if (rig.angerFillMesh) {
    rig.angerFillMesh.visible = clampedAnger > 0.005;
    rig.angerFillMesh.material.uniforms.uFill.value = clampedAnger;
    rig.angerFillMesh.material.uniforms.uTime.value = t;
  }

  if (clampedAnger > 0.01) {
    const browTilt = clampedAnger * 0.34;
    rig.browL.rotation.z = -browTilt;
    rig.browR.rotation.z = browTilt;
    rig.browL.position.y = 0.052 - clampedAnger * 0.012;
    rig.browR.position.y = 0.052 - clampedAnger * 0.012;
    if (clampedAnger > 0.25) {
      fx.veinGroup.visible = true;
      const pulse = 1 + Math.sin(t * 18) * 0.15;
      fx.veinGroup.scale.set(pulse, pulse, 1);
    }
  }

  const blink = !isShouting && emotion !== 'deadpan' && t % 3.4 > 3.28;
  const sX = isShouting ? 1.28 : eyeScaleX;
  const sY = isShouting ? 1.28 : blink ? 0.12 : eyeScaleY;
  rig.eyeL.scale.set(sX, sY, 1);
  rig.eyeR.scale.set(sX, sY, 1);

  if (isShouting) {
    rig.mouthClosed.visible = false;
    rig.mouthOpenGroup.visible = false;
    rig.mouthShoutGroup.visible = true;
    fx.mouthWavy.visible = false;
    const pulse = 1 + Math.sin(t * 36) * 0.08;
    rig.mouthShoutGroup.scale.set(pulse, 1 + Math.cos(t * 32) * 0.1, 1);
  } else if (forceWavyMouth) {
    rig.mouthShoutGroup.visible = false;
    rig.mouthClosed.visible = false;
    rig.mouthOpenGroup.visible = false;
    fx.mouthWavy.visible = true;
  } else {
    rig.mouthShoutGroup.visible = false;
    const talkOpen = forceOpenMouth || (speaking && Math.sin(t * 22) > 0);
    rig.mouthClosed.visible = !talkOpen;
    rig.mouthOpenGroup.visible = talkOpen;
  }

  const shakeX = isShouting ? Math.sin(t * 58) * 0.014 : 0;
  const shakeZ = isShouting ? Math.cos(t * 46) * 0.045 : 0;
  rig.body.position.x = shakeX;
  rig.body.position.y =
    Math.sin(t * 3) * 0.005 + (isShouting ? Math.abs(Math.sin(t * 28)) * 0.012 : 0);
  rig.headGroup.rotation.z = Math.sin(t * 1.8) * 0.025 + shakeZ + headTiltExtra;

  if (isShouting) {
    rig.armL.rotation.z = -0.45 + Math.sin(t * 28) * 0.12;
    rig.armR.rotation.z = 0.45 - Math.sin(t * 28) * 0.12;
  } else if (emotion === 'crying' || emotion === 'sad') {
    rig.armL.rotation.z = 0.14;
    rig.armR.rotation.z = -0.14;
  } else {
    rig.armL.rotation.z = speaking ? Math.sin(t * 6) * 0.16 : 0;
    rig.armR.rotation.z = speaking ? -Math.sin(t * 6) * 0.14 : 0;
  }
}