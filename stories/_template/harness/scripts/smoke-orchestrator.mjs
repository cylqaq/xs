#!/usr/bin/env node
/**
 * 多智能体调度冒烟：forge next / run / handoff
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SMOKE_ID = 'stories/_smoke-orchestrator';
const smokeAbs = path.join(ROOT, SMOKE_ID);

function runForge(...args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'forge.mjs'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function main() {
  console.log('# Smoke orchestrator: next / run / handoff\n');
  if (existsSync(smokeAbs)) rmSync(smokeAbs, { recursive: true, force: true });
  cpSync(path.join(ROOT, 'stories/_template'), smokeAbs, { recursive: true });

  let r = runForge('next', SMOKE_ID);
  console.log(r.out);
  if (r.code !== 0 && r.code !== 1) process.exit(1);
  if (!r.out.includes('novel-orchestrator')) {
    console.error('FAIL: next should route to novel-orchestrator in ideation');
    process.exit(1);
  }

  mkdirSync(path.join(smokeAbs, 'state/working/handoffs'), { recursive: true });
  writeFileSync(
    path.join(smokeAbs, 'state/working/handoffs/creation-novel-orchestrator.yaml'),
    `skill: novel-orchestrator
status: complete
completed_at: smoke
cli_postflight_passed: []
`,
    'utf8'
  );

  r = runForge('next', SMOKE_ID);
  console.log(r.out);
  if (!r.out.includes('seed-intake')) {
    console.error('FAIL: next should route to seed-intake after orchestrator handoff');
    process.exit(1);
  }

  r = runForge('run', SMOKE_ID, '--workflow', 'creation-chain');
  console.log(r.out.slice(0, 800));
  if (!existsSync(path.join(smokeAbs, 'state/working/run-plan.json'))) {
    console.error('FAIL: run-plan.json not written');
    process.exit(1);
  }

  r = runForge('handoff', 'status', SMOKE_ID);
  console.log(r.out);

  r = runForge('run', SMOKE_ID, '--workflow', 'chapter-cycle', '--chapter', '1', '--json');
  if (r.code !== 0) {
    console.log(r.out);
    console.error('FAIL: chapter-cycle run');
    process.exit(1);
  }

  console.log('\n✓ Smoke orchestrator PASS — 多智能体调度剧本已验证');
}

main();
