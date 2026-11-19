import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const isWin = process.platform === 'win32';
export const npx = isWin ? 'npx.cmd' : 'npx';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {stdio: 'inherit', cwd: root, shell: isWin, ...opts});
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))));
    p.on('error', reject);
  });
}

export function capture(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, {cwd: root, shell: isWin});
    let out = ''; p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
    p.on('close', (code) => resolve({code, out})); p.on('error', () => resolve({code: -1, out: ''}));
  });
}

// Read COMP_ID, FPS, CUTS from src/story.js without importing JSX deps.
export async function story() {
  return import(pathToFileURL(path.join(root, 'src', 'story.js')).href);
}

export const out = path.join(root, 'out');
export const ensureOut = () => fs.mkdirSync(out, {recursive: true});
