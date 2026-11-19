// characterGenerator.js
// Generates characters dynamically from prompt descriptions or custom parameters
// leveraging characterCore.js rich hair, headgear, outfits, and props.

import * as THREE from 'three';
import {
  buildCharacter,
  createCutoutPart,
  attachSurfaceOverlay,
  ovalPts,
  pillPts,
  replaceCharacter,
  animateCharacter,
  INK,
  Z,
} from './characterCore.js';

const PALETTES = [
  { robe: '#27a694', accent: '#f4efe8', strap: '#785231', hair: '#1f1c1b' },
  { robe: '#d9522e', accent: '#f2b84b', strap: '#242120', hair: '#1e1c1b' },
  { robe: '#4c264d', accent: '#f2c14e', strap: '#2b2523', hair: '#2a2220' },
  { robe: '#244866', accent: '#e0fbfc', strap: '#7f5539', hair: '#1d1b1a' },
  { robe: '#8c5a2b', accent: '#fff1d0', strap: '#241f1d', hair: '#33261f' },
  { robe: '#37474f', accent: '#cfd8dc', strap: '#8d5b34', hair: '#191818' },
];

function hashText(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const CUSTOM_ARCHETYPES = new Map();

export function registerCharacterArchetype(name, config) {
  CUSTOM_ARCHETYPES.set(name.toLowerCase(), config);
}

export function buildCustomCharacter({
  prompt = '',
  name,
  seed,
  polishMode = 'plastic',
  emotion = 'calm',
  expression,
  prop = null,
  overrides = {},
} = {}) {
  const lower = prompt.toLowerCase();
  const baseSeed = seed ?? (hashText(prompt || name || 'char') % 10000) + 1;
  const palette = PALETTES[baseSeed % PALETTES.length];

  let robeColor = palette.robe;
  let accentColor = palette.accent;
  let strapColor = palette.strap;
  let hairColor = palette.hair;

  let resolvedOutfitStyle = 'scholarRobe';
  let resolvedHairStyle = 'scholarBun';
  let resolvedHatStyle = 'none';
  let charEmotion = emotion || expression || 'calm';
  let resolvedPolish = polishMode;

  // Keyword extraction for colors
  if (/\bred|crimson|scarlet|fire\b/.test(lower)) robeColor = '#d9522e';
  if (/\bteal|green|jade|emerald\b/.test(lower)) robeColor = '#27a694';
  if (/\bblue|navy|sapphire|ocean\b/.test(lower)) robeColor = '#244866';
  if (/\bpurple|violet|plum|royal\b/.test(lower)) robeColor = '#4c264d';
  if (/\bblack|dark|shadow|charcoal\b/.test(lower)) robeColor = '#242328';
  if (/\bgold|yellow|amber\b/.test(lower)) robeColor = '#c98a2e';
  if (/\bbrown|tan|sand|khaki\b/.test(lower)) robeColor = '#8c5a2b';

  // Keyword extraction for outfits
  if (/\barmor|armored|cuirass|plate|guard|soldier\b/.test(lower)) {
    resolvedOutfitStyle = 'samuraiArmor';
  } else if (/\bcoat|trench|jacket|detective\b/.test(lower)) {
    resolvedOutfitStyle = 'trenchCoat';
  } else if (/\bhoodie|casual|sweatshirt\b/.test(lower)) {
    resolvedOutfitStyle = 'hoodie';
  } else {
    resolvedOutfitStyle = 'scholarRobe';
  }

  // Keyword extraction for headgear / hats
  if (/\bconical|straw hat|hat|traveler|kasa\b/.test(lower)) {
    resolvedHatStyle = 'kasaHat';
    resolvedHairStyle = 'scholarBun';
  } else if (/\bhorn|horned|demon|oni\b/.test(lower)) {
    resolvedHatStyle = 'oniHorns';
    resolvedHairStyle = 'topknot';
  } else if (/\bhelmet|kabuto|warrior\b/.test(lower)) {
    resolvedHatStyle = 'kabutoHelmet';
    resolvedHairStyle = 'topknot';
  } else if (/\bjingasa|war hat\b/.test(lower)) {
    resolvedHatStyle = 'jingasaHat';
    resolvedHairStyle = 'topknot';
  } else if (/\btopknot|samurai\b/.test(lower)) {
    resolvedHairStyle = 'topknot';
    resolvedHatStyle = 'none';
  } else if (/\blayered|long hair\b/.test(lower)) {
    resolvedHairStyle = 'layeredLocks';
    resolvedHatStyle = 'none';
  } else if (/\bshaggy|bangs\b/.test(lower)) {
    resolvedHairStyle = 'shaggyCut';
    resolvedHatStyle = 'none';
  } else {
    resolvedHairStyle = 'scholarBun';
    resolvedHatStyle = 'none';
  }

  // Keyword extraction for emotions
  if (/\bshock|shocked|surprised|gasped\b/.test(lower)) charEmotion = 'shock';
  else if (/\bangry|mad|furious|stern|scowl\b/.test(lower)) charEmotion = 'angry';
  else if (/\bgrin|smiling|happy|laugh\b/.test(lower)) charEmotion = 'grin';
  else if (/\bdeadpan|flat|stoic\b/.test(lower)) charEmotion = 'deadpan';
  else if (/\bsweat|nervous|worried|anxious\b/.test(lower)) charEmotion = 'sweat';
  else if (/\bdizzy|spinning|confused\b/.test(lower)) charEmotion = 'dizzy';
  else if (/\blove|heart|crush\b/.test(lower)) charEmotion = 'love';
  else if (/\bshout|screaming|yell\b/.test(lower)) charEmotion = 'shout';
  else if (/\bsad|gloomy|unhappy\b/.test(lower)) charEmotion = 'sad';
  else if (/\bcrying|tears\b/.test(lower)) charEmotion = 'crying';
  else if (/\bsmug\b/.test(lower)) charEmotion = 'smug';

  // Apply overrides
  if (overrides.robe) robeColor = overrides.robe;
  if (overrides.baseBodyColor) robeColor = overrides.baseBodyColor;
  if (overrides.accent) accentColor = overrides.accent;
  if (overrides.accentColor) accentColor = overrides.accentColor;
  if (overrides.strap) strapColor = overrides.strap;
  if (overrides.strapColor) strapColor = overrides.strapColor;
  if (overrides.hairColor) hairColor = overrides.hairColor;
  if (overrides.outfitStyle) resolvedOutfitStyle = overrides.outfitStyle;
  if (overrides.hairStyle) resolvedHairStyle = overrides.hairStyle;
  if (overrides.hatStyle) resolvedHatStyle = overrides.hatStyle;
  if (overrides.emotion) charEmotion = overrides.emotion;
  if (overrides.expression) charEmotion = overrides.expression;
  if (overrides.polishMode) resolvedPolish = overrides.polishMode;

  const activeProp = prop || overrides.prop;

  return buildCharacter({
    name: name || (prompt ? prompt.slice(0, 24) : `char_${baseSeed}`),
    seed: baseSeed,
    skin: overrides.skin || '#f3efe9',
    baseBodyColor: robeColor,
    outfitStyle: resolvedOutfitStyle,
    hairStyle: resolvedHairStyle,
    hairColor,
    hatStyle: resolvedHatStyle,
    accentColor,
    strapColor,
    torsoW: overrides.torsoW || 0.24,
    torsoH: overrides.torsoH || 0.44,
    headRx: overrides.headRx || 0.205,
    headRy: overrides.headRy || 0.215,
    emotion: charEmotion,
    polishMode: resolvedPolish,
    buildProp: activeProp
      ? ({ root, polishMode: pm, seed: s }) => {
          const propGroup = new THREE.Group();
          propGroup.name = `prop_${activeProp}`;
          propGroup.position.set(-0.24, 0.62, 0.04);

          if (activeProp === 'staff') {
            const { group: shaft } = createCutoutPart(
              [
                new THREE.Vector2(-0.012, -0.65),
                new THREE.Vector2(0.012, -0.65),
                new THREE.Vector2(0.012, 0.55),
                new THREE.Vector2(-0.012, 0.55),
              ],
              strapColor,
              { inkBand: 0.008, z: 0.02, polishMode: pm }
            );
            const { group: tip } = createCutoutPart(
              ovalPts(0.038, 0.038, s + 22, 18),
              accentColor,
              { inkBand: 0.008, z: 0.024, polishMode: pm }
            );
            tip.position.y = 0.56;
            propGroup.add(shaft, tip);
          } else if (activeProp === 'orb') {
            const { group: orb } = createCutoutPart(
              ovalPts(0.055, 0.055, s + 23, 24),
              '#3a3d42',
              { inkBand: 0.01, z: 0.02, polishMode: pm }
            );
            propGroup.add(orb);
          } else if (activeProp === 'scroll') {
            const { group: roll } = createCutoutPart(
              pillPts(0.05, 0.18, 0.02),
              '#efe3c8',
              { inkBand: 0.008, z: 0.02, polishMode: pm }
            );
            propGroup.add(roll);
          }
          root.add(propGroup);
        }
      : null,
  });
}
