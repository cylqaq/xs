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
  reviewEmotionalBeatDelivery,
  reviewMetaProseLeakage,
  reviewAntiPadding,
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
  validateTaskProseStyle,
  collectProseKillList,
  syncFrameworkScaffolds,
  validateTaskOutlineBatch,
  validateTaskRebuild,
  validateTaskRevisionVolume,
  validateSeedReadiness,
  assessSeedIntake,
  nextIntakeQuestions,
  gateLeaveIdeation,
  gateDraftingEntry,
  loadReviewConfig,
  writeSessionRelay,
  resolveNovelRootFromArgs,
  effectiveDraftChapter,
  extractMarkdownSection,
  isSummaryRollingPlaceholderSection,
  assessSessionCollect,
  scaffoldRevisionRound,
  syncReadOrderOnAdvance,
  resolveWordCountPolicy,
  evaluateWordcount,
  draftCheckChapter,
  formatDraftCheckReport,
  loadWritingPlan,
} from './forge-lib.mjs';
import {
  loadContextBudget,
  loadNavIndices,
  assessContextHealth,
  rebuildNavIndices,
  convergeNavIndices,
  auditSnapshots,
  formatDoctorReport,
  writeCircuitState,
} from './context-budget-lib.mjs';
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
  writeAdvanceHandoff,
} from './orchestrator-lib.mjs';

