// node scripts/stills.mjs <t1> <t2> ...   times in seconds. Renders half-scale stills ONE AT A TIME, then out/contact.png
import path from 'node:path';
import {run, npx, story, ensureOut} from './_util.mjs';

const times = process.argv.slice(2).map(Number).filter((x) => !Number.isNaN(x));
if (!times.length) { console.error('Usage: node scripts/stills.mjs <seconds...>'); process.exit(1); }
const gl = process.env.GL || 'angle';
const {COMP_ID, FPS} = await story();
ensureOut();
const files = [];
for (const t of times) {
  const f = path.join('out', `still_${t.toFixed(2)}.png`);
  await run(npx, ['remotion', 'still', 'src/index.jsx', COMP_ID, f, `--frame=${Math.round(t * FPS)}`, '--scale=0.5', `--gl=${gl}`]);
  files.push(f);
}
await run(process.execPath, ['scripts/contact-sheet.mjs', path.join('out', 'contact.png'), '4', ...files]);
