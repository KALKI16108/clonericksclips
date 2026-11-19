import path from 'node:path';
import {run, npx} from './_util.mjs';

const frames = [
  {frame: 0, file: '../../stills/test_still_01.png'},
  {frame: 30, file: '../../stills/test_still_02.png'},
  {frame: 75, file: '../../stills/test_still_03.png'},
  {frame: 112, file: '../../stills/test_still_04.png'},
  {frame: 149, file: '../../stills/test_still_05.png'}
];

const chromePath = 'C:\\PROGRA~1\\Google\\Chrome\\Application\\chrome.exe';

for (const item of frames) {
  console.log(`Rendering frame ${item.frame} to ${item.file}...`);
  await run(npx, [
    'remotion', 'still', 'src/index.jsx', 'test-scene', item.file,
    `--frame=${item.frame}`,
    '--gl=angle',
    `--browser-executable=${chromePath}`
  ]);
}
console.log('All 5 stills rendered successfully.');
