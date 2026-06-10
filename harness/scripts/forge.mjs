#!/usr/bin/env node
/**
 * Novel Forge CLI
 *   forge manifest | validate | compact | review | context | context-index | phase
 */
import fs from 'fs';
import path from 'path';
import {
  ROOT,
  padChapter,
  loadText,
  loadTextSafe,
  parseYamlScalar,
  setYamlField,
  loadPhaseState,
  syncNovelFromPhase,
  getLastCompleted,
  resolveManifest,
  collectCharacterNames,
  pushActionItem,
  countChineseChars,
  parseSummaryYaml,
  loadGraph,
  beatsCharRefs,
  validateTimelineMaster,
  validateEntityGraph,
  validateCharacterHeat,
  scanIllegalBytes,
  validateRegistryConsistency,
  validateContinuityArtifacts,
  checkPhaseNovelSync,
  reviewCharacterConsistency,
  reviewPersonaVoice,
  reviewTimelineOrder,
  reviewDialogueQuality,
  reviewBeatsCoverage,
  reviewCoolPointDensity,
  updateReviewRound,
  writeContextRegistrySnapshots,
  collectAppearInCharacterFiles,
  validatePhaseAllowsAdvance,
  appendForceAdvanceAudit,
  validateRevisionTriples,
  validateSummaryRollingPlaceholder,
  validateTaskBootstrap,
  validateTaskWorldbuilding,
  validateTaskCharacters,
  validateTaskCastNetwork,
  validateTaskPersonaVoice,
  validateTaskOutlineBatch,
  validateTaskRebuild,
  validateTaskRevisionVolume,
  validateSeedReadiness,
  assessSeedIntake,
  nextIntakeQuestions,
  gateLeaveIdeation,
  gateDraftingEntry,
  loadReviewConfig,
} from './forge-lib.mjs';
import {
  WORKFLOW_NAMES,
  resolveNextStep,
  compileRunPlan,
  completeHandoff,
  formatNextPlan,
  readHandoff,
  loadWorkflow,
  validateChapterWorkflowHandoffs,
  validateWorkflowManifestSync,
} from './orchestrator-lib.mjs';

const MANIFEST_TASKS = [
  'bootstrap',
  'worldbuilding',
  'characters',
  'outline-batch',
  'chapter-draft',
  'post-chapter',
  'revision-volume',
  'rebuild-canon',
];

