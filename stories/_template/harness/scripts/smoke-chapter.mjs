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
  const verbs = ['走', '看', '停', '闻', '推', '握', '抬', '转', '靠', '踏'];
  const objs = ['门', '风', '影', '巷', '石', '灯', '雾', '痕', '墙', '阶'];
  const moods = ['沉', '紧', '缓', '轻', '冷', '暖', '钝', '锐'];
  const echoes = ['短促', '遥远', '含混', '清晰', '断续', '压低', '拖长', '突兀'];
  let s = '';
  let i = 0;
  while (countZh(s) < n) {
    const v = verbs[i % verbs.length];
    const o = objs[(i * 3) % objs.length];
    const m = moods[(i * 5) % moods.length];
    const e = echoes[(i * 7) % echoes.length];
    s += `测试主角${v}过${o}边，${m}缓的气息在${o}上留下不可说的重量。`;
    s += `「你在做什么？」他${i % 2 ? '低声' : '直接'}说道。`;
    s += `${e}的回响从${o}后传来，像旧日未收尽的线头${i + 1}。`;
    i += 1;
  }
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
    path.join(smokeAbs, 'registries/emotional-beats.yaml'),
    `items:
  - id: eb-001
    type: gut_punch
    planned_chapter: 1
    delivered_chapter: 1
    intensity: 3
    summary: 章末悬念中的沉默一击
    linked_conflict: ct-001
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'canon/plot/story-engine.yaml'),
    `throughline:
  statement: 测试主角必须在期限前守住秘密，否则失去唯一庇护
  recurrence_rule: 每章回扣赌注
  anti_diary: 禁止纯日常

position_conflicts:
  - id: pc-001
    title: 冒烟对立
    sides:
      - { id: a, label: 甲, voice: 推进 }
      - { id: b, label: 乙, voice: 抵抗 }
    stakes: 失去庇护
    escalation: []
    linked_arc: arc-main
    status: active

character_tensions:
  - id: ct-001
    pair: [char-protagonist, char-antagonist]
    friction: 逼近 vs 退避
    turn_chapters: [1]
    linked_arc: arc-main
    status: active
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

  const body = fillerChars(1900);
  const ms = `---
chapter: 1
title: 冒烟首章
pov: third-limited
timeline_marker: day-1-morning
---

突然，测试主角冲出房门，却没想到门外站着危险的身影。

清晨在时间地点，主角用行动展示性格，通过选择而非旁白定义自己。门环留下一句视觉细节。小冲突升级，危险步步紧逼。

${body}

章末强悬念断点，他猛然回头，竟没想到命运在此刻逆转。
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
word_count: 2100
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

  writeFileSync(
    path.join(smokeAbs, 'canon/style/prose-profile.yaml'),
    `version: 1
status: ready
genre_profile: general
signature_moves:
  - 动作为主
  - 短句推进
anti_patterns:
  - 空泛抒情
kill_list: []
use_framework_crutch_list: true
`,
    'utf8'
  );
  writeFileSync(
    path.join(smokeAbs, 'canon/style/voice.md'),
    `# 叙述声音

- POV：third-limited（第三人称限知）
- 时态：过去时
- 距离感（贴近/疏离）：贴近
- 情绪温度：中性
- 句长倾向：混合
- 对话风格：直接
- 禁忌用语：
`,
    'utf8'
  );
  writeFileSync(
    path.join(smokeAbs, 'canon/style/exemplars/positive.md'),
    `测试主角推门而出，冷风扑面，他没有任何犹豫。
`,
    'utf8'
  );
  writeFileSync(
    path.join(smokeAbs, 'state/checkpoints/prose-style.yaml'),
    `completed: true
profile_version: 1
`,
    'utf8'
  );
}

function completeChapterHandoffs() {
  const msPath = path.join(smokeAbs, 'manuscripts/chapters/ch-001.md');
  const msBackup = existsSync(msPath) ? readFileSync(msPath, 'utf8') : null;
  if (msBackup) rmSync(msPath);

  // 第十轮：navigator 在首步（不需要手稿；during_write_by_skill: []）
  let rn = runForge(
    'handoff',
    'complete',
    SMOKE_ID,
    '--skill',
    'navigator',
    '--chapter',
    '1',
    '--workflow',
    'chapter-cycle'
  );
  console.log(rn.out);
  if (rn.code !== 0) {
    console.error('FAIL: navigator handoff must succeed without manuscript (during_write_by_skill: [])');
    process.exit(1);
  }

  let r = runForge(
    'handoff',
    'complete',
    SMOKE_ID,
    '--skill',
    'context-router',
    '--chapter',
    '1',
    '--workflow',
    'chapter-cycle'
  );
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: context-router handoff must succeed without manuscript (during_write_by_skill: [])');
    process.exit(1);
  }
  if (msBackup) writeFileSync(msPath, msBackup, 'utf8');

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
