// characterGenerator.js
// Generates characters dynamically from prompt descriptions or custom parameters
// using buildClothes(), buildHairAndHat(), and buildProp() callbacks with createCutoutPart()
// from characterCore.js.

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
  { robe: '#2e6f95', accent: '#f3ebd8', strap: '#6e472b', hair: '#1d1b1a' },
  { robe: '#6b4c7a', accent: '#f2c14e', strap: '#2b2523', hair: '#2a2220' },
  { robe: '#4f772d', accent: '#ecf39e', strap: '#5c3d28', hair: '#191818' },
  { robe: '#b54434', accent: '#f7d08a', strap: '#262322', hair: '#33261f' },
  { robe: '#3a5a6b', accent: '#e0fbfc', strap: '#7f5539', hair: '#202024' },
  { robe: '#8c5a2b', accent: '#fff1d0', strap: '#241f1d', hair: '#1c1c1c' },
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

// Builds any custom character dynamically from descriptive prompts or explicit options
export function buildCustomCharacter({
  prompt = '',
  name,
  seed,
  polishMode = 'plastic', // 'plastic' | 'rim' | 'raw'
  emotion = 'calm',
  expression, // legacy alias for emotion
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
  let styleType = 'robe'; // 'robe' | 'armor' | 'tunic'
  let headgearType = 'hair'; // 'hair' | 'hat' | 'topknot' | 'horns' | 'headband'
  let charEmotion = emotion || expression || 'calm';
  let resolvedPolish = polishMode;

  // Keyword extraction for dynamic styling
  if (/\braw\b/.test(lower)) resolvedPolish = 'raw';
  else if (/\brim\b/.test(lower)) resolvedPolish = 'rim';
  else if (/\bplastic|gloss|glossy\b/.test(lower)) resolvedPolish = 'plastic';

  if (/\bred|crimson|scarlet|fire\b/.test(lower)) robeColor = '#d9522e';
  if (/\bteal|green|jade|emerald\b/.test(lower)) robeColor = '#27a694';
  if (/\bblue|navy|sapphire|ocean\b/.test(lower)) robeColor = '#244866';
  if (/\bpurple|violet|plum|royal\b/.test(lower)) robeColor = '#4c264d';
  if (/\bblack|dark|shadow|charcoal\b/.test(lower)) robeColor = '#242328';
  if (/\bgold|yellow|amber\b/.test(lower)) robeColor = '#c98a2e';
  if (/\bbrown|tan|sand|khaki\b/.test(lower)) robeColor = '#8c5a2b';

  if (/\barmor|cuirass|plate|guard\b/.test(lower)) styleType = 'armor';
  else if (/\btunic|jacket|vest|coat\b/.test(lower)) styleType = 'tunic';

  if (/\bconical|straw hat|hat|traveler\b/.test(lower)) headgearType = 'hat';
  else if (/\bhorn|horned|demon|oni\b/.test(lower)) headgearType = 'horns';
  else if (/\btopknot|samurai\b/.test(lower)) headgearType = 'topknot';
  else if (/\bheadband|bun|scholar\b/.test(lower)) headgearType = 'headband';

  if (/\bshock|shocked|surprised|gasped\b/.test(lower)) charEmotion = 'shock';
  else if (/\bangry|mad|furious|stern|scowl\b/.test(lower)) charEmotion = 'angry';
  else if (/\bgrin|smiling|happy|laugh\b/.test(lower)) charEmotion = 'grin';
  else if (/\bdeadpan|flat|stoic\b/.test(lower)) charEmotion = 'deadpan';
  else if (/\bsweat|nervous|worried|anxious\b/.test(lower)) charEmotion = 'sweat';
  else if (/\bdizzy|spinning|confused\b/.test(lower)) charEmotion = 'dizzy';
  else if (/\blove|heart|crush\b/.test(lower)) charEmotion = 'love';
  else if (/\bshout|screaming|yell\b/.test(lower)) charEmotion = 'shout';

  // Apply user-defined overrides
  if (overrides.robe) robeColor = overrides.robe;
  if (overrides.accent) accentColor = overrides.accent;
  if (overrides.strap) strapColor = overrides.strap;
  if (overrides.emotion) charEmotion = overrides.emotion;
  if (overrides.expression) charEmotion = overrides.expression;
  if (overrides.polishMode) resolvedPolish = overrides.polishMode;
  if (overrides.headgear) headgearType = overrides.headgear;

  return buildCharacter({
    name: name || (prompt ? prompt.slice(0, 24) : `char_${baseSeed}`),
    seed: baseSeed,
    polishMode: resolvedPolish,
    emotion: charEmotion,
    baseBodyColor: robeColor,
    torsoW: 0.24,
    torsoH: 0.44,
    headRx: 0.22,
    headRy: 0.23,

    // Dynamic Clothes Builder Callback
    buildClothes: ({ torsoGroup, torsoW, torsoH, polishMode: pm, seed: s }) => {
      const { group: robe } = createCutoutPart(
        pillPts(torsoW * 1.08, torsoH * 0.96, torsoW * 0.4),
        robeColor,
        {
          inkBand: 0.015,
          z: Z.outfitDetail - Z.torso,
          polishMode: pm,
          castShadow: true,
        }
      );
      torsoGroup.add(robe);

      if (styleType === 'armor') {
        for (let i = 0; i < 3; i++) {
          const { group: band } = createCutoutPart(
            [
              new THREE.Vector2(-torsoW * 0.44, -0.015),
              new THREE.Vector2(torsoW * 0.44, -0.015),
              new THREE.Vector2(torsoW * 0.44, 0.015),
              new THREE.Vector2(-torsoW * 0.44, 0.015),
            ],
            strapColor,
            {
              inkBand: 0.008,
              z: Z.outfitDetail - Z.torso + 0.003,
              polishMode: pm,
              castShadow: false,
            }
          );
          band.position.y = 0.12 + i * 0.09;
          torsoGroup.add(band);
        }
      } else {
        const { group: sash } = createCutoutPart(
          [
            new THREE.Vector2(-torsoW * 0.46, -0.024),
            new THREE.Vector2(torsoW * 0.46, -0.024),
            new THREE.Vector2(torsoW * 0.46, 0.024),
            new THREE.Vector2(-torsoW * 0.46, 0.024),
          ],
          strapColor,
          {
            inkBand: 0.008,
            z: Z.outfitDetail - Z.torso + 0.003,
            polishMode: pm,
            castShadow: true,
          }
        );
        sash.position.y = 0.16;
        torsoGroup.add(sash);
      }
    },

    // Dynamic Hair & Hat Builder Callback
    buildHairAndHat: ({ headGroup, headRx, headRy, polishMode: pm, seed: s }) => {
      if (headgearType === 'hat') {
        const { group: hat } = createCutoutPart(
          [
            new THREE.Vector2(-0.35, 0.04),
            new THREE.Vector2(0.0, 0.25),
            new THREE.Vector2(0.35, 0.04),
            new THREE.Vector2(0.0, 0.09),
          ],
          accentColor,
          {
            inkBand: 0.016,
            z: Z.headgear - Z.head,
            polishMode: pm,
            castShadow: true,
          }
        );
        hat.position.set(0, headRy * 0.55, 0);
        headGroup.add(hat);
      } else if (headgearType === 'horns') {
        const { group: hornL } = createCutoutPart(
          [
            new THREE.Vector2(-0.03, 0),
            new THREE.Vector2(0.03, 0),
            new THREE.Vector2(-0.045, 0.16),
          ],
          accentColor,
          {
            inkBand: 0.012,
            z: Z.headgear - Z.head,
            polishMode: pm,
            castShadow: true,
          }
        );
        hornL.position.set(-0.085, headRy * 0.82, 0);
        const hornR = hornL.clone();
        hornR.position.x = 0.085;
        hornR.scale.x = -1;
        headGroup.add(hornL, hornR);
      } else if (headgearType === 'topknot') {
        const { group: topknot } = createCutoutPart(
          pillPts(0.055, 0.08, 0.02),
          hairColor,
          {
            inkBand: 0.012,
            z: Z.hair - Z.head,
            polishMode: pm,
          }
        );
        topknot.position.set(0, headRy - 0.01, 0);
        headGroup.add(topknot);
      } else {
        // Headband + Bun
        const { group: hair } = createCutoutPart(
          ovalPts(headRx * 0.95, headRy * 0.42, s + 1, 32),
          hairColor,
          {
            inkBand: 0.012,
            z: Z.hair - Z.head,
            polishMode: pm,
          }
        );
        hair.position.y = headRy * 0.72;
        headGroup.add(hair);
      }
    },

    // Dynamic Prop Builder Callback
    buildProp: ({ root, polishMode: pm, seed: s }) => {
      const activeProp = prop || overrides.prop;
      if (!activeProp) return;

      const propGroup = new THREE.Group();
      propGroup.name = `prop_${activeProp}`;
      propGroup.position.set(-0.22, 0.62, 0.04);

      if (activeProp === 'staff') {
        const { group: shaft } = createCutoutPart(
          [
            new THREE.Vector2(-0.012, -0.65),
            new THREE.Vector2(0.012, -0.65),
            new THREE.Vector2(0.012, 0.55),
            new THREE.Vector2(-0.012, 0.55),
          ],
          strapColor,
          {
            inkBand: 0.008,
            z: 0.02,
            polishMode: pm,
          }
        );
        const { group: tip } = createCutoutPart(
          ovalPts(0.038, 0.038, s + 22, 18),
          accentColor,
          {
            inkBand: 0.008,
            z: 0.024,
            polishMode: pm,
          }
        );
        tip.position.y = 0.56;
        propGroup.add(shaft, tip);
      } else if (activeProp === 'orb') {
        const { group: orb } = createCutoutPart(
          ovalPts(0.055, 0.055, s + 23, 24),
          '#3a3d42',
          {
            inkBand: 0.01,
            z: 0.02,
            polishMode: pm,
          }
        );
        propGroup.add(orb);
      } else if (activeProp === 'scroll') {
        const { group: roll } = createCutoutPart(
          pillPts(0.05, 0.18, 0.02),
          '#efe3c8',
          {
            inkBand: 0.008,
            z: 0.02,
            polishMode: pm,
          }
        );
        propGroup.add(roll);
      }
      root.add(propGroup);
    },
  });
}
