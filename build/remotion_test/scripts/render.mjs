// node scripts/render.mjs test | preview | full | shot <n> | shots | mux | benchmark | scale1080 [--swangle]
import fs from 'node:fs';
import path from 'node:path';
import {run, npx, story, out, ensureOut, root} from './_util.mjs';

const mode = process.argv[2];
const gl = process.argv.includes('--swangle') ? 'swangle' : 'angle';
const storyConfig = await story();
const {COMP_ID, FPS, CUTS, DURATION_S} = storyConfig;
ensureOut();

const globalOutDir = path.resolve(root, '..', '..', 'output');
if (!fs.existsSync(globalOutDir)) {
  fs.mkdirSync(globalOutDir, {recursive: true});
}

function getShotFrames(shotNum) {
  const i = shotNum - 1;
  if (i < 0 || i >= CUTS.length) {
    throw new Error(`Shot ${shotNum} is invalid. Must be between 1 and ${CUTS.length}.`);
  }
  const startSec = CUTS[i];
  const endSec = i + 1 < CUTS.length ? CUTS[i + 1] : DURATION_S;
  const startFrame = Math.round(startSec * FPS);
  const endFrame = Math.max(startFrame, Math.round(endSec * FPS) - 1);
  return {startFrame, endFrame, startSec, endSec};
}