const MANIFEST_TASKS = [
  'bootstrap',
  'prose-style',
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
  const novelRoot = resolveNovelRootFromArgs(args, { skipTokens: MANIFEST_TASKS });
  let chapter = null;
  const chIdx = args.indexOf('--chapter');
  if (chIdx !== -1) chapter = parseInt(args[chIdx + 1], 10);

  if (!task || !novelRoot) {
    console.log('Usage: forge manifest <task> <stories/novel-id> [--chapter N]');
    console.log('       (novel path may appear before or after --chapter)');
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
    if (task === 'prose-style') validateTaskProseStyle(novelAbs, errors, warnings);
    if (task === 'outline-batch') validateTaskOutlineBatch(novelAbs, taskChapter, errors, warnings);
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
  const novelRoot = resolveNovelRootFromArgs(args);
  const chIdx = args.indexOf('--chapter');
  const chapterOverride = chIdx !== -1 ? parseInt(args[chIdx + 1], 10) : null;
  if (!novelRoot) {
    console.log('Usage: forge compact <stories/novel-id> [--chapter N]');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  const effectiveChapter = effectiveDraftChapter(novelAbs, chapterOverride);
  const premise = loadText(path.join(novelAbs, 'canon/background/premise.md')) || '';
  const premiseShort = premise.replace(/#+\s/g, '').trim().slice(0, 500);

  const summaries = [];
  for (let ch = Math.max(1, effectiveChapter - 2); ch <= effectiveChapter; ch++) {
    const p = path.join(novelAbs, `state/memory/chapter-summaries/ch-${padChapter(ch)}.yaml`);
    const t = loadText(p);
    if (t) summaries.push({ ch, ...parseSummaryYaml(t) });
  }

  const fsContent = loadText(path.join(novelAbs, 'registries/foreshadowing.yaml')) || '';
  const openFs = [...fsContent.matchAll(/id:\s*(\S+)[\s\S]*?status:\s*(planted|hinted)/g)]
    .map((m) => m[1])
    .slice(0, 10);

  const outPath = path.join(novelAbs, 'state/memory/summary-rolling.md');
  const existingBody = loadText(outPath) || '';
  const existingMain = extractMarkdownSection(existingBody, '主线进展');
  const existingArcs = extractMarkdownSection(existingBody, '活跃故事弧');
  const existingRecent = extractMarkdownSection(existingBody, '近章摘要');
  const existingOpen = extractMarkdownSection(existingBody, '开放登记');

  const mainProgress = isSummaryRollingPlaceholderSection(existingMain)
    ? '（根据近章摘要合并 — 请 continuity-warden 补全）'
    : existingMain;

  const activeArcs = isSummaryRollingPlaceholderSection(existingArcs)
    ? '见 canon/plot/arcs.yaml'
    : existingArcs;

  const recentFromYaml = summaries.length
    ? summaries
        .map(
          (s) =>
            `### 第 ${s.ch} 章${s.title ? `「${s.title}」` : ''}\n${s.events.slice(0, 5).join('；') || '（无 events）'}`
        )
        .join('\n\n')
    : '';

  const recentSection = recentFromYaml
    ? recentFromYaml
    : isSummaryRollingPlaceholderSection(existingRecent)
      ? '（尚无章节）'
      : existingRecent;

  const openSection = isSummaryRollingPlaceholderSection(existingOpen)
    ? `- 伏笔 planted/open: ${openFs.join(', ') || '无'}\n- 钩子: 见 registries/hooks.yaml\n- 情节债务: 见 registries/plot-debt.yaml`
    : existingOpen;

  const out = `# 滚动摘要

> 由 \`forge compact\` 生成于 ${new Date().toISOString().slice(0, 10)}（effective_chapter: ${effectiveChapter}）。与 canon 冲突时以 canon 为准。

## 全书前提

${premiseShort || '（待填写 premise）'}

## 主线进展

${mainProgress}

## 活跃故事弧

${activeArcs}

## 近章摘要

${recentSection}

## 开放登记

${openSection}
`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`Wrote ${outPath}`);
}

function cmdDraftCheck(args) {
  const novelRoot = args[0];
  let chapter = null;
  const chIdx = args.indexOf('--chapter');
  if (chIdx !== -1) chapter = parseInt(args[chIdx + 1], 10);

  if (!novelRoot || chapter == null) {
    console.log('Usage: forge draft check <stories/novel-id> --chapter N [--json]');
    process.exit(1);
  }

  const novelAbs = path.resolve(ROOT, novelRoot);
  const check = draftCheckChapter(novelAbs, chapter);
  const asJson = args.includes('--json');

  if (asJson) {
    console.log(JSON.stringify(check, null, 2));
  } else {
    console.log(formatDraftCheckReport(check, novelRoot));
  }

  if (!check.exists || check.evaluation?.tier === 'fail' || (check.integrity && !check.integrity.ok)) {
    process.exit(1);
  }
  process.exit(0);
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
      const body = text.replace(/^---[\s\S]*?---\r?\n?/, '');
      const firstPara =
        body
          .split(/\r?\n\r?\n/)
          .map((s) => s.trim())
          .find((s) => s.length > 0) || '';
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
    const policy = resolveWordCountPolicy(novelAbs, reviewCfg);
    const wc = countChineseChars(text.replace(/^---[\s\S]*?---\r?\n?/, ''));
    const wcEval = evaluateWordcount(wc, policy);
    results.dimensions.push({
      id: 'wordcount',
      pass: wcEval.pass,
      msg: wcEval.msg,
      tier: wcEval.tier,
    });
    if (wcEval.tier === 'fail') {
      pushActionItem(results, {
        dimension: 'wordcount',
        delegate_skill: wcEval.delegate_skill,
        message: wcEval.msg,
        hint: wcEval.hint,
      });
    } else if (wcEval.tier === 'warn' && wcEval.hint) {
      pushActionItem(results, {
        dimension: 'wordcount',
        delegate_skill: 'chapter-production',
        severity: 'warn',
        message: wcEval.msg,
        hint: wcEval.hint,
      });
    }

    reviewCoolPointDensity(novelAbs, chapter, text, results);
    reviewEmotionalBeatDelivery(novelAbs, chapter, text, results);
    reviewMetaProseLeakage(chapter, text, results);
    reviewAntiPadding(chapter, text, results);

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

    const killList = collectProseKillList(novelAbs);
    const crutchHit = killList.find((t) => t && text.includes(t));
    if (crutchHit) {
      results.dimensions.push({ id: 'ai_crutch_words', pass: false, msg: crutchHit });
      pushActionItem(results, {
        dimension: 'ai_crutch_words',
        delegate_skill: 'patch-refiner',
        message: `含 AI 套话/禁用词：${crutchHit}`,
        hint: '按 prose-profile.kill_list 与框架套话表替换为具体描写',
      });
    } else {
      results.dimensions.push({ id: 'ai_crutch_words', pass: true, msg: 'ok' });
    }
  }

  const fsContent = loadText(path.join(novelAbs, 'registries/foreshadowing.yaml')) || '';
  const fsBlocks = [...fsContent.matchAll(/(^|\n)(-\s+id:[\s\S]*?)(?=\n-\s+id:|\nitems:|$)/g)].map((m) => m[2]);
  const overdue = fsBlocks.filter((b) => {
    const plant = parseInt(b.match(/plant_chapter:\s*(\d+)/)?.[1] || '0', 10);
    const status = b.match(/status:\s*(\S+)/)?.[1];
    return status === 'planned' && plant < chapter;
  }).length;
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
  if (!results.pass) {
    scaffoldRevisionRound(novelAbs, chapter, results.review_round || 1);
  }

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
  if (!results.pass) {
    const delegate = results.action_items[0]?.delegate_skill || 'patch-refiner';
    console.log(`\n→ review FAIL：运行 forge next 进入 patch-cycle，首步委派 @${delegate}`);
    console.log(`  revision scaffold: state/revisions/ch-${padded}-r${results.review_round}/`);
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

function cmdRelay(args) {
  const sub = args[0];
  const novelRoot = args[1];
  if (sub !== 'refresh' || !novelRoot) {
    console.log('Usage: forge relay refresh <stories/novel-id|absolute-path>');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  if (!fs.existsSync(path.join(novelAbs, 'novel.yaml'))) {
    console.error(`Not a novel root: ${novelAbs}`);
    process.exit(1);
  }
  const plan = resolveNextStep(novelAbs, novelRoot, loadPhaseState(novelAbs).current_chapter || 1);
  const sk = plan?.skill_focus || plan?.skill;
  const nextHint = sk
    ? `@${sk} · ${plan.manifest || ''} · ch ${plan.chapter || 1}\n${plan.on_complete || ''}`
    : 'forge next';
  const relayPath = writeSessionRelay(novelAbs, novelRoot, nextHint);
  console.log(`# Session relay refreshed\n\n${relayPath}`);
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
    const novelRoot = resolveNovelRootFromArgs(args, { skipTokens: ['complete'] });
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

  // 有 snapshot 支持的 registry 文件：当 snapshot 为空时跳过，不回落到原始大文件
  const SNAPSHOTTED_REGISTRIES = new Set([
    'registries/foreshadowing.yaml',
    'registries/hooks.yaml',
    'registries/open-threads.yaml',
    'registries/character-state-log.yaml',
    'registries/world-state-log.yaml',
    'registries/narrative-sparks.yaml',
    'registries/emotional-beats.yaml',
    'registries/cool-points.yaml',
    'registries/appearance-log.yaml',
  ]);

  if (mode === 'auto' || mode === 'graph_hybrid') {
    try {
      const { sections } = resolveManifest('chapter-draft', novelRoot, chapter);
      const novelSlash = novelAbs.replace(/\\/g, '/');
      for (const f of sections.before) {
        const norm = f.replace(/\\/g, '/');
        if (registrySnapshots[norm]) {
          files.add(registrySnapshots[norm]);
        } else {
          const rel = norm.startsWith(novelSlash + '/') ? norm.slice(novelSlash.length + 1) : norm;
          if (SNAPSHOTTED_REGISTRIES.has(rel)) {
            continue;
          } else {
            files.add(norm);
          }
        }
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
  forge phase advance <stories/novel-id> --chapter N [--ack-session-collect] [--force --reason "audit text"]
  forge phase backfill-advance <stories/novel-id> [--chapter N]   Retroactive novel-orchestrator handoff
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

  if (sub === 'backfill-advance') {
    const chIdx = args.indexOf('--chapter');
    const chapter = chIdx !== -1 ? parseInt(args[chIdx + 1], 10) : loadPhaseState(novelAbs).last_completed_chapter;
    if (!chapter) {
      console.error('Need --chapter N or last_completed_chapter > 0');
      process.exit(1);
    }
    const p = writeAdvanceHandoff(novelAbs, chapter);
    console.log(p ? `✓ Backfill @novel-orchestrator handoff → ${p.replace(/\\/g, '/')}` : 'No advance step');
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
      const collect = assessSessionCollect(novelAbs);
      if (!collect.ok && !args.includes('--ack-session-collect')) {
        console.error(
          `Unanswered high-priority session-collect: ${collect.unackedHigh.join(', ')}`
        );
        console.error(
          'Set author_ack: true on each question in session-collect.yaml, or pass --ack-session-collect'
        );
        process.exit(1);
      }
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
    syncReadOrderOnAdvance(novelAbs, chapter);
    const advanceHandoff = writeAdvanceHandoff(novelAbs, chapter);
    const relayPath = writeSessionRelay(
      novelAbs,
      novelRoot,
      `章 ${chapter} 已完成（含 @novel-orchestrator handoff）→ 下一章 ${chapter + 1}。运行 forge next 激活 Skill。`
    );
    console.log(`Advanced: last_completed_chapter=${chapter}, current_chapter=${chapter + 1}`);
    if (advanceHandoff) console.log(`Handoff: ${advanceHandoff.replace(/\\/g, '/')}`);
    console.log(`Relay: ${relayPath}`);
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
    errors.push(`missing retention ch-${padded} (retention-analyst)`);
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
  case 'draft':
    if (args[0] === 'check') cmdDraftCheck(args.slice(1));
    else {
      console.log('Usage: forge draft check <stories/novel-id> --chapter N');
      process.exit(1);
    }
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
  case 'relay':
    cmdRelay(args);
    break;
  case 'sync':
    cmdSync(args);
    break;
  case 'doctor':
    cmdDoctor(args);
    break;
  case 'budget':
    cmdBudget(args);
    break;
  case 'nav':
    cmdNav(args);
    break;
  case 'snapshot':
    cmdSnapshot(args);
    break;
  default:
    console.log(`Novel Forge CLI

Commands:
  manifest <task> <stories/id> [--chapter N]
  validate <stories/id> [--strict] [--task TASK] [--chapter N]
  compact <stories/id> [--chapter N]
  review <stories/id> --chapter N
  draft check <stories/id> --chapter N [--json]   Pre-handoff wordcount tier (hard fail only)
  context <stories/id> [--chapter N]
  context-index <stories/id>
  phase sync|advance|set <stories/id> [options]
  intake status|questions|check <stories/id>
  next <stories/id> [--chapter N] [--json]     Multi-agent: current skill + CLI
  run <stories/id> [--workflow auto|...]       Full workflow playbook → run-plan.json
  handoff complete|status <stories/id>         Skill isolation handoff protocol
  workflow validate                            Check workflow steps vs manifest skills
  relay refresh <stories/id>                   Regenerate state/working/session-relay.md
  sync framework <stories/id>                  Scaffold missing framework files + list gaps
  doctor <stories/id> [--chapter N]            Context budget + INDEX freshness + loop safety
  budget <stories/id> [--chapter N]            Per-chapter context budget breakdown
  nav build|rebuild|lookup|converge <stories/id> [opts] L0 INDEX navigator helpers
  snapshot audit <stories/id> --chapter N      Snapshot quality audit (compression/missing)
`);
}

function cmdDoctor(args) {
  const novelRoot = resolveNovelRootFromArgs(args);
  const chIdx = args.indexOf('--chapter');
  const chapter = chIdx !== -1 ? parseInt(args[chIdx + 1], 10) : null;
  if (!novelRoot) {
    console.log('Usage: forge doctor <stories/novel-id> [--chapter N]');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  let manifestSections = null;
  try {
    if (chapter) {
      const { sections } = resolveManifest('chapter-draft', novelRoot, chapter);
      manifestSections = sections;
    }
  } catch (_) {}
  const check = assessContextHealth(novelAbs, chapter, { manifestSections });
  console.log(formatDoctorReport(novelRoot, check, chapter));
  writeCircuitState(novelAbs, check.circuit_state);
  process.exit(check.circuit_state === 'red' ? 2 : 0);
}

function cmdBudget(args) {
  const novelRoot = resolveNovelRootFromArgs(args);
  const chIdx = args.indexOf('--chapter');
  const chapter = chIdx !== -1 ? parseInt(args[chIdx + 1], 10) : 1;
  if (!novelRoot) {
    console.log('Usage: forge budget <stories/novel-id> [--chapter N]');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  const { sections } = resolveManifest('chapter-draft', novelRoot, chapter);
  const check = assessContextHealth(novelAbs, chapter, { manifestSections: sections });
  console.log('# Budget | ' + novelRoot + ' | ch-' + padChapter(chapter));
  console.log('');
  console.log('## Manifest BEFORE breakdown');
  const padded = padChapter(chapter);
  const snapDir = path.join(novelAbs, 'state/working/context-snapshot-ch-' + padded);

  // snapshot 文件名映射
  const SNAP_NAME_MAP = {
    'foreshadowing.yaml': 'foreshadowing-open.yaml',
    'hooks.yaml': 'hooks-open.yaml',
    'open-threads.yaml': 'open-threads-active.yaml',
    'character-state-log.yaml': 'character-state-active.yaml',
    'world-state-log.yaml': 'world-state-active.yaml',
    'narrative-sparks.yaml': 'narrative-sparks-open.yaml',
    'emotional-beats.yaml': 'emotional-beats-due.yaml',
    'cool-points.yaml': 'cool-points-due.yaml',
    'appearance-log.yaml': 'appearance-recent.yaml',
  };

  for (const meta of sections.beforeMeta) {
    const exists = fs.existsSync(meta.path);
    let kb = exists ? Math.ceil(fs.statSync(meta.path).size / 1024) : 0;
    let src = meta.source === 'on_demand' ? 'on_demand' : (meta.snapshot ? 'snapshot' : 'full');

    // 对于snapshot文件，显示snapshot大小
    if (meta.snapshot && exists) {
      const basename = path.basename(meta.path);
      const snapName = SNAP_NAME_MAP[basename] || basename;
      const snapPath = path.join(snapDir, snapName);
      if (fs.existsSync(snapPath)) {
        const snapKb = Math.ceil(fs.statSync(snapPath).size / 1024);
        src = 'snap✓';
        kb = snapKb;
      }
    }

    const skipReason = meta.source === 'on_demand' ? ' (skip)' : '';
    console.log('  [' + meta.priority.padEnd(8) + '] ' + (exists ? kb + ' KB' : 'MISSING').padEnd(8) + ' ' + src.padEnd(8) + ' ' + meta.path.replace(novelAbs.replace(/\\/g, '/') + '/', '') + skipReason);
  }
  console.log('');
  console.log(formatDoctorReport(novelRoot, check, chapter));
}

function cmdNav(args) {
  const sub = args[0];
  const rest = args.slice(1);
  const novelRoot = resolveNovelRootFromArgs(rest);
  if (!novelRoot) {
    console.log('Usage:\n  forge nav rebuild <stories/id>\n  forge nav build <stories/id> --chapter N\n  forge nav lookup <stories/id> --id <registry-id>');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  if (sub === 'rebuild') {
    const reports = rebuildNavIndices(novelAbs);
    console.log('# Nav rebuild | ' + novelRoot);
    for (const r of reports) console.log('  ' + r);
    if (!reports.length) console.log('  ⚠ no INDEX files found — run: pnpm forge sync framework ' + novelRoot);
    return;
  }
  if (sub === 'build') {
    const chIdx = rest.indexOf('--chapter');
    const chapter = chIdx !== -1 ? parseInt(rest[chIdx + 1], 10) : 1;
    const padded = padChapter(chapter);
    const planDir = path.join(novelAbs, 'state/working');
    fs.mkdirSync(planDir, { recursive: true });
    const planPath = path.join(planDir, 'context-plan-ch-' + padded + '.yaml');
    const { sections } = resolveManifest('chapter-draft', novelRoot, chapter);
    const check = assessContextHealth(novelAbs, chapter, { manifestSections: sections });
    const critical = sections.beforeMeta.filter((m) => m.priority === 'critical').map((m) => m.path);
    const high = sections.beforeMeta.filter((m) => m.priority === 'high').map((m) => m.path);
    const snapDir = 'state/working/context-snapshot-ch-' + padded;
    const lines = [];
    lines.push('chapter: ' + chapter);
    lines.push('generated_at: "' + new Date().toISOString() + '"');
    lines.push('budget_estimate_kb: ' + check.total_kb);
    lines.push('circuit_state: ' + check.circuit_state);
    lines.push('must_load:');
    lines.push('  critical:');
    for (const f of critical) lines.push('    - ' + f.replace(novelAbs.replace(/\\/g, '/') + '/', ''));
    lines.push('  high:');
    for (const f of high) lines.push('    - ' + f.replace(novelAbs.replace(/\\/g, '/') + '/', ''));
    lines.push('  medium_snapshots:');
    lines.push('    - ' + snapDir + '/foreshadowing-open.yaml');
    lines.push('    - ' + snapDir + '/hooks-open.yaml');
    lines.push('    - ' + snapDir + '/cool-points-due.yaml');
    lines.push('    - ' + snapDir + '/emotional-beats-due.yaml');
    lines.push('warnings:');
    for (const w of check.warnings) lines.push('  - "' + w.replace(/"/g, "'") + '"');
    fs.writeFileSync(planPath, lines.join('\n') + '\n', 'utf8');
    console.log('# Nav build | ' + novelRoot + ' | ch-' + padded);
    console.log('  plan: ' + planPath.replace(/\\/g, '/'));
    console.log('  budget: ' + check.total_kb + ' KB / ' + check.budget.totalKb + ' KB · ' + check.circuit_state);
    return;
  }
  if (sub === 'converge') {
    const maxHotRefs = rest.includes('--max-refs') ? parseInt(rest[rest.indexOf('--max-refs') + 1], 10) : 5;
    const maxDelivered = rest.includes('--max-delivered') ? parseInt(rest[rest.indexOf('--max-delivered') + 1], 10) : 5;
    const reports = convergeNavIndices(novelAbs, { maxHotRefs, maxDelivered });
    console.log('# Nav converge | ' + novelRoot);
    for (const r of reports) console.log('  ' + r);
    if (!reports.length) console.log('  ✓ INDEX files already within cap');
    // 显示收敛后的大小
    const nav = loadNavIndices(novelAbs);
    console.log('\n  sizes:');
    for (const [rel, meta] of Object.entries(nav.files)) {
      console.log(`    ${rel}: ${Math.ceil(meta.bytes / 1024)} KB`);
    }
    console.log(`  total: ${Math.ceil(nav.total_bytes / 1024)} KB / cap 6 KB`);
    return;
  }
  if (sub === 'lookup') {
    const idIdx = rest.indexOf('--id');
    if (idIdx === -1) {
      console.log('Usage: forge nav lookup <stories/id> --id <registry-id>');
      process.exit(1);
    }
    const id = rest[idIdx + 1];
    const candidates = [
      'registries/foreshadowing.yaml',
      'registries/hooks.yaml',
      'registries/open-threads.yaml',
      'registries/chekhov-guns.yaml',
      'registries/cool-points.yaml',
      'registries/emotional-beats.yaml',
      'registries/micro-payoffs.yaml',
      'registries/persona-shifts.yaml',
      'registries/character-state-log.yaml',
      'registries/world-state-log.yaml',
      'registries/narrative-sparks.yaml',
    ];
    console.log('# Nav lookup | ' + id);
    let hits = 0;
    for (const rel of candidates) {
      const fp = path.join(novelAbs, rel);
      if (!fs.existsSync(fp)) continue;
      const t = loadText(fp) || '';
      const blockRe = new RegExp('-\\s+id:\\s*' + id + '\\b[\\s\\S]*?(?=\\n-\\s+id:|\\n[a-zA-Z_]+:|$)');
      const m = t.match(blockRe);
      if (m) {
        hits++;
        console.log('## ' + rel);
        console.log(m[0].trim());
        console.log('');
      }
    }
    if (!hits) console.log('  (no matches)');
    return;
  }
  console.error('Unknown nav subcommand: ' + sub);
  process.exit(1);
}

function cmdSync(args) {
  const sub = args[0];
  const novelRoot = args[1] && args[1].startsWith('stories/') ? args[1] : resolveNovelRootFromArgs(args, { skipTokens: ['framework'] });
  if (sub !== 'framework' || !novelRoot) {
    console.log('Usage: forge sync framework <stories/novel-id>');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  if (!fs.existsSync(path.join(novelAbs, 'novel.yaml'))) {
    console.error('missing novel.yaml');
    process.exit(1);
  }
  const { copied, existing, styleReady, engineReady, agentTasks } = syncFrameworkScaffolds(novelAbs, {
    copyMissing: true,
  });
  console.log(`# Sync framework | ${novelRoot}\n`);
  if (copied.length) {
    console.log('## Copied scaffolds from _template');
    for (const f of copied) console.log(`+ ${f}`);
  } else {
    console.log('## Scaffolds: all framework paths present');
  }
  if (existing.length) {
    console.log('\n## Already present');
    for (const f of existing) console.log(`  ${f}`);
  }
  console.log(`\n## Prose style ready: ${styleReady.ready ? 'YES' : 'NO'}`);
  if (!styleReady.ready) {
    for (const g of styleReady.gaps) console.log(`- ${g}`);
  }
  console.log(`\n## Story engine ready: ${engineReady.ready ? 'YES' : 'NO'}`);
  if (!engineReady.ready) {
    for (const g of engineReady.gaps) console.log(`- ${g}`);
  }
  if (agentTasks.length) {
    console.log('\n## Agent follow-up');
    for (const t of agentTasks) console.log(`→ ${t}`);
  }
  process.exit(styleReady.ready && engineReady.ready ? 0 : 2);
}

function cmdSnapshot(args) {
  const sub = args[0];
  const novelRoot = resolveNovelRootFromArgs(args.slice(1));
  if (!novelRoot) {
    console.log('Usage: forge snapshot audit <stories/novel-id> --chapter N');
    process.exit(1);
  }
  const novelAbs = path.resolve(ROOT, novelRoot);
  const chIdx = args.indexOf('--chapter');
  const chapter = chIdx !== -1 ? parseInt(args[chIdx + 1], 10) : null;
  if (!chapter) {
    console.error('Need --chapter N');
    process.exit(1);
  }

  if (sub === 'audit') {
    const audit = auditSnapshots(novelAbs, chapter);
    console.log('# Snapshot audit | ' + novelRoot + ' | ch-' + padChapter(chapter) + '\n');
    for (const r of audit.reports) console.log(r);
    console.log('\n## Summary');
    console.log('  snap total: ' + audit.summary.total_snap_kb + ' KB');
    console.log('  orig total: ' + audit.summary.total_orig_kb + ' KB');
    console.log('  saved: ' + audit.summary.saved_kb + ' KB (' + (100 - audit.summary.compression_ratio) + '% reduction)');
    console.log('  missing: ' + audit.summary.missing);
    console.log('  low compression: ' + audit.summary.no_compression);
    process.exit(audit.summary.missing > 0 ? 1 : 0);
  }

  console.error('Usage: forge snapshot audit <stories/novel-id> --chapter N');
  process.exit(1);
}
