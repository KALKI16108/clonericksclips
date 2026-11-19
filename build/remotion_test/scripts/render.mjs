// node scripts/render.mjs test | full | mux [--swangle]
// test = first 30 frames, full = whole video (silent), mux = add public/voiceover.wav -> out/final.mp4
import fs from 'node:fs';
import path from 'node:path';
import {run, npx, story, out, ensureOut, root} from './_util.mjs';

const mode = process.argv[2];
const gl = process.argv.includes('--swangle') ? 'swangle' : 'angle';
const {COMP_ID} = await story();
ensureOut();

if (mode === 'test') {
  await run(npx, ['remotion', 'render', 'src/index.jsx', COMP_ID, path.join('out', 'test.mp4'), '--frames=0-29', `--gl=${gl}`, '--image-format=jpeg']);
} else if (mode === 'full') {
  await run(npx, ['remotion', 'render', 'src/index.jsx', COMP_ID, path.join('out', 'full_silent.mp4'), `--gl=${gl}`, '--concurrency=4', '--image-format=jpeg', '--jpeg-quality=92', '--crf=17']);
} else if (mode === 'mux') {
  if (!fs.existsSync(path.join(root, 'public', 'voiceover.wav'))) { console.error('public/voiceover.wav missing'); process.exit(1); }
  await run(npx, ['remotion', 'ffmpeg', '-y', '-i', path.join('out', 'full_silent.mp4'), '-i', path.join('public', 'voiceover.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', path.join('out', 'final.mp4')]);
  console.log('Wrote out/final.mp4');
} else {
  console.error('Usage: node scripts/render.mjs test|full|mux [--swangle]'); process.exit(1);
}
