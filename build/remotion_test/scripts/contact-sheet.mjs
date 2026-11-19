// node scripts/contact-sheet.mjs <out.png> <cols> <img1> <img2> ...   (uses Remotion's ffmpeg, cross-platform)
import fs from 'node:fs';
import path from 'node:path';
import {run, npx, root} from './_util.mjs';

const [outFile, colsArg, ...imgs] = process.argv.slice(2);
if (!outFile || !imgs.length) { console.error('Usage: contact-sheet.mjs <out.png> <cols> <imgs...>'); process.exit(1); }
const cols = Number(colsArg) || 4, rows = Math.ceil(imgs.length / cols);
const list = path.join(root, 'out', '_sheet_list.txt');
fs.writeFileSync(list, imgs.map((f) => `file '${path.resolve(f).replace(/\\/g, '/')}'\nduration 1`).join('\n') + `\nfile '${path.resolve(imgs.at(-1)).replace(/\\/g, '/')}'\n`);
await run(npx, ['remotion', 'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=360:-1,tile=${cols}x${rows}`, '-frames:v', '1', outFile]);
console.log('Wrote ' + outFile);
