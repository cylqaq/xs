#!/usr/bin/env node
/**
 * 创建链冒烟：复制 _template → bootstrap/outline manifest validate
 */
import { cpSync, existsSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SMOKE_ID = 'stories/_smoke-bootstrap';
const smokeAbs = path.join(ROOT, SMOKE_ID);

function runForge(...args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'forge.mjs'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function main() {
  console.log('# Smoke bootstrap: creation chain artifacts\n');
  if (existsSync(smokeAbs)) rmSync(smokeAbs, { recursive: true, force: true });
  cpSync(path.join(ROOT, 'stories/_template'), smokeAbs, { recursive: true });

  let r = runForge('validate', SMOKE_ID, '--task', 'bootstrap');
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: validate --task bootstrap');
    process.exit(1);
  }

  r = runForge('manifest', 'bootstrap', SMOKE_ID);
  console.log(r.out);
  if (r.code !== 0) process.exit(1);

  const beats = path.join(smokeAbs, 'canon/plot/beats/ch-001.md');
  if (!existsSync(beats)) {
    console.error('FAIL: missing canon/plot/beats/ch-001.md in template');
    process.exit(1);
  }

  r = runForge('validate', SMOKE_ID, '--task', 'outline-batch', '--chapter', '1');
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: validate --task outline-batch');
    process.exit(1);
  }

  r = runForge('manifest', 'outline-batch', SMOKE_ID, '--chapter', '1');
  console.log(r.out);
  if (r.code !== 0) process.exit(1);

  console.log('\n✓ Smoke bootstrap PASS — 创建链工件与 manifest 契约已验证');
}

main();
