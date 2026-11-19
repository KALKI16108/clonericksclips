// node scripts/verify.mjs [video]  - size, fps, duration, audio via Remotion's ffprobe
import path from 'node:path';
import {run, npx} from './_util.mjs';
const video = process.argv[2] || path.join('out', 'final.mp4');
await run(npx, ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,duration', '-of', 'default=nw=1', video]);
