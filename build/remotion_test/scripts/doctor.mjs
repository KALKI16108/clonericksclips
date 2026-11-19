// node scripts/doctor.mjs - checks the environment before building.
import fs from 'node:fs';
import path from 'node:path';
import {root, capture, npx} from './_util.mjs';

let bad = 0;
const ok = (m) => console.log('  OK   ' + m);
const warn = (m) => console.log('  WARN ' + m);
const fail = (m) => { bad++; console.log('  FAIL ' + m); };

const major = Number(process.versions.node.split('.')[0]);
major >= 18 ? ok(`Node ${process.versions.node}`) : fail(`Node ${process.versions.node} - need 18+ (20 LTS best)`);
fs.existsSync(path.join(root, 'node_modules')) ? ok('node_modules present') : fail('node_modules missing - run: npm install');
for (const f of ['src/story.js', 'src/Full.jsx', 'src/kit.js', 'src/char3.js', 'src/camera.js']) fs.existsSync(path.join(root, f)) ? ok(f) : fail(`missing ${f}`);
fs.existsSync(path.join(root, 'public', 'voiceover.wav')) ? ok('public/voiceover.wav') : warn('no public/voiceover.wav - timing will be estimated (3.35 words/s)');
try {
  const st = JSON.parse(fs.readFileSync(path.join(root, 'sentence_times.json'), 'utf8'));
  st.length ? ok(`sentence_times.json (${st.length} sentences)`) : warn('sentence_times.json is empty');
} catch { warn('sentence_times.json unreadable'); }

if (!bad) {
  const r = await capture(npx, ['remotion', 'ffmpeg', '-version']);
  r.code === 0 ? ok('ffmpeg via Remotion') : warn('ffmpeg via Remotion not ready yet (it installs on first render)');
}
console.log(bad ? `\n${bad} problem(s) to fix.` : '\nReady. Next: node scripts/render.mjs test');
process.exit(bad ? 1 : 0);