function cmdManifest(args) {
  const task = args[0];
  const novelRoot = args[1];
  let chapter = null;
  const chIdx = args.indexOf('--chapter');
  if (chIdx !== -1) chapter = parseInt(args[chIdx + 1], 10);

  if (!task || !novelRoot) {
    console.log('Usage: forge manifest <task> <stories/novel-id> [--chapter N]');
    console.log(`Tasks: ${MANIFEST_TASKS.join(' | ')}`);
    process.exit(1);
  }

  let resolved;
  try {
    resolved = resolveManifest(task, novelRoot, chapter);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const { sections, chapter: ch } = resolved;
  console.log(`# Manifest: ${task} | chapter ${ch ?? 'n/a'}\n`);
  if (sections.skills.length) {
    console.log('## SKILLS (orchestrator routes)');
    sections.skills.forEach((s) => console.log(`→ ${s}`));
    console.log('');
  }
  console.log('## BEFORE (must read)');
  for (const f of sections.before) {
    console.log(`${fs.existsSync(f) ? '✓' : '✗'} ${f}`);
  }
  console.log('\n## OPTIONAL');
  for (const f of sections.optional) {
    console.log(`${fs.existsSync(f) ? '✓' : '○'} ${f}`);
  }
  console.log('\n## DURING (write)');
  for (const f of sections.during) console.log(`→ ${f}`);
  console.log('\n## AFTER (must update)');
  for (const f of sections.after) console.log(`→ ${f}`);
  console.log('\n## Validators:', sections.validators.join(', ') || '(none)');
}

function runManifestValidators(
  novelAbs,
  validatorNames,
  lastCompleted,
  errors,
  warnings,
  ran = new Set(),
  strict = false
) {
  for (const name of validatorNames) {
    if (ran.has(name)) continue;
    ran.add(name);
    if (name === 'continuity') validateContinuityArtifacts(novelAbs, lastCompleted, errors, warnings);
    if (name === 'registry-consistency') validateRegistryConsistency(novelAbs, lastCompleted, errors, warnings);
    if (name === 'structure') {
      if (!fs.existsSync(path.join(novelAbs, 'novel.yaml'))) errors.push('missing novel.yaml');
      if (!fs.existsSync(path.join(novelAbs, 'state/phase.yaml'))) errors.push('missing state/phase.yaml');
    }
    if (name === 'seed-readiness') validateSeedReadiness(novelAbs, errors, warnings, strict);
  }
  return ran;
}

function cmdValidate(args) {
  const novelRoot = args[0];
  if (!novelRoot) {
    console.log('Usage: forge validate <stories/novel-id> [--strict] [--task TASK] [--chapter N]');
    console.log(`Tasks: ${MANIFEST_TASKS.join(' | ')} | (omit for full validate)`);
    process.exit(1);
  }

  const strict = args.includes('--strict');
  let task = null;
  const taskIdx = args.indexOf('--task');
  if (taskIdx !== -1) task = args[taskIdx + 1];
  let taskChapter = 1;
  const chIdx = args.indexOf('--chapter');
  if (chIdx !== -1) taskChapter = parseInt(args[chIdx + 1], 10);

  const novelAbs = path.resolve(ROOT, novelRoot);
  const errors = [];
  const warnings = [];
  const ran = new Set();

  const phaseState = checkPhaseNovelSync(novelAbs, warnings, errors, strict);
  const lastCompleted = phaseState.last_completed_chapter;

  if (task) {
    console.log(`# Validate task: ${task} | ${novelRoot}\n`);
    try {
      const { sections } = resolveManifest(task, novelRoot, taskChapter);
      runManifestValidators(novelAbs, sections.validators, lastCompleted, errors, warnings, ran, strict);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    if (task === 'bootstrap') {
      validateTaskBootstrap(novelAbs, errors, warnings);
      if (strict) validateSeedReadiness(novelAbs, errors, warnings, true);
    }
    if (task === 'worldbuilding') validateTaskWorldbuilding(novelAbs, errors);
    if (task === 'characters') validateTaskCharacters(novelAbs, errors);
    if (task === 'cast-network') validateTaskCastNetwork(novelAbs, errors, warnings);
    if (task === 'persona-voice') validateTaskPersonaVoice(novelAbs, errors, warnings);
    if (task === 'outline-batch') validateTaskOutlineBatch(novelAbs, taskChapter, errors);
    if (task === 'rebuild-canon') validateTaskRebuild(novelAbs, errors);
    if (task === 'revision-volume') validateTaskRevisionVolume(novelAbs, taskChapter, errors, warnings);
  } else {
    if (!fs.existsSync(path.join(novelAbs, 'novel.yaml'))) errors.push('missing novel.yaml');
    if (!fs.existsSync(path.join(novelAbs, 'state/phase.yaml'))) errors.push('missing state/phase.yaml');
    if (!fs.existsSync(path.join(novelAbs, 'state/memory/summary-rolling.md')))
      warnings.push('missing summary-rolling.md');
    if (phaseState.blocked) warnings.push(`phase blocked: ${phaseState.block_reason || 'unknown'}`);

    for (let ch = 1; ch <= lastCompleted; ch++) {
      const padded = padChapter(ch);
      if (!fs.existsSync(path.join(novelAbs, `manuscripts/chapters/ch-${padded}.md`)))
        errors.push(`missing manuscript ch-${padded}`);
    }

    const fsContent = loadText(path.join(novelAbs, 'registries/foreshadowing.yaml'));
    if (fsContent) {
      const bad = [...fsContent.matchAll(/status:\s*resolved[\s\S]*?payoff_chapter:\s*null/g)].length;
      if (bad) errors.push(`${bad} resolved foreshadowing without payoff_chapter`);
      const planned = [...fsContent.matchAll(/status:\s*planned/g)].length;
      const planted = [...fsContent.matchAll(/status:\s*planted/g)].length;
      if (lastCompleted > 20 && planned > planted * 2)
        warnings.push(`foreshadowing planned backlog high: ${planned} planned vs ${planted} planted`);
    }

    const hooksContent = loadText(path.join(novelAbs, 'registries/hooks.yaml'));
    if (hooksContent && lastCompleted > 5) {
      const openHooks = (hooksContent.match(/status:\s*open/g) || []).length;
      if (openHooks > 15) warnings.push(`${openHooks} open hooks`);
    }

    validateTimelineMaster(novelAbs, warnings, errors);
    validateEntityGraph(novelAbs, warnings);
    validateCharacterHeat(novelAbs, lastCompleted, warnings);
    scanIllegalBytes(novelAbs, lastCompleted, errors);
    runManifestValidators(
      novelAbs,
      ['registry-consistency', 'continuity'],
      lastCompleted,
      errors,
      warnings,
      ran,
      strict
    );
    validateSummaryRollingPlaceholder(novelAbs, lastCompleted, warnings, errors, strict);
  }

  console.log(task ? '' : `# Validate: ${novelRoot} (last_completed=${lastCompleted})\n`);
  if (!errors.length && !warnings.length) console.log('OK');
  for (const e of errors) console.log(`ERROR: ${e}`);
  for (const w of warnings) console.log(`WARN: ${w}`);
  process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
}

function cmdCompact(args) {
  const novelRoot = args[0];
  if (!novelRoot) {
    console.log('Usage: forge compact <stories/novel-id>');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  const { authoritative: lastCompleted } = getLastCompleted(novelAbs);
  const premise = loadText(path.join(novelAbs, 'canon/background/premise.md')) || '';
  const premiseShort = premise.replace(/#+\s/g, '').trim().slice(0, 200);

  const summaries = [];
  for (let ch = Math.max(1, lastCompleted - 2); ch <= lastCompleted; ch++) {
    const p = path.join(novelAbs, `state/memory/chapter-summaries/ch-${padChapter(ch)}.yaml`);
    const t = loadText(p);
    if (t) summaries.push({ ch, ...parseSummaryYaml(t) });
  }

  const fsContent = loadText(path.join(novelAbs, 'registries/foreshadowing.yaml')) || '';
  const openFs = [...fsContent.matchAll(/id:\s*(\S+)[\s\S]*?status:\s*(planned|planted|hinted)/g)]
    .map((m) => m[1])
    .slice(0, 10);

  const out = `# 滚动摘要

> 由 \`forge compact\` 生成于 ${new Date().toISOString().slice(0, 10)}。章后请 continuity-warden 润色。

## 全书前提

${premiseShort || '（待填写 premise）'}

## 主线进展

（根据近章摘要合并 — 请 continuity-warden 补全）

## 活跃故事弧

见 canon/plot/arcs.yaml

## 近章摘要

${summaries.length ? summaries.map((s) => `### 第 ${s.ch} 章${s.title ? `：${s.title}` : ''}\n${s.events.slice(0, 3).join('；') || '（无 events）'}`).join('\n\n') : '（尚无章节）'}

## 开放登记

- 伏笔 open: ${openFs.join(', ') || '无'}
- 钩子: 见 registries/hooks.yaml
- 情节债务: 见 registries/plot-debt.yaml
`;

  const outPath = path.join(novelAbs, 'state/memory/summary-rolling.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`Wrote ${outPath}`);
}

function cmdReview(args) {
  const novelRoot = args[0];
  let chapter = null;
  const chIdx = args.indexOf('--chapter');
  if (chIdx !== -1) chapter = parseInt(args[chIdx + 1], 10);

  if (!novelRoot || chapter == null) {
    console.log('Usage: forge review <stories/novel-id> --chapter N');
    process.exit(1);
  }

  const novelAbs = path.resolve(ROOT, novelRoot);
  const draftBlock = [];
  gateDraftingEntry(novelAbs, draftBlock);
  if (draftBlock.length) {
    console.error(draftBlock[0]);
    process.exit(1);
  }

  const phaseBefore = loadPhaseState(novelAbs);
  if (phaseBefore.blocked) {
    console.error(`Blocked: ${phaseBefore.block_reason}`);
    process.exit(1);
  }

  const padded = padChapter(chapter);
  const msPath = path.join(novelAbs, `manuscripts/chapters/ch-${padded}.md`);
  const text = loadTextSafe(msPath);
  const results = {
    chapter,
    pass: true,
    review_round: phaseBefore.review_round,
    dimensions: [],
    action_items: [],
  };

  if (!text) {
    results.pass = false;
    results.dimensions.push({ id: 'manuscript', pass: false, msg: 'missing manuscript' });
    pushActionItem(results, {
      dimension: 'manuscript',
      delegate_skill: 'chapter-production',
      message: '手稿缺失',
      hint: '先完成 chapter-production 写入 manuscripts/chapters',
    });
  } else {
    const reviewCfg = loadReviewConfig();
    if (chapter <= reviewCfg.openingHookMaxChapter) {
      const body = text.replace(/^---[\s\S]*?---\n?/, '');
      const firstPara = body.split(/\n\n/)[0] || '';
      const hookWords = /突然|却|竟|没想到|危险|死|血|神秘|破碎|逆转|奔|闯|醒/;
      const pass = firstPara.length >= 20 && firstPara.length <= 800 && hookWords.test(firstPara);
      results.dimensions.push({ id: 'opening_hook', pass, msg: pass ? 'ok' : '首段需动作/异常且长度适中' });
      if (!pass) {
        pushActionItem(results, {
          dimension: 'opening_hook',
          delegate_skill: 'patch-refiner',
          severity: chapter <= reviewCfg.openingHookMaxChapter ? 'error' : 'warn',
          message: '章首钩子不足',
          hint: '第一句用动作或异常，避免纯环境描写',
        });
      }
    }

    reviewCharacterConsistency(novelAbs, chapter, text, results);
    reviewPersonaVoice(novelAbs, chapter, text, results);
    reviewTimelineOrder(novelAbs, chapter, text, results);
    reviewDialogueQuality(novelAbs, chapter, text, results);
    reviewBeatsCoverage(novelAbs, chapter, text, results);

    const planPath = path.join(novelAbs, 'state/writing-plan.json');
    let minWords = loadReviewConfig().defaultMinWordsPerChapter;
    if (fs.existsSync(planPath)) {
      try {
        const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
        if (plan.minWordsPerChapter) minWords = plan.minWordsPerChapter;
      } catch (_) {}
    }
    const wc = countChineseChars(text);
    const wcPass = wc >= minWords;
    results.dimensions.push({ id: 'wordcount', pass: wcPass, msg: `${wc}/${minWords} 汉字` });
    if (!wcPass) {
      pushActionItem(results, {
        dimension: 'wordcount',
        delegate_skill: 'chapter-expander',
        message: `章字数不足（${wc}/${minWords}）`,
        hint: '扩写感官与对话节拍，不新增剧情与角色',
      });
    }

    reviewCoolPointDensity(novelAbs, chapter, text, results);

    const povFm = text.match(/^pov:\s*(.+)$/m)?.[1]?.trim();
    const voicePov = loadText(path.join(novelAbs, 'canon/style/voice.md'));
    const expected = voicePov?.match(/^-?\s*POV[：:][ \t]*([^\n\r]*)/m)?.[1]?.trim();
    if (povFm && expected && expected.length > 1 && !povFm.includes(expected.slice(0, 4))) {
      results.dimensions.push({ id: 'pov_consistency', pass: false, msg: 'pov mismatch' });
      pushActionItem(results, {
        dimension: 'pov_consistency',
        delegate_skill: 'patch-refiner',
        message: 'POV 与 voice.md 不一致',
        hint: '对齐 frontmatter pov 与 canon/style/voice.md',
      });
    } else {
      results.dimensions.push({ id: 'pov_consistency', pass: true, msg: 'ok' });
    }

    const forbidden = voicePov?.match(/禁忌[用语：:]*\s*\n([\s\S]*?)(?:\n#|$)/)?.[1] || '';
    const terms = forbidden.split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean);
    const hitTerm = terms.find((t) => t && text.includes(t));
    if (hitTerm) {
      results.dimensions.push({ id: 'forbidden_terms', pass: false, msg: hitTerm });
      pushActionItem(results, {
        dimension: 'forbidden_terms',
        delegate_skill: 'patch-refiner',
        message: `含禁忌用语：${hitTerm}`,
        hint: '删除或替换 voice.md 禁忌列表中的用语',
      });
    } else {
      results.dimensions.push({ id: 'forbidden_terms', pass: true, msg: 'ok' });
    }
  }

  const fsContent = loadText(path.join(novelAbs, 'registries/foreshadowing.yaml')) || '';
  const overdue = [...fsContent.matchAll(/plant_chapter:\s*(\d+)[\s\S]*?status:\s*planned/g)]
    .filter((m) => parseInt(m[1], 10) < chapter).length;
  results.dimensions.push({ id: 'foreshadow_debt', pass: overdue === 0, msg: `overdue_planned=${overdue}` });
  if (overdue) {
    pushActionItem(results, {
      dimension: 'foreshadow_debt',
      delegate_skill: 'chapter-production',
      message: '有超期未埋设的 planned 伏笔',
      hint: '在本章 plant 或更新 foreshadowing.yaml 延期',
    });
  }

  const mp = loadText(path.join(novelAbs, 'registries/micro-payoffs.yaml')) || '';
  const overdueMp = (mp.match(/status:\s*overdue/g) || []).length;
  results.dimensions.push({ id: 'micro_payoff', pass: overdueMp === 0, msg: `overdue=${overdueMp}` });
  if (overdueMp) {
    pushActionItem(results, {
      dimension: 'micro_payoff',
      delegate_skill: 'patch-refiner',
      message: '存在 overdue 微兑现',
      hint: '兑现或更新 registries/micro-payoffs.yaml',
    });
  }

  results.pass = results.dimensions.every((d) => d.pass);
  updateReviewRound(novelAbs, results.pass);
  results.review_round = loadPhaseState(novelAbs).review_round;

  const reviewDir = path.join(novelAbs, 'state/reviews');
  fs.mkdirSync(reviewDir, { recursive: true });
  const outFile = path.join(reviewDir, `ch-${padded}.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');

  console.log(`# Review ch-${padded}: ${results.pass ? 'PASS' : 'FAIL'} (round ${results.review_round})\n`);
  for (const d of results.dimensions) console.log(`${d.pass ? '✓' : '✗'} ${d.id}: ${d.msg}`);
  if (results.action_items.length) {
    console.log('\nAction items:');
    for (const a of results.action_items) {
      console.log(`- [${a.delegate_skill}] ${a.message}${a.hint ? ` — ${a.hint}` : ''}`);
    }
  }
  if (!results.pass && loadPhaseState(novelAbs).blocked) {
    console.log('\n⚠ phase.yaml blocked — 交 novel-orchestrator 或人工');
  }
  console.log(`\nWrote ${outFile}`);
  process.exit(results.pass ? 0 : 1);
}

function addContextFile(novelAbs, files, relOrAbs) {
  const p = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(novelAbs, relOrAbs);
  if (fs.existsSync(p)) files.add(p.replace(/\\/g, '/'));
}

function parseNovelAndChapter(args) {
  const novelRoot = args[0];
  let chapter = null;
  const chIdx = args.indexOf('--chapter');
  if (chIdx !== -1) chapter = parseInt(args[chIdx + 1], 10);
  return { novelRoot, chapter };
}

function cmdNext(args) {
  const { novelRoot, chapter } = parseNovelAndChapter(args);
  const asJson = args.includes('--json');
  if (!novelRoot) {
    console.log('Usage: forge next <stories/novel-id> [--chapter N] [--json]');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  const plan = resolveNextStep(novelAbs, novelRoot, chapter);
  if (asJson) console.log(JSON.stringify(plan, null, 2));
  else console.log(formatNextPlan(plan));
}

function cmdRun(args) {
  const { novelRoot, chapter } = parseNovelAndChapter(args);
  const asJson = args.includes('--json');
  let workflow = 'auto';
  const wIdx = args.indexOf('--workflow');
  if (wIdx !== -1) workflow = args[wIdx + 1];
  if (!novelRoot) {
    console.log(`Usage: forge run <stories/novel-id> [--workflow ${WORKFLOW_NAMES.join('|')}|auto] [--chapter N] [--json]`);
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  let plan;
  try {
    plan = compileRunPlan(novelAbs, novelRoot, workflow, chapter);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const outPath = path.join(novelAbs, 'state/working/run-plan.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(plan, null, 2), 'utf8');
  if (asJson) console.log(JSON.stringify(plan, null, 2));
  else {
    console.log(`# Forge Run | ${novelRoot}\n`);
    console.log(`workflow: ${plan.workflow} — ${plan.description}`);
    console.log(`phase: ${plan.phase} | chapter: ${plan.chapter}`);
    console.log(`\n## 当前步骤 (@${plan.current_step.skill_focus})\n`);
    console.log(formatNextPlan(plan.current_step));
    console.log('\n## 全流程步骤\n');
    for (const s of plan.steps) {
      const mark = s.status === 'complete' ? '✓' : s.status === 'ready' ? '→' : '○';
      console.log(`${mark} ${s.index}. @${s.skill}${s.also_skills?.length ? ` + ${s.also_skills.join(', ')}` : ''} [${s.status}]`);
    }
    console.log(`\nWrote ${outPath.replace(/\\/g, '/')}`);
  }
}

function cmdWorkflow(args) {
  const sub = args[0];
  if (sub === 'validate') {
    const result = validateWorkflowManifestSync();
    if (result.ok) {
      console.log(`✓ All ${WORKFLOW_NAMES.length} workflows aligned with manifests`);
      return;
    }
    console.error('# Workflow ↔ manifest drift\n');
    result.errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }
  console.log('Usage: forge workflow validate');
  process.exit(1);
}

function cmdHandoff(args) {
  const sub = args[0];
  if (sub === 'complete') {
    const novelRoot = args[1];
    const sIdx = args.indexOf('--skill');
    const skill = sIdx !== -1 ? args[sIdx + 1] : null;
    const chIdx = args.indexOf('--chapter');
    const chapter = chIdx !== -1 ? parseInt(args[chIdx + 1], 10) : 0;
    const wIdx = args.indexOf('--workflow');
    const workflow = wIdx !== -1 ? args[wIdx + 1] : 'auto';
    const nIdx = args.indexOf('--notes');
    const notes = nIdx !== -1 ? args[nIdx + 1] : '';
    if (!novelRoot || !skill) {
      console.log('Usage: forge handoff complete <stories/novel-id> --skill SKILL [--chapter N] [--workflow NAME] [--notes text]');
      process.exit(1);
    }
    const novelAbs = path.resolve(ROOT, novelRoot);
    const result = completeHandoff(novelAbs, novelRoot, { skill, chapter, workflow, notes });
    if (!result.ok) {
      console.error(`Handoff rejected: ${result.error}`);
      process.exit(1);
    }
    console.log(`✓ Handoff @${skill} → ${result.path.replace(/\\/g, '/')}`);
    if (result.next_skill) console.log(`  next: @${result.next_skill}`);
    console.log(`  run: pnpm forge next ${novelRoot}${chapter ? ` --chapter ${chapter}` : ''}`);
    return;
  }

  if (sub === 'status') {
    const novelRoot = args[1];
    if (!novelRoot) {
      console.log('Usage: forge handoff status <stories/novel-id>');
      process.exit(1);
    }
    const novelAbs = path.resolve(ROOT, novelRoot);
    const dir = path.join(novelAbs, 'state/working/handoffs');
    console.log(`# Handoffs | ${novelRoot}\n`);
    if (!fs.existsSync(dir)) {
      console.log('(none)');
      return;
    }
    for (const f of fs.readdirSync(dir).sort()) {
      if (!f.endsWith('.yaml')) continue;
      const t = loadText(path.join(dir, f));
      const skill = t?.match(/^skill:\s*(.+)$/m)?.[1];
      const status = t?.match(/^status:\s*(.+)$/m)?.[1];
      const at = t?.match(/^completed_at:\s*(.+)$/m)?.[1];
      console.log(`${status === 'complete' ? '✓' : '○'} ${f} @${skill} ${at || ''}`);
    }
    return;
  }

  console.log(`Usage:
  forge handoff complete <stories/novel-id> --skill SKILL [--chapter N] [--workflow NAME]
  forge handoff status <stories/novel-id>`);
  process.exit(1);
}

function cmdIntake(args) {
  const sub = args[0];
  const novelRoot = args[1];
  if (!sub || !novelRoot) {
    console.log(`Usage:
  forge intake status <stories/novel-id>     Sync + show intake progress
  forge intake questions <stories/novel-id>  Next ≤3 questions (seed-intake)
  forge intake check <stories/novel-id>      Exit 0 only when readiness=ready`);
    process.exit(1);
  }

  const novelAbs = path.resolve(ROOT, novelRoot);
  if (sub === 'status') {
    const { ready, gaps, layers, currentLayer } = assessSeedIntake(novelAbs, true);
    console.log(`# Intake: ${novelRoot}\n`);
    console.log(`readiness: ${ready ? 'ready' : 'collecting'} | current_layer: ${currentLayer || 'done'}`);
    for (const [k, v] of Object.entries(layers)) console.log(`  ${k}: ${v}`);
    if (gaps.length) {
      console.log('\nGaps:');
      gaps.forEach((g) => console.log(`- ${g}`));
    } else console.log('\nOK — 可交接 novel-bootstrap');
    process.exit(ready ? 0 : 1);
  }

  if (sub === 'questions') {
    assessSeedIntake(novelAbs, true);
    const qs = nextIntakeQuestions(novelAbs, 3);
    console.log(`# Intake questions (≤3) | ${novelRoot}\n`);
    if (!qs.length) {
      console.log('（无待问项 — 运行 forge intake check）');
      process.exit(0);
    }
    qs.forEach((q, i) => console.log(`${i + 1}. [${q.layer}/${q.field}] ${q.prompt}`));
    console.log('\n答后写入 seed/*.yaml 并设 completed: true，再运行 forge intake status');
    process.exit(0);
  }

  if (sub === 'check') {
    const errors = [];
    const warnings = [];
    validateSeedReadiness(novelAbs, errors, warnings, true);
    console.log(`# Intake check: ${novelRoot}\n`);
    if (!errors.length) console.log('PASS — seed intake ready for novel-bootstrap');
    errors.forEach((e) => console.log(`ERROR: ${e}`));
    warnings.forEach((w) => console.log(`WARN: ${w}`));
    process.exit(errors.length ? 1 : 0);
  }

  console.error(`Unknown intake subcommand: ${sub}`);
  process.exit(1);
}

function cmdContext(args) {
  const novelRoot = args[0];
  let chapter = 1;
  const chIdx = args.indexOf('--chapter');
  if (chIdx !== -1) chapter = parseInt(args[chIdx + 1], 10);

  if (!novelRoot) {
    console.log('Usage: forge context <stories/novel-id> [--chapter N]');
    process.exit(1);
  }

  const novelAbs = path.resolve(ROOT, novelRoot);
  const draftBlock = [];
  gateDraftingEntry(novelAbs, draftBlock);
  if (draftBlock.length) {
    console.error(draftBlock[0]);
    process.exit(1);
  }
  const modeText = loadText(path.join(novelAbs, 'state/context-mode.yaml')) || 'mode: auto';
  let mode = modeText.match(/^mode:\s*(\S+)/m)?.[1] || 'auto';

  const beats = loadText(path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`)) || '';
  const charRefs = beatsCharRefs(beats);
  if (charRefs.length >= 3 && mode === 'auto') mode = 'graph_hybrid';

  const files = new Set();

  const registrySnapshots = writeContextRegistrySnapshots(novelAbs, chapter);

  if (mode === 'auto' || mode === 'graph_hybrid') {
    try {
      const { sections } = resolveManifest('chapter-draft', novelRoot, chapter);
      for (const f of sections.before) {
        const norm = f.replace(/\\/g, '/');
        files.add(registrySnapshots[norm] || norm);
      }
      for (const f of sections.optional) {
        if (fs.existsSync(f)) files.add(f.replace(/\\/g, '/'));
      }
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  }

  for (const charFile of collectAppearInCharacterFiles(novelAbs, chapter, charRefs)) {
    files.add(charFile);
  }

  if (mode === 'graph_hybrid') {
    const { edges } = loadGraph(novelAbs);
    const related = new Set(charRefs);
    for (const [a, b] of edges) {
      if (related.has(a)) related.add(b);
      if (related.has(b)) related.add(a);
    }
    const nodeBlock = loadText(path.join(novelAbs, 'canon/entities/graph.yaml'));
    for (const id of related) {
      const ref = nodeBlock?.match(new RegExp(`id:\\s*${id}[\\s\\S]*?canon_ref:\\s*(.+)`))?.[1]?.trim();
      if (ref) addContextFile(novelAbs, files, ref);
    }
    for (const id of charRefs) addContextFile(novelAbs, files, `canon/characters/${id}.md`);
  } else if (mode === 'bm25_fallback') {
    try {
      const { sections } = resolveManifest('chapter-draft', novelRoot, chapter);
      for (const f of sections.before) files.add(f.replace(/\\/g, '/'));
    } catch (_) {}
    const idxPath = path.join(novelAbs, 'state/memory/keyword-index.json');
    if (fs.existsSync(idxPath)) {
      const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
      const query = beats.slice(0, 200);
      const scores = Object.entries(idx).map(([file, terms]) => {
        let s = 0;
        for (const t of Object.keys(terms)) if (query.includes(t)) s += terms[t];
        return [file, s];
      });
      scores.sort((a, b) => b[1] - a[1]);
      scores.slice(0, 5).forEach(([f]) => addContextFile(novelAbs, files, f));
    }
  }

  console.log(`# Context mode: ${mode} | chapter ${chapter}\n`);
  for (const f of files) console.log(f);
}

function cmdContextIndex(args) {
  const novelRoot = args[0];
  if (!novelRoot) {
    console.log('Usage: forge context-index <stories/novel-id>');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  const index = {};
  const walk = (dir, base = '') => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const fp = path.join(dir, name);
      const rel = path.join(base, name).replace(/\\/g, '/');
      if (fs.statSync(fp).isDirectory()) walk(fp, rel);
      else if (/\.(md|yaml|json)$/.test(name)) {
        const text = loadTextSafe(fp) || '';
        const terms = {};
        for (const w of text.matchAll(/[\u4e00-\u9fff]{2,}/g)) {
          terms[w[0]] = (terms[w[0]] || 0) + 1;
        }
        index[rel] = terms;
      }
    }
  };
  walk(path.join(novelAbs, 'canon'), 'canon');
  walk(path.join(novelAbs, 'state/memory'), 'state/memory');
  const out = path.join(novelAbs, 'state/memory/keyword-index.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(index, null, 0), 'utf8');
  console.log(`Wrote ${out} (${Object.keys(index).length} files)`);
}

function cmdPhase(args) {
  const sub = args[0];
  const novelRoot = args[1];
  if (!sub || !novelRoot) {
    console.log(`Usage:
  forge phase sync <stories/novel-id>           Mirror phase.yaml → novel.yaml
  forge phase advance <stories/novel-id> --chapter N [--force --reason "audit text"]
  forge phase set <stories/novel-id> --field X --value Y`);
    process.exit(1);
  }

  const novelAbs = path.resolve(ROOT, novelRoot);
  const phasePath = path.join(novelAbs, 'state/phase.yaml');

  if (sub === 'sync') {
    syncNovelFromPhase(novelAbs, loadPhaseState(novelAbs));
    console.log('Synced novel.yaml from phase.yaml');
    return;
  }

  if (sub === 'set') {
    const fIdx = args.indexOf('--field');
    const vIdx = args.indexOf('--value');
    const field = fIdx !== -1 ? args[fIdx + 1] : null;
    const raw = vIdx !== -1 ? args[vIdx + 1] : null;
    if (!field || raw == null) {
      console.error('Need --field and --value');
      process.exit(1);
    }
    let value = raw;
    if (/^\d+$/.test(raw)) value = parseInt(raw, 10);
    else if (raw === 'true' || raw === 'false') value = raw === 'true';

    if (field === 'phase' && value !== 'ideation') {
      const gateErrors = [];
      gateLeaveIdeation(novelAbs, gateErrors);
      if (gateErrors.length) {
        gateErrors.forEach((e) => console.error(e));
        process.exit(1);
      }
    }

    setYamlField(phasePath, field, value);
    syncNovelFromPhase(novelAbs, loadPhaseState(novelAbs));
    console.log(`Set phase.yaml ${field} = ${value}`);
    return;
  }

  if (sub === 'advance') {
    const chIdx = args.indexOf('--chapter');
    const chapter = chIdx !== -1 ? parseInt(args[chIdx + 1], 10) : null;
    const force = args.includes('--force');
    const reasonIdx = args.indexOf('--reason');
    const reason = reasonIdx !== -1 ? args[reasonIdx + 1] : null;
    if (chapter == null) {
      console.error('Need --chapter N');
      process.exit(1);
    }

    const phaseState = loadPhaseState(novelAbs);
    const advanceErrors = [];
    validatePhaseAllowsAdvance(phaseState, advanceErrors);
    if (advanceErrors.length && !force) {
      advanceErrors.forEach((e) => console.error(e));
      process.exit(1);
    }

    if (force && !reason) {
      console.error('--force requires --reason "..." for continuity-log audit trail');
      process.exit(1);
    }

    const padded = padChapter(chapter);
    const reviewPath = path.join(novelAbs, 'state/reviews', `ch-${padded}.json`);
    if (!force) {
      if (!fs.existsSync(reviewPath)) {
        console.error(`Missing review ${reviewPath} — run forge review first`);
        process.exit(1);
      }
      const review = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
      if (!review.pass) {
        console.error('Review not PASS — fix or use patch-refiner before advance');
        process.exit(1);
      }
      const tripleErrors = [];
      validateRevisionTriples(novelAbs, chapter, tripleErrors);
      if (tripleErrors.length) {
        tripleErrors.forEach((e) => console.error(e));
        process.exit(1);
      }
    }

    const val = validateChapterReady(novelAbs, chapter);
    if (!val.ok && !force) {
      console.error('chapter artifacts incomplete — run continuity-warden');
      val.errors.forEach((e) => console.error(`  ${e}`));
      process.exit(1);
    }

    if (!force) {
      const hv = validateChapterWorkflowHandoffs(novelAbs, chapter, 'chapter-cycle');
      if (!hv.ok) {
        if (hv.missing.length) {
          console.error(`Missing handoffs for phase advance: ${hv.missing.map((s) => `@${s}`).join(', ')}`);
        }
        if (hv.postflightGaps.length) {
          hv.postflightGaps.forEach((e) => console.error(`  postflight: ${e}`));
        }
        process.exit(1);
      }
      const reviewer = readHandoff(novelAbs, 'rule-reviewer', chapter);
      if (!reviewer?.complete) {
        console.error('Missing @rule-reviewer handoff — run forge handoff complete after review PASS');
        process.exit(1);
      }
    }

    if (force) appendForceAdvanceAudit(novelAbs, chapter, reason);

    setYamlField(phasePath, 'last_completed_chapter', chapter);
    setYamlField(phasePath, 'current_chapter', chapter + 1);
    setYamlField(phasePath, 'review_round', 0);
    setYamlField(phasePath, 'blocked', false);
    setYamlField(phasePath, 'block_reason', 'null');
    if (loadPhaseState(novelAbs).phase === 'outlining') {
      setYamlField(phasePath, 'phase', 'drafting');
      setYamlField(phasePath, 'sub_phase', 'chapter-draft');
    }
    syncNovelFromPhase(novelAbs, loadPhaseState(novelAbs));
    console.log(`Advanced: last_completed_chapter=${chapter}, current_chapter=${chapter + 1}`);
    return;
  }

  console.error(`Unknown phase subcommand: ${sub}`);
  process.exit(1);
}

function validateChapterReady(novelAbs, chapter) {
  const errors = [];
  const warnings = [];
  const padded = padChapter(chapter);
  if (!fs.existsSync(path.join(novelAbs, `manuscripts/chapters/ch-${padded}.md`)))
    errors.push(`missing manuscript ch-${padded}`);
  if (!fs.existsSync(path.join(novelAbs, `state/memory/chapter-summaries/ch-${padded}.yaml`)))
    errors.push(`missing chapter-summary ch-${padded}`);
  if (!fs.existsSync(path.join(novelAbs, `state/retention/ch-${padded}.yaml`)))
    warnings.push(`missing retention ch-${padded}`);
  return { ok: errors.length === 0, errors, warnings };
}

const [,, command, ...args] = process.argv;

switch (command) {
  case 'manifest':
    cmdManifest(args);
    break;
  case 'validate':
    cmdValidate(args);
    break;
  case 'compact':
    cmdCompact(args);
    break;
  case 'review':
    cmdReview(args);
    break;
  case 'context':
    cmdContext(args);
    break;
  case 'context-index':
    cmdContextIndex(args);
    break;
  case 'phase':
    cmdPhase(args);
    break;
  case 'intake':
    cmdIntake(args);
    break;
  case 'next':
    cmdNext(args);
    break;
  case 'run':
    cmdRun(args);
    break;
  case 'handoff':
    cmdHandoff(args);
    break;
  case 'workflow':
    cmdWorkflow(args);
    break;
  default:
    console.log(`Novel Forge CLI

Commands:
  manifest <task> <stories/id> [--chapter N]
  validate <stories/id> [--strict] [--task TASK] [--chapter N]
  compact <stories/id>
  review <stories/id> --chapter N
  context <stories/id> [--chapter N]
  context-index <stories/id>
  phase sync|advance|set <stories/id> [options]
  intake status|questions|check <stories/id>
  next <stories/id> [--chapter N] [--json]     Multi-agent: current skill + CLI
  run <stories/id> [--workflow auto|...]       Full workflow playbook → run-plan.json
  handoff complete|status <stories/id>         Skill isolation handoff protocol
  workflow validate                            Check workflow steps vs manifest skills
`);
}
