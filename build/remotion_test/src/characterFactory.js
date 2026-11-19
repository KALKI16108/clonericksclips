// characterFactory.js
// Backward-compatibility bridge re-exporting directly from characterCore.js.
import * as THREE from 'three';
import { INK } from './kit.js';

export * from './characterCore.js';

export const flatMat = (color, opacity = 1) =>
  new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

export function flatPoly(pts, color, z = 0, opacity = 1) {
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(pts)),
    flatMat(color, opacity)
  );
  mesh.position.z = z;
  return mesh;
}

export function inkedPoly(pts, fillColor, inkBand = 0.015, seed = 1, z = 0, opacity = 1) {
  const g = new THREE.Group();
  const inkPts = pts.map((p) => {
    const len = p.length() || 1;
    return p.clone().multiplyScalar((len + inkBand) / len);
  });
  const ink = flatPoly(inkPts, INK, z, opacity);
  const fill = flatPoly(pts, fillColor, z + 0.002, opacity);
  g.add(ink, fill);
  return { group: g, ink, fill };
}

// Flat 2D ribbon polygon along a quadratic Bezier curve
export function flatRibbonPts(p0, p1, p2, halfWidth, steps = 20) {
  const curve = new THREE.QuadraticBezierCurve(p0, p1, p2);
  const samples = curve.getPoints(steps);
  const leftSide = [];
  const rightSide = [];

  for (let i = 0; i < samples.length; i++) {
    const curr = samples[i];
    const prev = samples[Math.max(0, i - 1)];
    const next = samples[Math.min(samples.length - 1, i + 1)];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tLen = Math.hypot(tx, ty) || 1;
    const nx = -ty / tLen;
    const ny = tx / tLen;

    leftSide.push(new THREE.Vector2(curr.x + nx * halfWidth, curr.y + ny * halfWidth));
    rightSide.unshift(new THREE.Vector2(curr.x - nx * halfWidth, curr.y - ny * halfWidth));
  }

  return [...leftSide, ...rightSide];
}

export const CHARACTER_ARCHETYPES = {
  scholar: { robe: '#27a694', expression: 'calm' },
  samurai: { robe: '#d9522e', expression: 'grin' },
  ronin:   { robe: '#37474f', expression: 'angry' },
  oni:     { robe: '#4a2c40', expression: 'shock' },
};
