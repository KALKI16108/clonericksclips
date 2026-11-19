import path from 'node:path';
import fs from 'node:fs';
import {run, npx, root} from './_util.mjs';

const frames = [
  {shot: 1, frame: 61, file: '../../stills/shot_01.png'},
  {shot: 2, frame: 186, file: '../../stills/shot_02.png'},
  {shot: 3, frame: 348, file: '../../stills/shot_03.png'},
  {shot: 4, frame: 534, file: '../../stills/shot_04.png'},
  {shot: 5, frame: 713, file: '../../stills/shot_05.png'},
  {shot: 6, frame: 887, file: '../../stills/shot_06.png'},
  {shot: 7, frame: 1074, file: '../../stills/shot_07.png'},
  {shot: 8, frame: 1254, file: '../../stills/shot_08.png'},
  {shot: 9, frame: 1401, file: '../../stills/shot_09.png'},
];

const chromePath = 'C:\\PROGRA~1\\Google\\Chrome\\Application\\chrome.exe';

const stillsDir = path.resolve(root, '../../stills');
if (!fs.existsSync(stillsDir)) {
  fs.mkdirSync(stillsDir, {recursive: true});
}

for (const item of frames) {
  console.log(`Rendering shot ${item.shot} (frame ${item.frame}) to ${item.file}...`);
  await run(npx, [
    'remotion', 'still', 'src/index.jsx', 'exploding-whale', item.file,
    `--frame=${item.frame}`,
    '--gl=angle',
    `--browser-executable=${chromePath}`
  ]);
}
console.log('All 9 stills rendered successfully.');
