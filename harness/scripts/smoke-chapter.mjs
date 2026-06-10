#!/usr/bin/env node
/**
 * 无 LLM 首章闭环冒烟：handoff 全链 → review（postflight）→ phase advance
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SMOKE_ID = 'stories/_smoke-chapter';
const smokeAbs = path.join(ROOT, SMOKE_ID);

function runForge(...args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'forge.mjs'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function countZh(s) {
  return (s.match(/[\u4e00-\u9fff]/g) || []).length;
}

function fillerChars(n) {
  const base =
    '清晨在时间地点之中，测试主角用行动展示性格，通过选择而非旁白定义自己。' +
    '突然，他冲出房门，却见危险逼近，小冲突升级。埋设 fs-001 视觉细节一句即可。' +
    '章末 hk-001 强悬念断点。他猛然回头，竟没想到命运在此刻逆转。' +
    '「你在做什么？」他说道。神秘的气息弥漫，鲜血与破碎的幻象交织。突破在即，众人目瞪口呆。';
  let s = '';
  while (countZh(s) < n) s += base;
  return s;
}

function setup() {
  if (existsSync(smokeAbs)) rmSync(smokeAbs, { recursive: true, force: true });
  cpSync(path.join(ROOT, 'stories/_template'), smokeAbs, { recursive: true });

  writeFileSync(
    path.join(smokeAbs, 'novel.yaml'),
    `id: smoke-chapter
title: 冒烟测试
genre: general
language: zh-CN
pov: third-limited
current_chapter: 1
last_completed_chapter: 0
status: drafting
target_chapters: 10
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'state/phase.yaml'),
    `phase: drafting
sub_phase: chapter-draft
current_chapter: 1
last_completed_chapter: 0
review_round: 0
max_review_rounds: 3
blocked: false
block_reason: null
`,
    'utf8'
  );

  const beatsSrc = path.join(smokeAbs, 'canon/plot/beats/ch-001.md');
  const beatsEx = path.join(smokeAbs, 'canon/plot/beats/ch-001.example.md');
  if (!existsSync(beatsSrc) && existsSync(beatsEx)) {
    writeFileSync(beatsSrc, readFileSync(beatsEx, 'utf8'), 'utf8');
  }

  writeFileSync(
    path.join(smokeAbs, 'registries/cool-points.yaml'),
    `items:
  - id: cp-001
    type: reveal
    planned_chapter: 1
    delivered_chapter: 1
    intensity: 3
    summary: 章内小高潮
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'canon/characters/index.yaml'),
    `characters:
  - id: char-protagonist
    name: 测试主角
    file: canon/characters/char-protagonist.md
    role: protagonist
    status: active
    last_seen_chapter: 0
    appear_in: [1]
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'canon/characters/char-protagonist.md'),
    `# 测试主角

## 说话风格
短句，直接。
`,
    'utf8'
  );

  const body = fillerChars(3100);
  const ms = `---
chapter: 1
title: 冒烟首章
pov: third-limited
timeline_marker: day-1-morning
---

突然，测试主角冲出房门，却没想到门外站着危险的身影。

${body}
`;
  mkdirSync(path.join(smokeAbs, 'manuscripts/chapters'), { recursive: true });
  mkdirSync(path.join(smokeAbs, 'state/memory/chapter-summaries'), { recursive: true });
  mkdirSync(path.join(smokeAbs, 'state/retention'), { recursive: true });
  writeFileSync(path.join(smokeAbs, 'manuscripts/chapters/ch-001.md'), ms, 'utf8');

  writeFileSync(
    path.join(smokeAbs, 'state/memory/chapter-summaries/ch-001.yaml'),
    `chapter: 1
title: 冒烟首章
pov: third-limited
timeline_marker: day-1-morning
locations: []
characters_present:
  - 测试主角
character_deltas: []
events:
  - 主角遭遇异常
foreshadowing_touched: []
hooks_opened: []
hooks_closed: []
new_entities: []
continuity_flags: []
word_count: 3100
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'state/retention/ch-001.yaml'),
    `chapter: 1
opening_hook_score: 7
cool_point_count: 1
micro_payoffs_delivered: []
debt_ratio: 0.0
alerts: []
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'registries/continuity-log.yaml'),
    `entries:
  - chapter: 1
    at: smoke
    note: smoke test setup
`,
    'utf8'
  );
}

function completeChapterHandoffs() {
  const chain = [
    'context-router',
    'chapter-production',
    'continuity-warden',
    'persona-evolution-warden',
    'retention-analyst',
    'rule-reviewer',
  ];
  for (const skill of chain) {
    const r = runForge(
      'handoff',
      'complete',
      SMOKE_ID,
      '--skill',
      skill,
      '--chapter',
      '1',
      '--workflow',
      'chapter-cycle'
    );
    console.log(r.out);
    if (r.code !== 0) {
      console.error(`FAIL: handoff complete @${skill}`);
      process.exit(1);
    }
  }
}

function main() {
  console.log('# Smoke: first-chapter closed loop (handoff chain)\n');
  setup();

  let r = runForge('manifest', 'chapter-draft', SMOKE_ID, '--chapter', '1');
  console.log(r.out);
  if (r.code !== 0) process.exit(1);

  r = runForge('context', SMOKE_ID, '--chapter', '1');
  console.log(r.out);

  r = runForge('phase', 'advance', SMOKE_ID, '--chapter', '1');
  if (r.code === 0) {
    console.error('FAIL: phase advance should reject without handoffs');
    process.exit(1);
  }
  console.log('✓ phase advance blocked without handoffs');

  completeChapterHandoffs();

  r = runForge('phase', 'advance', SMOKE_ID, '--chapter', '1', '--ack-session-collect');
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: phase advance after handoff chain');
    process.exit(1);
  }

  const advanceHandoff = path.join(smokeAbs, 'state/working/handoffs/ch-001-novel-orchestrator.yaml');
  if (!existsSync(advanceHandoff)) {
    console.error('FAIL: missing ch-001-novel-orchestrator.yaml after phase advance');
    process.exit(1);
  }
  console.log('✓ novel-orchestrator advance handoff present');

  console.log('\n✓ Smoke PASS — 首章闭环（handoff + review + advance handoff）已验证');
}

main();
