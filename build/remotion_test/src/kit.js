// Shared 3D kit: toon materials, ink outlines, painted textures, building helpers.
import * as THREE from 'three';

export const INK = '#24231f';
const INK_RGB = [0x24/255, 0x23/255, 0x1f/255];

// Seeded RNG so every frame renders identically.
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// 3-band toon gradient.
let _grad;
export function toonGradient() {
  if (_grad) return _grad;
  const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  _grad.minFilter = _grad.magFilter = THREE.NearestFilter;
  _grad.needsUpdate = true;
  return _grad;
}

export function toonMat(colorOrMap) {
  const o = {gradientMap: toonGradient()};
  if (colorOrMap && colorOrMap.isTexture) o.map = colorOrMap; else o.color = colorOrMap || '#cccccc';
  return new THREE.MeshToonMaterial(o);
}

// Painted flat colour with wear (stains, chips, scratches) on a canvas.
export function paintedTexture(base = '#c9a27a', {size = 256, seed = 3, stains = 6, chips = 14, scratches = 8, repeat = [1, 1]} = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < stains; i++) {
    g.fillStyle = `rgba(60,40,30,${0.05 + r() * 0.08})`;
    g.beginPath(); g.ellipse(r()*size, r()*size, 10 + r()*40, 8 + r()*30, r()*3, 0, 7); g.fill();
  }
  for (let i = 0; i < chips; i++) {
    g.fillStyle = `rgba(245,235,215,${0.25 + r() * 0.3})`;
    g.fillRect(r()*size, r()*size, 2 + r()*6, 2 + r()*5);
  }
  g.strokeStyle = 'rgba(53,31,34,0.25)'; g.lineWidth = 1;
  for (let i = 0; i < scratches; i++) {
    const x = r()*size, y = r()*size; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r()-.5)*40, y + (r()-.5)*40); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Painted sign texture: text lives INSIDE the world, never as an overlay.
export function signTexture(text, {w = 512, h = 160, bg = '#e9dcc0', fg = INK, font = 'bold 64px Georgia, serif'} = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 4, w - 40);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// Inverted-hull outline + crease edge lines. Returns the same mesh (with children).
export function outlined(mesh, {thickness = 0.03, edgeAngle = 35} = {}) {
  const hull = new THREE.Mesh(mesh.geometry, new THREE.ShaderMaterial({
    uniforms: {t: {value: thickness}},
    vertexShader: 'uniform float t; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * t, 1.0); }',
    fragmentShader: `void main(){ gl_FragColor = vec4(${INK_RGB.map((v) => v.toFixed(4)).join(',')}, 1.0); }`,
    side: THREE.BackSide,
  }));
  hull.name = 'ink-hull';
  mesh.add(hull);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, edgeAngle), new THREE.LineBasicMaterial({color: INK}));
  edges.name = 'ink-edges';
  mesh.add(edges);
  return mesh;
}

export function box(w, h, d, mat, {outline = true, thickness = 0.02} = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = m.receiveShadow = true;
  return outline ? outlined(m, {thickness}) : m;
}

// Facade: extruded wall with window openings and a door NOTCH open at the bottom edge.
// windows: [{x, y, w, h}] (x,y = centre, y from ground). door: {x, w, h} or null.
export function facade({w = 6, h = 5, d = 0.5, windows = [], door = null, color = '#b98a62', seed = 5} = {}) {
  const shape = new THREE.Shape();
  const hw = w / 2;
  shape.moveTo(-hw, 0);
  if (door) {
    shape.lineTo(door.x - door.w / 2, 0);
    shape.lineTo(door.x - door.w / 2, door.h);
    shape.lineTo(door.x + door.w / 2, door.h);
    shape.lineTo(door.x + door.w / 2, 0);
  }
  shape.lineTo(hw, 0); shape.lineTo(hw, h); shape.lineTo(-hw, h); shape.lineTo(-hw, 0);
  for (const o of windows) {
    const p = new THREE.Path();
    p.moveTo(o.x - o.w/2, o.y - o.h/2); p.lineTo(o.x - o.w/2, o.y + o.h/2);
    p.lineTo(o.x + o.w/2, o.y + o.h/2); p.lineTo(o.x + o.w/2, o.y - o.h/2); p.lineTo(o.x - o.w/2, o.y - o.h/2);
    shape.holes.push(p);
  }
  const grp = new THREE.Group();
  const wallTex = paintedTexture(color, {seed, repeat: [1, 1]});
  const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: d, bevelEnabled: false}), toonMat(wallTex));
  wall.castShadow = wall.receiveShadow = true;
  outlined(wall, {thickness: 0.025});
  grp.add(wall);
  // interior backdrop so openings never show the void
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toonMat('#4a3a34'));
  back.position.set(0, h / 2, d * 0.2); grp.add(back);
  // sills
  for (const o of windows) {
    const s = box(o.w + 0.25, 0.1, d + 0.2, toonMat('#e3d3b4'));
    s.position.set(o.x, o.y - o.h / 2 - 0.05, d / 2 + 0.05); grp.add(s);
  }
  // cornice
  const cor = box(w + 0.3, 0.25, d + 0.3, toonMat('#d8c39a')); cor.position.set(0, h + 0.1, d / 2); grp.add(cor);
  return grp;
}

export function lampPost(h = 3.2) {
  const g = new THREE.Group();
  const pole = box(0.1, h, 0.1, toonMat('#2f2a2b')); pole.position.y = h / 2; g.add(pole);
  const head = box(0.35, 0.4, 0.35, toonMat('#ffe9a8')); head.position.y = h + 0.2; g.add(head);
  return g;
}

export function barrel(r = 0.35, h = 0.8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, h, 16), toonMat(paintedTexture('#8b5a34', {seed: 9})));
  m.position.y = h / 2; m.castShadow = true; return outlined(m, {thickness: 0.02});
}

export function ground(size = 60, color = '#8a6f52', seed = 11) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toonMat(paintedTexture(color, {seed, stains: 30, chips: 60, repeat: [8, 8]})));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}

export function signBoard(text, w = 2.4, h = 0.75) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), [
    toonMat('#6b4a2e'), toonMat('#6b4a2e'), toonMat('#6b4a2e'), toonMat('#6b4a2e'),
    new THREE.MeshBasicMaterial({map: signTexture(text, {w: 512, h: Math.round(512 * h / w)})}), toonMat('#6b4a2e'),
  ]);
  return outlined(m, {thickness: 0.015});
}
