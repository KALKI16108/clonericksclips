import path from 'node:path';
import fs from 'node:fs';
import {run, npx, root} from './_util.mjs';

const frames = [
  {shot: 1, name: 'shot_01_start', frame: 0, file: '../../stills/camera_paths/shot_01_start.png'},
  {shot: 1, name: 'shot_01_end',   frame: 121, file: '../../stills/camera_paths/shot_01_end.png'},
  {shot: 2, name: 'shot_02_start', frame: 123, file: '../../stills/camera_paths/shot_02_start.png'},
  {shot: 2, name: 'shot_02_end',   frame: 249, file: '../../stills/camera_paths/shot_02_end.png'},
  {shot: 3, name: 'shot_03_start', frame: 251, file: '../../stills/camera_paths/shot_03_start.png'},
  {shot: 3, name: 'shot_03_end',   frame: 445, file: '../../stills/camera_paths/shot_03_end.png'},
  {shot: 4, name: 'shot_04_start', frame: 447, file: '../../stills/camera_paths/shot_04_start.png'},
  {shot: 4, name: 'shot_04_end',   frame: 621, file: '../../stills/camera_paths/shot_04_end.png'},
  {shot: 5, name: 'shot_05_start', frame: 623, file: '../../stills/camera_paths/shot_05_start.png'},
  {shot: 5, name: 'shot_05_end',   frame: 803, file: '../../stills/camera_paths/shot_05_end.png'},
  {shot: 6, name: 'shot_06_start', frame: 805, file: '../../stills/camera_paths/shot_06_start.png'},
  {shot: 6, name: 'shot_06_end',   frame: 967, file: '../../stills/camera_paths/shot_06_end.png'},
  {shot: 7, name: 'shot_07_start', frame: 969, file: '../../stills/camera_paths/shot_07_start.png'},
  {shot: 7, name: 'shot_07_end',   frame: 1179, file: '../../stills/camera_paths/shot_07_end.png'},
  {shot: 8, name: 'shot_08_start', frame: 1181, file: '../../stills/camera_paths/shot_08_start.png'},
  {shot: 8, name: 'shot_08_end',   frame: 1327, file: '../../stills/camera_paths/shot_08_end.png'},
  {shot: 9, name: 'shot_09_start', frame: 1329, file: '../../stills/camera_paths/shot_09_start.png'},
  {shot: 9, name: 'shot_09_end',   frame: 1471, file: '../../stills/camera_paths/shot_09_end.png'},
];

const chromePath = 'C:\\PROGRA~1\\Google\\Chrome\\Application\\chrome.exe';

const outDir = path.resolve(root, '../../stills/camera_paths');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, {recursive: true});
}

for (const item of frames) {
  console.log(`Rendering ${item.name} (shot ${item.shot}, frame ${item.frame}) to ${item.file}...`);
  await run(npx, [
    'remotion', 'still', 'src/index.jsx', 'exploding-whale', item.file,
    `--frame=${item.frame}`,
    '--gl=angle',
    `--browser-executable=${chromePath}`
  ]);
}
console.log('All 18 camera path stills rendered successfully.');
