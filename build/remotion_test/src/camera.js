// Camera helpers. All pure functions of time t (seconds) - never wall-clock.

// Monotone cubic time warp: maps time -> path position 0..1 so the camera reaches
// each key at its beat time, with zero speed at first and last key.
export function warpU(T, t) {
  const n = T.length; if (t <= T[0]) return 0; if (t >= T[n-1]) return 1;
  const sec = []; for (let i = 0; i < n-1; i++) sec.push((1/(n-1)) / (T[i+1]-T[i]));
  const m = [0]; for (let i = 1; i < n-1; i++) m.push(2*sec[i-1]*sec[i]/(sec[i-1]+sec[i])); m.push(0);
  let i = 0; while (t > T[i+1]) i++;
  const h = T[i+1]-T[i], x = (t-T[i])/h, x2 = x*x, x3 = x2*x;
  return (2*x3-3*x2+1)*(i/(n-1)) + (x3-2*x2+x)*h*m[i] + (-2*x3+3*x2)*((i+1)/(n-1)) + (x3-x2)*h*m[i+1];
}

const cr = (p0, p1, p2, p3, t) => { // Catmull-Rom, scalar
  const t2 = t*t, t3 = t2*t;
  return 0.5*((2*p1) + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3);
};

// Sample a smooth path through key points at u in 0..1.
export function samplePath(keys, u) {
  const n = keys.length;
  if (n === 1) return keys[0].slice();
  const f = Math.min(Math.max(u, 0), 1) * (n - 1);
  const i = Math.min(Math.floor(f), n - 2), t = f - i;
  const g = (k) => keys[Math.min(Math.max(k, 0), n - 1)];
  return [0, 1, 2].map((a) => cr(g(i-1)[a], g(i)[a], g(i+1)[a], g(i+2)[a], t));
}

// Camera pose for a shot at time t.
export function cameraAt(shot, t) {
  const u = warpU(shot.beats, t);
  return {pos: samplePath(shot.pos, u), look: samplePath(shot.look, u)};
}

export const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
// 0 before t0, 1 after t1, smooth between. Use to tie events to words.
export const ramp = (t, t0, t1) => { const x = clamp01((t - t0) / (t1 - t0)); return x*x*(3-2*x); };

// Index of the active shot at time t given CUTS.
export function shotIndex(cuts, t) {
  let k = 0; for (let i = 0; i < cuts.length; i++) if (t >= cuts[i]) k = i; return k;
}
