#!/usr/bin/env node
/**
 * 工作流契约冒烟：manifest ↔ workflow 对齐 + handoff 硬化
 */
import { cpSync, existsSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SMOKE_ID = 'stories/_smoke-workflow';

function runForge(...args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'forge.mjs'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function main() {
  console.log('# Smoke workflow: manifest sync + handoff gates\n');

  let r = runForge('workflow', 'validate');
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: workflow validate');
    process.exit(1);
  }

  const smokeAbs = path.join(ROOT, SMOKE_ID);
  if (existsSync(smokeAbs)) rmSync(smokeAbs, { recursive: true, force: true });
  cpSync(path.join(ROOT, 'stories/_template'), smokeAbs, { recursive: true });

  r = runForge('run', SMOKE_ID, '--workflow', 'creation-chain', '--json');
  if (r.code !== 0) {
    console.log(r.out);
    console.error('FAIL: creation-chain run');
    process.exit(1);
  }

  const plan = JSON.parse(r.out);
  const outlineSkills = plan.steps
    .filter((s) =>
      ['plot-architect', 'foreshadow-engineer', 'hook-manager', 'batch-planner'].includes(s.skill)
    )
    .map((s) => s.skill);
  const expected = ['plot-architect', 'foreshadow-engineer', 'hook-manager', 'batch-planner'];
  for (const sk of expected) {
    if (!outlineSkills.includes(sk)) {
      console.error(`FAIL: creation-chain missing independent step @${sk}`);
      process.exit(1);
    }
  }
  const characterSkills = plan.steps
    .filter((s) =>
      ['character-forge', 'cast-network-weaver', 'persona-voice-binder'].includes(s.skill)
    )
    .map((s) => s.skill);
  for (const sk of ['character-forge', 'cast-network-weaver', 'persona-voice-binder']) {
    if (!characterSkills.includes(sk)) {
      console.error(`FAIL: creation-chain missing character step @${sk}`);
      process.exit(1);
    }
  }
  const proseStep = plan.steps.find((s) => s.skill === 'prose-style-architect');
  if (!proseStep) {
    console.error('FAIL: creation-chain missing @prose-style-architect step');
    process.exit(1);
  }
  console.log('✓ creation-chain 含 prose-style-architect + 人物 3 步 + outline 6 步（含 conflict-architect）');

  r = runForge('handoff', 'complete', SMOKE_ID, '--skill', 'fake-skill', '--workflow', 'creation-chain');
  if (r.code === 0) {
    console.error('FAIL: orphan handoff should be rejected');
    process.exit(1);
  }
  if (!r.out.includes('refuse orphan handoff')) {
    console.error('FAIL: unexpected handoff error:', r.out);
    process.exit(1);
  }
  console.log('✓ orphan handoff rejected');

  console.log('\n✓ Smoke workflow PASS');
}

main();
