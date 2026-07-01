#!/usr/bin/env node
/**
 * 卷级 revision 冒烟：首章闭环后 revision-volume manifest + checkpoint
 */
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CHAPTER_SMOKE = 'stories/_smoke-chapter';

function runForge(...args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'forge.mjs'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function runNode(script) {
  const r = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function main() {
  console.log('# Smoke revision: revision-volume manifest\n');

  if (!existsSync(path.join(ROOT, CHAPTER_SMOKE, 'state/phase.yaml'))) {
    const prep = runNode('smoke-chapter.mjs');
    console.log(prep.out);
    if (prep.code !== 0) {
      console.error('FAIL: prerequisite smoke-chapter');
      process.exit(1);
    }
  }

  let r = runForge('manifest', 'revision-volume', CHAPTER_SMOKE, '--chapter', '1');
  console.log(r.out);
  if (r.code !== 0) process.exit(1);

  r = runForge('validate', CHAPTER_SMOKE, '--task', 'revision-volume', '--chapter', '1');
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: validate --task revision-volume');
    process.exit(1);
  }

  const ck = path.join(ROOT, CHAPTER_SMOKE, 'state/checkpoints/revision-vol-01.yaml');
  const ckEx = path.join(ROOT, CHAPTER_SMOKE, 'state/checkpoints/revision-vol-01.yaml.example');
  if (!existsSync(ck) && !existsSync(ckEx)) {
    console.error('FAIL: missing revision checkpoint file');
    process.exit(1);
  }

  console.log('\n✓ Smoke revision PASS — revision-volume manifest 与 checkpoint 已验证');
}

main();
