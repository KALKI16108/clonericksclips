// node scripts/shot-frames.mjs [video]   one frame per shot from the REAL video (mid-shot) + out/final_contact.png
import path from 'node:path';
import {run, npx, story, ensureOut} from './_util.mjs';

const video = process.argv[2] || path.join('out', 'final.mp4');
const {CUTS, DURATION_S} = await story();
ensureOut();
const files = [];
for (let i = 0; i < CUTS.length; i++) {
  const end = i + 1 < CUTS.length ? CUTS[i + 1] : DURATION_S;
  const mid = ((CUTS[i] + end) / 2).toFixed(2);
  const f = path.join('out', `shot_${String(i + 1).padStart(2, '0')}.png`);
  await run(npx, ['remotion', 'ffmpeg', '-y', '-ss', mid, '-i', video, '-frames:v', '1', f]);
  files.push(f);
}
await run(process.execPath, ['scripts/contact-sheet.mjs', path.join('out', 'final_contact.png'), '4', ...files]);
