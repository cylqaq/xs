#!/usr/bin/env node
/**
 * seed-intake 门禁冒烟：未收齐 seed 时 check/phase 拒绝；收齐后放行
 */
import { cpSync, existsSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SMOKE_ID = 'stories/_smoke-intake';
const smokeAbs = path.join(ROOT, SMOKE_ID);

function runForge(...args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'forge.mjs'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function fillSeed() {
  writeFileSync(
    path.join(smokeAbs, 'seed/author-intent.md'),
    `# 作者意图

## 核心幻想（一句话）

一位失忆剑修在都市中寻找前世因果，每次觉醒都会引来追杀，他必须在凡俗与修行之间做出选择。

## 体裁与参考

都市修仙
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'seed/layer1-core.yaml'),
    `genre: 都市修仙
protagonist: 失忆剑修林烬，欲望是找回记忆，弱点是每次觉醒会失去一段现世羁绊
core_conflict: 林烬想平静生活 vs 追杀者逼他觉醒前世杀孽
completed: true
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'seed/layer2-customize.yaml'),
    `world_direction: 现代都市与隐世宗门并存，灵气复苏后期
pov_tone: 第三人称限知，冷峻带黑色幽默
theme: 记忆与身份
audience: 男频玄幻读者
target_chapters: 80
prose_reference: 都市冷硬修仙，偏 noir
sentence_rhythm: 混合
emotional_temperature: 冷峻
hard_bans: 玛丽苏，说明文腔
completed: true
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'seed/layer3-title.md'),
    `# 烬城剑录
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'novel.yaml'),
    `id: smoke-intake
title: 烬城剑录
genre: xuanhuan
language: zh-CN
pov: third-limited
current_chapter: 0
last_completed_chapter: 0
status: ideation
target_chapters: 80
`,
    'utf8'
  );
}

function main() {
  console.log('# Smoke intake: seed gate\n');
  if (existsSync(smokeAbs)) rmSync(smokeAbs, { recursive: true, force: true });
  cpSync(path.join(ROOT, 'stories/_template'), smokeAbs, { recursive: true });

  let r = runForge('intake', 'check', SMOKE_ID);
  console.log(r.out);
  if (r.code === 0) {
    console.error('FAIL: intake check should reject empty template');
    process.exit(1);
  }

  r = runForge('phase', 'set', SMOKE_ID, '--field', 'phase', '--value', 'worldbuilding');
  console.log(r.out);
  if (r.code === 0) {
    console.error('FAIL: phase set should reject before intake ready');
    process.exit(1);
  }

  r = runForge('intake', 'questions', SMOKE_ID);
  console.log(r.out);
  if (r.code !== 0) process.exit(1);

  fillSeed();

  r = runForge('intake', 'check', SMOKE_ID);
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: intake check should PASS after fill');
    process.exit(1);
  }

  r = runForge('phase', 'set', SMOKE_ID, '--field', 'phase', '--value', 'worldbuilding');
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: phase set should PASS after intake ready');
    process.exit(1);
  }

  r = runForge('context', SMOKE_ID, '--chapter', '1');
  console.log(r.out);
  if (r.code === 0) {
    console.error('FAIL: context should block in worldbuilding');
    process.exit(1);
  }

  console.log('\n✓ Smoke intake PASS — seed 门禁与多轮问答入口已验证');
}

main();
