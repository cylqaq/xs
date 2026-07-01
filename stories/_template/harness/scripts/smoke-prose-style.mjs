#!/usr/bin/env node
/**
 * prose-style 契约冒烟：门禁 + validate --task prose-style
 */
import { cpSync, existsSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SMOKE_ID = 'stories/_smoke-prose-style';
const smokeAbs = path.join(ROOT, SMOKE_ID);

function runForge(...args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'forge.mjs'), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

function fillProseStyle() {
  writeFileSync(
    path.join(smokeAbs, 'canon/style/prose-profile.yaml'),
    `version: 1
status: ready
genre_profile: xuanhuan
source_seed:
  pov_tone: 第三人称限知，冷峻
  prose_reference: 都市修仙冷硬
  sentence_rhythm: 混合
  emotional_temperature: 冷
mechanics:
  sentence_length: mixed
  paragraph_max_sentences: 5
distance: close
emotional_temperature: tense_heroic
signature_moves:
  - 危机场景短句密集
  - 能力代价绑定身体感受
anti_patterns:
  - 境界名词连读无画面
kill_list:
  - 恐怖如斯
use_framework_crutch_list: true
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'canon/style/voice.md'),
    `# 叙述声音

- POV：第三人称限知
- 时态：过去时
- 距离感（贴近/疏离）：贴近
- 情绪温度：冷峻热血交替
- 句长倾向：混合
- 对话风格：克制，少废话
- 禁忌用语：恐怖如斯

## 签名笔法

- 危机场景短句密集
- 能力代价绑定身体感受

## 反模式

- 境界名词连读无画面
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'canon/style/exemplars/positive.md'),
    `雨砸在霓虹招牌上，林烬没躲。灵气沿经脉爬升时，指甲缝里又渗出血——每次觉醒都要付这一笔，他早就习惯了。
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'canon/style/exemplars/negative.md'),
    `他突破了筑基期，达到了金丹期，然后又达到了元婴期，实力恐怖如斯。
`,
    'utf8'
  );

  writeFileSync(
    path.join(smokeAbs, 'state/checkpoints/prose-style.yaml'),
    `completed: true
profile_version: 1
skill: prose-style-architect
`,
    'utf8'
  );
}

function main() {
  console.log('# Smoke prose-style: readiness gate + validate\n');
  if (existsSync(smokeAbs)) rmSync(smokeAbs, { recursive: true, force: true });
  cpSync(path.join(ROOT, 'stories/_template'), smokeAbs, { recursive: true });

  writeFileSync(
    path.join(smokeAbs, 'state/phase.yaml'),
    `phase: drafting
sub_phase: null
current_chapter: 1
last_completed_chapter: 0
review_round: 0
max_review_rounds: 3
blocked: false
`,
    'utf8'
  );

  let r = runForge('context', SMOKE_ID, '--chapter', '1');
  console.log(r.out);
  if (r.code === 0) {
    console.error('FAIL: context should block when prose style pending');
    process.exit(1);
  }

  r = runForge('sync', 'framework', SMOKE_ID);
  console.log(r.out);

  r = runForge('validate', SMOKE_ID, '--task', 'prose-style');
  console.log(r.out);
  if (r.code === 0) {
    console.error('FAIL: validate prose-style should fail before fill');
    process.exit(1);
  }

  fillProseStyle();

  r = runForge('validate', SMOKE_ID, '--task', 'prose-style');
  console.log(r.out);
  if (r.code !== 0) {
    console.error('FAIL: validate prose-style should PASS after fill');
    process.exit(1);
  }

  r = runForge('workflow', 'validate');
  console.log(r.out);
  if (r.code !== 0) process.exit(1);

  console.log('\n✓ Smoke prose-style PASS');
}

main();
