// char3.js
// Modular 2.5D character bridge connecting to characterCore.js.
import * as THREE from 'three';
import {
  buildCharacter,
  animateCharacter as coreAnimateCharacter,
  createCutoutPart,
  ovalPts,
  pillPts,
  INK,
  Z,
} from './characterCore.js';

export const PALETTES = {
  clerk:    {skin: '#f3efe9', hair: '#1f1c1b', torsoA: '#27a694', torsoB: '#186e61', tie: '#785231', pants: '#1b1817'},
  boss:     {skin: '#f3efe9', hair: '#3a2a24', torsoA: '#4c264d', torsoB: '#2b192c', tie: '#f2c14e', pants: '#1b1817'},
  worker:   {skin: '#f3efe9', hair: '#2a2220', torsoA: '#8c5a2b', torsoB: '#5c3d28', tie: '#ecf39e', pants: '#1b1817'},
  engineer: {skin: '#f3efe9', hair: '#1d1b1a', torsoA: '#d9522e', torsoB: '#a33315', tie: '#f4efe8', pants: '#1b1817'},
  veteran:  {skin: '#f3efe9', hair: '#4a3324', torsoA: '#244866', torsoB: '#183247', tie: '#e0fbfc', pants: '#1b1817'},
};

export function makeCharacter({
  palette = 'clerk',
  hat = null,
  glasses = false,
  expression = 'calm',
  emotion = null,
  seed = 1,
} = {}) {
  const P = typeof palette === 'string' ? (PALETTES[palette] || PALETTES.clerk) : palette;
  const activeEmotion = emotion || (expression === 'normal' ? 'calm' : expression);

  let hatStyle = 'none';
  if (hat === 'top' || hat === 'bowler') hatStyle = 'kasaHat';
  else if (hat === 'hard') hatStyle = 'kabutoHelmet';
  else if (hat === 'cap') hatStyle = 'jingasaHat';

  const char = buildCharacter({
    name: typeof palette === 'string' ? palette : 'character',
    seed,
    skin: P.skin,
    baseBodyColor: P.torsoA,
    outfitStyle: 'scholarRobe',
    hairStyle: 'scholarBun',
    hairColor: P.hair,
    hatStyle,
    accentColor: P.tie,
    strapColor: P.pants,
    emotion: activeEmotion,
    polishMode: 'plastic',
  });

  if (glasses) {
    const glassesGroup = new THREE.Group();
    const faceZ = Z.face - Z.head + 0.005;
    for (const s of [-1, 1]) {
      const rim = new THREE.Mesh(
        new THREE.RingGeometry(0.038, 0.046, 24),
        new THREE.MeshBasicMaterial({ color: INK, side: THREE.DoubleSide })
      );
      rim.position.set(s * 0.045, 0.012, faceZ);
      glassesGroup.add(rim);
    }
    const bridge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.024, 0.008),
      new THREE.MeshBasicMaterial({ color: INK, side: THREE.DoubleSide })
    );
    bridge.position.set(0, 0.012, faceZ);
    glassesGroup.add(bridge);

    if (char.userData?.rig?.headGroup) {
      char.userData.rig.headGroup.add(glassesGroup);
    }
  }

  char.userData.palette = P;
  char.userData.seed = seed;
  return char;
}

export function animateCharacter(root, t, camPos, options = {}) {
  if (!root) return;

  const emotion = options.emotion || root.userData?.emotion || 'calm';
  const speaking = options.speaking ?? false;
  const angerLevel = options.angerLevel ?? 0;
  const shouting = options.shouting ?? false;

  coreAnimateCharacter(root, t, { emotion, speaking, angerLevel, shouting });

  if (camPos && camPos.isVector3) {
    const wPos = new THREE.Vector3();
    root.getWorldPosition(wPos);
    const want = Math.atan2(camPos.x - wPos.x, camPos.z - wPos.z);
    const yawClamp = options.yawClamp ?? 0.7;
    const baseYaw = options.baseYaw ?? 0;
    root.rotation.y = baseYaw + Math.max(-yawClamp, Math.min(yawClamp, want - baseYaw));
  }
}