if (mode === 'test') {
  console.log('Rendering 30 test frames...');
  await run(npx, ['remotion', 'render', 'src/index.jsx', COMP_ID, path.join('out', 'test.mp4'), '--frames=0-29', `--gl=${gl}`, '--image-format=jpeg']);
  console.log(`Rendered: ${path.join('out', 'test.mp4')}`);

} else if (mode === 'preview') {
  console.log('Rendering Fast Preview (540x960, no DOF, fast mode)...');
  const previewSilent = path.join('out', 'preview_silent.mp4');
  const previewFinal = path.join('out', 'preview.mp4');
  await run(npx, [
    'remotion', 'render', 'src/index.jsx', `${COMP_ID}-fast`, previewSilent,
    `--gl=${gl}`, '--concurrency=4', '--image-format=jpeg', '--jpeg-quality=85', '--crf=20'
  ]);

  const voPath = path.join(root, 'public', 'voiceover.wav');
  if (fs.existsSync(voPath)) {
    console.log('Multiplexing voiceover audio...');
    await run('ffmpeg', ['-y', '-i', previewSilent, '-i', voPath, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', previewFinal]);
    fs.copyFileSync(previewFinal, path.join(globalOutDir, 'preview.mp4'));
    console.log(`Preview ready: ${path.join(globalOutDir, 'preview.mp4')}`);
  } else {
    fs.copyFileSync(previewSilent, path.join(globalOutDir, 'preview.mp4'));
    console.log(`Preview ready (silent): ${path.join(globalOutDir, 'preview.mp4')}`);
  }

} else if (mode === 'full') {
  console.log('Rendering Full Production Video (720x1280)...');
  const fullSilent = path.join('out', 'full_silent.mp4');
  const fullFinal = path.join('out', 'final.mp4');
  await run(npx, [
    'remotion', 'render', 'src/index.jsx', COMP_ID, fullSilent,
    `--gl=${gl}`, '--concurrency=4', '--image-format=jpeg', '--jpeg-quality=92', '--crf=17'
  ]);

  const voPath = path.join(root, 'public', 'voiceover.wav');
  if (fs.existsSync(voPath)) {
    console.log('Multiplexing voiceover audio...');
    await run('ffmpeg', ['-y', '-i', fullSilent, '-i', voPath, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', fullFinal]);
    fs.copyFileSync(fullFinal, path.join(globalOutDir, 'final.mp4'));
    console.log(`Full video ready: ${path.join(globalOutDir, 'final.mp4')}`);
  } else {
    fs.copyFileSync(fullSilent, path.join(globalOutDir, 'final.mp4'));
    console.log(`Full video ready (silent): ${path.join(globalOutDir, 'final.mp4')}`);
  }

} else if (mode === 'shot') {
  const shotNum = parseInt(process.argv[3] || '1', 10);
  const {startFrame, endFrame, startSec, endSec} = getShotFrames(shotNum);
  const shotsDir = path.join(out, 'shots');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, {recursive: true});
  const shotFile = path.join(shotsDir, `shot_${shotNum}.mp4`);

  console.log(`Rendering Shot ${shotNum} (frames ${startFrame}-${endFrame}, ${startSec}s-${endSec}s)...`);
  await run(npx, [
    'remotion', 'render', 'src/index.jsx', COMP_ID, shotFile,
    `--frames=${startFrame}-${endFrame}`, `--gl=${gl}`, '--image-format=jpeg', '--jpeg-quality=92'
  ]);
  console.log(`Shot rendered: ${shotFile}`);

} else if (mode === 'shots') {
  const shotsDir = path.join(out, 'shots');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, {recursive: true});
  const listFile = path.join(shotsDir, 'concat_list.txt');
  let listContent = '';

  for (let s = 1; s <= CUTS.length; s++) {
    const {startFrame, endFrame, startSec, endSec} = getShotFrames(s);
    const shotFile = path.join(shotsDir, `shot_${s}.mp4`);
    console.log(`\n=== Rendering Shot ${s}/${CUTS.length} (${startSec}s - ${endSec}s) ===`);
    await run(npx, [
      'remotion', 'render', 'src/index.jsx', COMP_ID, shotFile,
      `--frames=${startFrame}-${endFrame}`, `--gl=${gl}`, '--concurrency=4', '--image-format=jpeg', '--jpeg-quality=92'
    ]);
    listContent += `file 'shot_${s}.mp4'\n`;
  }

  fs.writeFileSync(listFile, listContent);
  console.log('\nConcatenating shots via ffmpeg...');
  const joinedSilent = path.join(out, 'full_silent.mp4');
  await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', joinedSilent], {cwd: shotsDir});

  const fullFinal = path.join(out, 'final.mp4');
  const voPath = path.join(root, 'public', 'voiceover.wav');
  if (fs.existsSync(voPath)) {
    console.log('Multiplexing voiceover audio...');
    await run('ffmpeg', ['-y', '-i', joinedSilent, '-i', voPath, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', fullFinal]);
  } else {
    fs.copyFileSync(joinedSilent, fullFinal);
  }
  fs.copyFileSync(fullFinal, path.join(globalOutDir, 'final.mp4'));
  console.log(`\nAll shots joined and saved to: ${path.join(globalOutDir, 'final.mp4')}`);

} else if (mode === 'mux') {
  const voPath = path.join(root, 'public', 'voiceover.wav');
  if (!fs.existsSync(voPath)) {
    console.error('public/voiceover.wav missing');
    process.exit(1);
  }
  const fullSilent = path.join('out', 'full_silent.mp4');
  const fullFinal = path.join('out', 'final.mp4');
  await run('ffmpeg', ['-y', '-i', fullSilent, '-i', voPath, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', fullFinal]);
  fs.copyFileSync(fullFinal, path.join(globalOutDir, 'final.mp4'));
  console.log(`Wrote ${fullFinal} and copied to ${path.join(globalOutDir, 'final.mp4')}`);

} else if (mode === 'scale1080') {
  const src = path.join(out, 'final.mp4');
  const dst = path.join(globalOutDir, 'final_1080p.mp4');
  if (!fs.existsSync(src)) {
    console.error(`Source ${src} does not exist. Run full render first.`);
    process.exit(1);
  }
  console.log('Upscaling to 1080x1920 via FFmpeg Lanczos filter...');
  await run('ffmpeg', [
    '-y', '-i', src,
    '-vf', 'scale=1080:1920:flags=lanczos',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'medium',
    '-c:a', 'copy',
    dst
  ]);
  console.log(`1080p video ready: ${dst}`);

} else if (mode === 'benchmark') {
  console.log('=== Benchmarking 5 seconds (150 frames): GPU (ANGLE) vs Software (SwiftShader) ===');
  const testGpu = path.join('out', 'bench_gpu.mp4');
  const testSw = path.join('out', 'bench_sw.mp4');

  const t0Gpu = Date.now();
  await run(npx, ['remotion', 'render', 'src/index.jsx', COMP_ID, testGpu, '--frames=0-149', '--gl=angle', '--image-format=jpeg']);
  const gpuDuration = ((Date.now() - t0Gpu) / 1000).toFixed(2);

  const t0Sw = Date.now();
  await run(npx, ['remotion', 'render', 'src/index.jsx', COMP_ID, testSw, '--frames=0-149', '--gl=swangle', '--image-format=jpeg']);
  const swDuration = ((Date.now() - t0Sw) / 1000).toFixed(2);

  console.log(`\n================================`);
  console.log(`GPU (ANGLE Hardware) Duration: ${gpuDuration}s`);
  console.log(`Software (Swangle) Duration:   ${swDuration}s`);
  const speedup = (swDuration / gpuDuration).toFixed(2);
  console.log(`Hardware Acceleration Speedup: ${speedup}x`);
  console.log(`================================\n`);

} else {
  console.log(`
Usage: node scripts/render.mjs <command> [--swangle]

Commands:
  preview     Render fast preview video (540x960, no heavy DOF, muxed audio)
  full        Render full production video (720x1280, full effects, muxed audio)
  shot <n>    Render an individual shot (1-9)
  shots       Render all shots separately into out/shots/ and join with ffmpeg
  mux         Mux existing out/full_silent.mp4 with public/voiceover.wav
  scale1080   Upscale 720p output to 1080x1920 using ffmpeg Lanczos filter
  benchmark   Run 5-second (150 frame) GPU vs Software benchmark
  test        Render 30 test frames
`);
}
