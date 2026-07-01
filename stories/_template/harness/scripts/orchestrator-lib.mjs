/**
 * Harness 多智能体调度：工作流编译、next/run、handoff 协议
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import {
  ROOT,
  padChapter,
  loadText,
  loadPhaseState,
  assessSeedIntake,
  resolveManifest,
  beatsExpectsDialogue,
  personaShiftTriggersForChapter,
  getManifestSkillWrites,
  assessSessionCollect,
  draftCheckChapter,
} from './forge-lib.mjs';

const FORGE = path.join(ROOT, 'harness/scripts/forge.mjs');

export const WORKFLOW_NAMES = [
  'creation-chain',
  'chapter-cycle',
  'patch-cycle',
  'revision-volume',
  'rebuild-chain',
];

function substTokens(s, ctx) {
  return s
    .replaceAll('{chapter}', String(ctx.chapter))
    .replaceAll('{chapter_padded}', ctx.chapterPadded)
    .replaceAll('{review_round}', String(ctx.reviewRound))
    .replaceAll('{novel_root}', ctx.novelRoot);
}

export function loadWorkflow(name) {
  const p = path.join(ROOT, 'harness/workflows', `${name}.yaml`);
  if (!fs.existsSync(p)) throw new Error(`Workflow not found: ${name}`);
  const raw = fs.readFileSync(p, 'utf8');
  const workflow = raw.match(/^workflow:\s*(.+)$/m)?.[1]?.trim() || name;
  const description = raw.match(/^description:\s*(.+)$/m)?.[1]?.trim() || '';

  const steps = [];
  let step = null;
  let listKey = null;

  for (const line of raw.split('\n')) {
    if (line.match(/^  - id:/)) {
      if (step) steps.push(step);
      step = {
        id: line.replace(/^  - id:\s*/, '').trim(),
        cli_preflight: [],
        cli_postflight: [],
        reads_handoff: [],
        reads_handoff_when_dialogue: [],
        also_skills: [],
        requires_files: [],
        handoff_writes: [],
        skip_when: null,
      };
      listKey = null;
      continue;
    }
    if (!step) continue;
    if (line.match(/^    skill:/)) step.skill = line.replace(/^    skill:\s*/, '').trim();
    else if (line.match(/^    manifest:/)) step.manifest = line.replace(/^    manifest:\s*/, '').trim();
    else if (line.match(/^    isolation:/)) step.isolation = line.includes('true');
    else if (line.match(/^    gate:/)) step.gate = line.replace(/^    gate:\s*/, '').trim();
    else if (line.match(/^    when_delegate:/)) step.when_delegate = line.replace(/^    when_delegate:\s*/, '').trim();
    else if (line.match(/^    when_dialogue:/)) step.when_dialogue = line.includes('true');
    else if (line.match(/^    skip_when:/)) step.skip_when = line.replace(/^    skip_when:\s*/, '').trim();
    else if (line.match(/^    requires_review_pass:/)) step.requires_review_pass = true;
    else if (line.match(/^    on_fail_goto:/)) step.on_fail_goto = line.replace(/^    on_fail_goto:\s*/, '').trim();
    else if (line.match(/^    note:/)) step.note = line.replace(/^    note:\s*/, '').trim();
    else if (line.match(/^    cli_preflight:/)) listKey = 'cli_preflight';
    else if (line.match(/^    cli_postflight:/)) listKey = 'cli_postflight';
    else if (line.match(/^    reads_handoff:/)) listKey = 'reads_handoff';
    else if (line.match(/^    reads_handoff_when_dialogue:/)) listKey = 'reads_handoff_when_dialogue';
    else if (line.match(/^    also_skills:/)) listKey = 'also_skills';
    else if (line.match(/^    requires_files:/)) listKey = 'requires_files';
    else if (line.match(/^    handoff_writes:/)) listKey = 'handoff_writes';
    else if (line.match(/^      - /) && listKey) {
      step[listKey].push(line.replace(/^      - /, '').trim());
    }
  }
  if (step) steps.push(step);

  return { workflow, description, steps };
}

export function loadManifestSkills(manifestName) {
  const { sections } = resolveManifest(manifestName, 'stories/_template', 1);
  return sections.skills;
}

/** workflow 步骤 skill 须出现在对应 manifest skills 列表中 */
export function validateWorkflowManifestSync() {
  const errors = [];
  for (const name of WORKFLOW_NAMES) {
    const wf = loadWorkflow(name);
    for (const step of wf.steps) {
      if (!step.manifest || !step.skill) continue;
      const skills = loadManifestSkills(step.manifest);
      if (skills.length && !skills.includes(step.skill)) {
        errors.push(
          `${name}/${step.id}: skill @${step.skill} not in manifest ${step.manifest} [${skills.join(', ')}]`
        );
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

export function handoffFilename(skill, chapter, workflow) {
  const chPart = chapter ? `ch-${padChapter(chapter)}-` : '';
  if (workflow === 'creation-chain') return `creation-${skill}.yaml`;
  if (workflow === 'revision-volume') return `revision-${skill}.yaml`;
  if (workflow === 'rebuild-chain') return `rebuild-${skill}.yaml`;
  return `${chPart}${skill}.yaml`;
}

export function handoffPath(novelAbs, skill, chapter, workflow = null) {
  return path.join(novelAbs, 'state/working/handoffs', handoffFilename(skill, chapter, workflow));
}

export function parseHandoffPostflightPassed(handoffPath) {
  const t = loadText(handoffPath);
  if (!t) return [];
  const passed = [];
  let inBlock = false;
  for (const line of t.split('\n')) {
    if (line.startsWith('cli_postflight_passed:')) {
      inBlock = true;
      if (line.match(/cli_postflight_passed:\s*\[\]/)) return [];
      continue;
    }
    if (inBlock) {
      const m = line.match(/^\s+-\s+(.+)/);
      if (m) passed.push(m[1].trim());
      else if (line.trim() && !line.startsWith(' ')) break;
    }
  }
  return passed;
}

export function readHandoff(novelAbs, skill, chapter) {
  const dir = path.join(novelAbs, 'state/working/handoffs');
  if (!fs.existsSync(dir)) return null;
  const padded = chapter ? `ch-${padChapter(chapter)}-${skill}.yaml` : null;
  const candidates = [
    padded,
    `creation-${skill}.yaml`,
    `revision-${skill}.yaml`,
    `rebuild-${skill}.yaml`,
    `${skill}.yaml`,
  ].filter(Boolean);
  for (const name of candidates) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) {
      const t = loadText(p);
      const status = t?.match(/^status:\s*(\S+)/m)?.[1];
      return {
        path: p,
        status,
        complete: status === 'complete',
        postflight_passed: parseHandoffPostflightPassed(p),
      };
    }
  }
  return null;
}

export function writeHandoff(novelAbs, opts) {
  const {
    skill,
    chapter = 0,
    workflow,
    stepId,
    status = 'complete',
    nextSkill = '',
    notes = '',
    artifacts = [],
    postflightPassed = [],
  } = opts;

  const filename = handoffFilename(skill, chapter, workflow);
  const outPath = path.join(novelAbs, 'state/working/handoffs', filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const artLines = artifacts.length
    ? artifacts.map((a) => `  - path: ${a.path}\n    exists: ${a.exists}`).join('\n')
    : '  []';

  const pfLines = postflightPassed.length
    ? postflightPassed.map((c) => `  - ${c}`).join('\n')
    : '  []';

  const body = `skill: ${skill}
chapter: ${chapter}
status: ${status}
workflow: ${workflow || ''}
step_id: ${stepId || ''}
completed_at: ${new Date().toISOString()}
isolation_ack: true
artifacts:
${typeof artifacts[0] === 'string' ? artifacts.map((p) => `  - path: ${p}\n    exists: true`).join('\n') : artLines}
cli_postflight_passed:
${pfLines}
next_skill: ${nextSkill}
notes: ${JSON.stringify(notes)}
`;
  fs.writeFileSync(outPath, body, 'utf8');
  return outPath;
}

export function inferWorkflow(phaseState, novelAbs, chapter) {
  if (phaseState.sub_phase === 'rebuild-canon') return 'rebuild-chain';
  if (phaseState.blocked) return 'patch-cycle';
  if (phaseState.phase === 'ideation' || phaseState.phase === 'worldbuilding') {
    return 'creation-chain';
  }
  if (phaseState.phase === 'outlining') return 'creation-chain';
  if (phaseState.phase === 'revision') return 'revision-volume';

  const padded = padChapter(chapter);
  const reviewPath = path.join(novelAbs, 'state/reviews', `ch-${padded}.json`);
  if (fs.existsSync(reviewPath)) {
    try {
      const r = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));
      if (!r.pass) {
        if (phaseState.review_round > 0) return 'patch-cycle';
        const reviewerDone = readHandoff(novelAbs, 'rule-reviewer', chapter)?.complete;
        if (!reviewerDone) return 'patch-cycle';
      }
    } catch (_) {}
  }
  return 'chapter-cycle';
}

export function stepConditionActive(step, novelAbs, chapter, workflowName) {
  if (step.when_delegate && workflowName === 'patch-cycle') {
    const padded = padChapter(chapter);
    const reviewPath = path.join(novelAbs, 'state/reviews', `ch-${padded}.json`);
    if (!fs.existsSync(reviewPath)) return false;
    try {
      const items = JSON.parse(fs.readFileSync(reviewPath, 'utf8')).action_items || [];
      return items.some((i) => i.delegate_skill === step.when_delegate);
    } catch (_) {
      return false;
    }
  }
  if (step.when_dialogue) {
    return beatsExpectsDialogue(novelAbs, chapter);
  }
  return true;
}

export function stepHandoffDependencies(step, novelAbs, chapter) {
  const deps = [...(step.reads_handoff || [])];
  if (step.reads_handoff_when_dialogue?.length && beatsExpectsDialogue(novelAbs, chapter)) {
    deps.push(...step.reads_handoff_when_dialogue);
  }
  return deps;
}

export function stepHandoffComplete(novelAbs, step, chapter, workflowName) {
  const deps = stepHandoffDependencies(step, novelAbs, chapter);
  if (!deps.length) return true;
  for (const dep of deps) {
    const h = readHandoff(novelAbs, dep, chapter);
    if (!h?.complete) return false;
  }
  return true;
}

export function stepShouldAutoSkip(novelAbs, step, chapter) {
  if (step.skip_when === 'no_persona_shift_triggers') {
    return personaShiftTriggersForChapter(novelAbs, chapter) === 0;
  }
  return false;
}

export function ensureAutoSkippedHandoff(novelAbs, step, chapter, workflowName) {
  if (!stepShouldAutoSkip(novelAbs, step, chapter)) return false;
  if (!stepHandoffComplete(novelAbs, step, chapter, workflowName)) return false;
  const own = readHandoff(novelAbs, step.skill, chapter);
  if (own?.complete) return true;

  const wf = loadWorkflow(workflowName);
  const nextIdx = wf.steps.findIndex((s) => s.skill === step.skill) + 1;
  let nextSkill = '';
  for (let i = nextIdx; i < wf.steps.length; i++) {
    if (stepConditionActive(wf.steps[i], novelAbs, chapter, workflowName)) {
      nextSkill = wf.steps[i].skill;
      break;
    }
  }

  const ctx = {
    chapter,
    chapterPadded: padChapter(chapter),
    reviewRound: loadPhaseState(novelAbs).review_round || 1,
    novelRoot: novelAbs,
  };
  const manifestPaths = step.manifest
    ? getManifestSkillWrites(step.manifest, step.skill, novelAbs, chapter)
    : step.requires_files || [];
  const relPaths = manifestPaths.length ? manifestPaths : step.requires_files || [];
  const artifacts = relPaths.map((rel) => {
    const p = path.join(novelAbs, substTokens(rel, ctx));
    return { path: rel, exists: fs.existsSync(p) };
  });

  writeHandoff(novelAbs, {
    skill: step.skill,
    chapter,
    workflow: workflowName,
    stepId: step.id,
    artifacts,
    nextSkill,
    notes: `auto-skip: ${step.skip_when} (chapter ${chapter})`,
    postflightPassed: [],
  });
  return true;
}

export function stepArtifactsMet(novelAbs, step, chapter, ctx) {
  if (!step.requires_files?.length) return { ok: true, missing: [] };
  const missing = [];
  for (const rel of step.requires_files) {
    const p = path.join(novelAbs, substTokens(rel, ctx));
    if (!fs.existsSync(p)) missing.push(rel);
  }
  return { ok: missing.length === 0, missing };
}

export function stepGateOk(novelAbs, step, chapter) {
  if (step.gate === 'intake_ready') {
    return assessSeedIntake(novelAbs, false).ready;
  }
  if (step.gate === 'draft_ready') {
    if (!readHandoff(novelAbs, 'chapter-production', chapter)?.complete) return false;
    if (beatsExpectsDialogue(novelAbs, chapter)) {
      if (!readHandoff(novelAbs, 'dialogue-craftsman', chapter)?.complete) return false;
    }
    return true;
  }
  return true;
}

export function compileCliList(step, ctx, key) {
  return (step[key] || []).map((c) => substTokens(c, ctx));
}

function reviewPassForChapter(novelAbs, chapter) {
  const reviewPath = path.join(novelAbs, 'state/reviews', `ch-${padChapter(chapter)}.json`);
  if (!fs.existsSync(reviewPath)) return false;
  try {
    return JSON.parse(fs.readFileSync(reviewPath, 'utf8')).pass === true;
  } catch (_) {
    return false;
  }
}

function patchCycleDelegate(novelAbs, chapter) {
  const reviewPath = path.join(novelAbs, 'state/reviews', `ch-${padChapter(chapter)}.json`);
  if (!fs.existsSync(reviewPath)) return 'patch-refiner';
  try {
    return JSON.parse(fs.readFileSync(reviewPath, 'utf8')).action_items?.[0]?.delegate_skill || 'patch-refiner';
  } catch (_) {
    return 'patch-refiner';
  }
}

/** 按 workflow 步骤顺序解析当前应激活的 Skill（handoff + 条件 + 门禁） */
export function detectWorkflowFocus(novelAbs, wf, chapter, phaseState) {
  const workflowName = wf.workflow;
  const ctx = {
    chapter,
    chapterPadded: padChapter(chapter),
    reviewRound: phaseState.review_round || 1,
    novelRoot: novelAbs,
  };

  if (workflowName === 'patch-cycle') {
    const delegate = patchCycleDelegate(novelAbs, chapter);
    for (const step of wf.steps) {
      if (step.when_delegate && step.when_delegate !== delegate) continue;
      if (step.when_delegate) {
        const own = readHandoff(novelAbs, step.skill, chapter);
        if (!own?.complete) {
          return { stepId: step.id, skill: step.skill, phase: 'patch-cycle', workflow: 'patch-cycle' };
        }
        continue;
      }
      if (step.id === 'route-patch') {
        const own = readHandoff(novelAbs, step.skill, chapter);
        if (!own?.complete) {
          return { stepId: step.id, skill: step.skill, phase: 'patch-route', workflow: 'patch-cycle' };
        }
        continue;
      }
      if (step.skill === 'rule-reviewer') {
        const own = readHandoff(novelAbs, step.skill, chapter);
        if (!own?.complete) {
          return { stepId: step.id, skill: step.skill, phase: 're-review', workflow: 'patch-cycle' };
        }
      }
    }
    return { stepId: 're-review', skill: 'rule-reviewer', phase: 'patch-done', workflow: 'patch-cycle' };
  }

  for (const step of wf.steps) {
    if (!stepConditionActive(step, novelAbs, chapter, workflowName)) continue;
    ensureAutoSkippedHandoff(novelAbs, step, chapter, workflowName);

    const own = readHandoff(novelAbs, step.skill, chapter);
    if (own?.complete) continue;

    if (!stepHandoffComplete(novelAbs, step, chapter, workflowName)) {
      return { stepId: step.id, skill: step.skill, phase: step.id, note: step.note, waiting: 'handoff' };
    }
    if (!stepGateOk(novelAbs, step, chapter)) {
      return { stepId: step.id, skill: step.skill, phase: step.id, note: step.note, waiting: 'gate' };
    }

    const arts = stepArtifactsMet(novelAbs, step, chapter, ctx);
    if (!arts.ok && step.requires_files?.length) {
      return {
        stepId: step.id,
        skill: step.skill,
        phase: step.id,
        note: step.note,
        waiting: 'artifacts',
        missing: arts.missing,
      };
    }

    if (step.requires_review_pass && !reviewPassForChapter(novelAbs, chapter)) {
      return {
        stepId: step.id,
        skill: step.skill,
        phase: 'advance',
        note: 'review 须 PASS 后再 advance',
        waiting: 'review_pass',
      };
    }

    return { stepId: step.id, skill: step.skill, phase: step.id, note: step.note };
  }

  const advance = wf.steps.find((s) => s.requires_review_pass);
  if (advance) {
    return { stepId: advance.id, skill: advance.skill, phase: 'advance', note: advance.note };
  }
  const last = wf.steps[wf.steps.length - 1];
  return { stepId: last?.id, skill: last?.skill || 'novel-orchestrator', phase: 'done' };
}

export function detectChapterCycleStep(novelAbs, chapter, phaseState) {
  return detectWorkflowFocus(novelAbs, loadWorkflow('chapter-cycle'), chapter, phaseState);
}

export function detectCreationStep(novelAbs, phaseState, chapter) {
  return detectWorkflowFocus(novelAbs, loadWorkflow('creation-chain'), chapter, phaseState);
}

export function validateChapterWorkflowHandoffs(novelAbs, chapter, workflowName = 'chapter-cycle') {
  const wf = loadWorkflow(workflowName);
  const ctx = {
    chapter,
    chapterPadded: padChapter(chapter),
    reviewRound: loadPhaseState(novelAbs).review_round || 1,
    novelRoot: novelAbs,
  };
  const missing = [];
  const postflightGaps = [];

  for (const step of wf.steps) {
    if (step.requires_review_pass) continue;
    if (!stepConditionActive(step, novelAbs, chapter, workflowName)) continue;

    const h = readHandoff(novelAbs, step.skill, chapter);
    if (!h?.complete) {
      missing.push(step.skill);
      continue;
    }

    const expectedPost = compileCliList(step, ctx, 'cli_postflight');
    if (expectedPost.length) {
      const passed = h.postflight_passed || [];
      for (const cmd of expectedPost) {
        if (!passed.some((p) => p === cmd || p.startsWith(cmd.split(' ')[0]))) {
          postflightGaps.push(`${step.skill}: missing postflight "${cmd}"`);
        }
      }
    }
  }

  return { ok: missing.length === 0 && postflightGaps.length === 0, missing, postflightGaps };
}

/** All chapter-cycle handoffs including @novel-orchestrator advance (post phase advance). */
export function validateChapterFullyClosed(novelAbs, chapter, workflowName = 'chapter-cycle') {
  const pre = validateChapterWorkflowHandoffs(novelAbs, chapter, workflowName);
  const wf = loadWorkflow(workflowName);
  const advance = wf.steps.find((s) => s.requires_review_pass);
  const missing = [...pre.missing];
  let advanceOk = true;
  if (advance?.skill) {
    advanceOk = !!readHandoff(novelAbs, advance.skill, chapter)?.complete;
    if (!advanceOk) missing.push(advance.skill);
  }
  return { ok: pre.ok && advanceOk, missing, postflightGaps: pre.postflightGaps };
}

/** Write novel-orchestrator handoff after successful phase advance (chapter closed). */
export function writeAdvanceHandoff(novelAbs, chapter) {
  const wf = loadWorkflow('chapter-cycle');
  const step = wf.steps.find((s) => s.requires_review_pass);
  if (!step) return null;
  const phasePath = path.join(novelAbs, 'state/phase.yaml');
  return writeHandoff(novelAbs, {
    skill: step.skill,
    chapter,
    workflow: 'chapter-cycle',
    stepId: step.id,
    artifacts: [
      { path: 'state/phase.yaml', exists: fs.existsSync(phasePath) },
      { path: `state/reviews/ch-${padChapter(chapter)}.json`, exists: true },
    ],
    nextSkill: '',
    notes: `phase advance: last_completed_chapter=${chapter}`,
    postflightPassed: ['phase advance'],
  });
}

export function resolveNextStep(novelAbs, novelRoot, chapterOpt) {
  const phaseState = loadPhaseState(novelAbs);
  const chapter = chapterOpt ?? (phaseState.current_chapter || 1);
  const workflowName = inferWorkflow(phaseState, novelAbs, chapter);
  const wf = loadWorkflow(workflowName);

  let focus;
  if (workflowName === 'chapter-cycle') focus = detectChapterCycleStep(novelAbs, chapter, phaseState);
  else if (workflowName === 'creation-chain') focus = detectCreationStep(novelAbs, phaseState, chapter);
  else focus = detectWorkflowFocus(novelAbs, wf, chapter, phaseState);

  const step = wf.steps.find((s) => s.id === focus.stepId || s.skill === focus.skill) || wf.steps[0];
  const ctx = {
    chapter,
    chapterPadded: padChapter(chapter),
    reviewRound: phaseState.review_round || 1,
    novelRoot: novelAbs.replace(/\\/g, '/'),
  };

  const plan = {
    novel: novelRoot,
    workflow: focus.workflow || workflowName,
    workflow_description: wf.description,
    phase: phaseState.phase,
    sub_phase: phaseState.sub_phase,
    chapter,
    blocked: phaseState.blocked,
    block_reason: phaseState.block_reason,
    review_round: phaseState.review_round,
    step_id: step?.id || focus.stepId,
    skill_focus: focus.skill,
    also_skills: step?.also_skills || [],
    manifest: step?.manifest || null,
    isolation: step?.isolation !== false,
    multi_agent: true,
    cli_preflight: step ? compileCliList(step, ctx, 'cli_preflight') : [],
    cli_postflight: step ? compileCliList(step, ctx, 'cli_postflight') : [],
    reads_handoff: step?.reads_handoff || [],
    handoff_pending: (step?.reads_handoff || []).filter((s) => !readHandoff(novelAbs, s, chapter)?.complete),
    requires_files: step?.requires_files?.map((f) => substTokens(f, ctx)) || [],
    artifacts_met: step ? stepArtifactsMet(novelAbs, step, chapter, ctx) : { ok: true, missing: [] },
    gate_ok: step ? stepGateOk(novelAbs, step, chapter) : true,
    note: focus.note || step?.note || '',
    waiting: focus.waiting || null,
    on_complete: `handoff complete ${novelRoot} --skill ${focus.skill}${chapter ? ` --chapter ${chapter}` : ''} --workflow ${workflowName}`,
  };

  if (phaseState.blocked) {
    plan.skill_focus = 'novel-orchestrator';
    plan.note = `blocked: ${phaseState.block_reason}`;
  }

  const collect = assessSessionCollect(novelAbs);
  if (!collect.ok) {
    plan.session_collect_warning = `高优先级 session-collect 未 author_ack: ${collect.unackedHigh.join(', ')}（advance 前须确认）`;
  }

  return plan;
}

export function compileRunPlan(novelAbs, novelRoot, workflowName, chapterOpt) {
  const phaseState = loadPhaseState(novelAbs);
  const chapter = chapterOpt ?? (phaseState.current_chapter || 1);
  const name = workflowName === 'auto' ? inferWorkflow(phaseState, novelAbs, chapter) : workflowName;
  const wf = loadWorkflow(name);
  const ctx = {
    chapter,
    chapterPadded: padChapter(chapter),
    reviewRound: phaseState.review_round || 1,
    novelRoot: novelAbs.replace(/\\/g, '/'),
  };

  const steps = wf.steps.map((step, idx) => {
    if (!stepConditionActive(step, novelAbs, chapter, name)) {
      return {
        index: idx + 1,
        id: step.id,
        skill: step.skill,
        also_skills: step.also_skills,
        manifest: step.manifest,
        isolation: step.isolation !== false,
        status: 'skipped',
        cli_preflight: compileCliList(step, ctx, 'cli_preflight'),
        cli_postflight: compileCliList(step, ctx, 'cli_postflight'),
        reads_handoff: step.reads_handoff,
        requires_files: (step.requires_files || []).map((f) => substTokens(f, ctx)),
        handoff_writes: (step.handoff_writes || []).map((f) => substTokens(f, ctx)),
      };
    }

    ensureAutoSkippedHandoff(novelAbs, step, chapter, name);
    const handoffDone = stepHandoffComplete(novelAbs, step, chapter, name);
    const arts = stepArtifactsMet(novelAbs, step, chapter, ctx);
    const gate = stepGateOk(novelAbs, step, chapter);
    let status = 'pending';
    if (handoffDone && arts.ok && gate) {
      const own = readHandoff(novelAbs, step.skill, chapter);
      status = own?.complete ? 'complete' : 'ready';
    } else if (!handoffDone) status = 'waiting_handoff';
    else if (!gate) status = 'waiting_gate';
    else if (!arts.ok) status = 'waiting_artifacts';

    return {
      index: idx + 1,
      id: step.id,
      skill: step.skill,
      also_skills: step.also_skills,
      manifest: step.manifest,
      isolation: step.isolation !== false,
      status,
      cli_preflight: compileCliList(step, ctx, 'cli_preflight'),
      cli_postflight: compileCliList(step, ctx, 'cli_postflight'),
      reads_handoff: step.reads_handoff,
      requires_files: (step.requires_files || []).map((f) => substTokens(f, ctx)),
      handoff_writes: (step.handoff_writes || []).map((f) => substTokens(f, ctx)),
    };
  });

  const next = resolveNextStep(novelAbs, novelRoot, chapter);

  return {
    compiled_at: new Date().toISOString(),
    novel: novelRoot,
    workflow: name,
    description: wf.description,
    phase: phaseState.phase,
    chapter,
    multi_agent_protocol: 'harness/workflows/README.md',
    current_step: next,
    steps,
  };
}

function injectNovelRoot(novelRoot, cmd) {
  const parts = cmd.split(/\s+/).filter(Boolean);
  if (parts.some((p) => p.startsWith('stories/') || p.includes('/') || p.includes('\\'))) return parts;
  if (parts[0] === 'intake') {
    return ['intake', parts[1] || 'check', novelRoot, ...parts.slice(2)];
  }
  if (parts[0] === 'draft' && parts[1] === 'check') {
    return ['draft', 'check', novelRoot, ...parts.slice(2)];
  }
  if (parts[0] === 'manifest') {
    return ['manifest', parts[1], novelRoot, ...parts.slice(2)];
  }
  if (parts[0] === 'compact' || parts[0] === 'validate' || parts[0] === 'review') {
    return [parts[0], novelRoot, ...parts.slice(1)];
  }
  return [parts[0], novelRoot, ...parts.slice(1)];
}

export function runCliPreflight(novelRoot, commands, { label = 'postflight' } = {}) {
  const results = [];
  for (const cmd of commands) {
    if (label) console.error(`[forge handoff ${label}] pnpm forge ${cmd}`);
    const args = injectNovelRoot(novelRoot, cmd);
    const r = spawnSync(process.execPath, [FORGE, ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (label && r.stdout) process.stdout.write(r.stdout);
    if (label && r.stderr) process.stderr.write(r.stderr);
    results.push({ cmd, code: r.status ?? 1, ok: (r.status ?? 1) === 0 });
    if (r.status !== 0) return { ok: false, results };
  }
  return { ok: true, results };
}

export function completeHandoff(novelAbs, novelRoot, opts) {
  const { skill, chapter = 0, workflow = 'auto', stepId = '', notes = '' } = opts;
  const phaseState = loadPhaseState(novelAbs);
  const ch = chapter || phaseState.current_chapter || 0;
  const wfName = workflow === 'auto' ? inferWorkflow(phaseState, novelAbs, ch || 1) : workflow;
  const wf = loadWorkflow(wfName);
  const step = wf.steps.find((s) => s.skill === skill || s.id === stepId);

  if (!step) {
    return { ok: false, error: `skill @${skill} not in workflow ${wfName} — refuse orphan handoff` };
  }

  if (!stepConditionActive(step, novelAbs, ch || 1, wfName)) {
    return { ok: false, error: `step @${skill} is skipped for this chapter (condition not met)` };
  }

  const handoffDeps = stepHandoffDependencies(step, novelAbs, ch || 1);
  if (handoffDeps.length) {
    for (const dep of handoffDeps) {
      const h = readHandoff(novelAbs, dep, ch || null);
      if (!h?.complete) {
        return { ok: false, error: `missing handoff from @${dep} — complete that skill first` };
      }
    }
  }

  if (stepShouldAutoSkip(novelAbs, step, ch || 1)) {
    ensureAutoSkippedHandoff(novelAbs, step, ch || 1, wfName);
    const nextIdx = wf.steps.findIndex((s) => s.skill === skill) + 1;
    let nextSkill = '';
    for (let i = nextIdx; i < wf.steps.length; i++) {
      if (stepConditionActive(wf.steps[i], novelAbs, ch || 1, wfName)) {
        nextSkill = wf.steps[i].skill;
        break;
      }
    }
    const outPath = handoffPath(novelAbs, skill, ch, wfName);
    return { ok: true, path: outPath, next_skill: nextSkill, plan: compileRunPlan(novelAbs, novelRoot, wfName, ch || 1), auto_skipped: true };
  }

  if (step.gate === 'intake_ready' && !assessSeedIntake(novelAbs, true).ready) {
    return { ok: false, error: 'intake not ready — run forge intake check' };
  }

  if (step.gate === 'draft_ready') {
    if (!readHandoff(novelAbs, 'chapter-production', ch || 1)?.complete) {
      return { ok: false, error: 'chapter-production handoff required before continuity' };
    }
    if (beatsExpectsDialogue(novelAbs, ch || 1) && !readHandoff(novelAbs, 'dialogue-craftsman', ch || 1)?.complete) {
      return { ok: false, error: 'dialogue-craftsman handoff required (beats expect dialogue)' };
    }
  }

  if (step.requires_review_pass && !reviewPassForChapter(novelAbs, ch || 1)) {
    return { ok: false, error: 'review must PASS before advance handoff — run forge review' };
  }

  const ctx = {
    chapter: ch || 1,
    chapterPadded: padChapter(ch || 1),
    reviewRound: phaseState.review_round || 1,
    novelRoot: novelAbs,
  };
  const post = compileCliList(step, ctx, 'cli_postflight');
  const manifestRel = step.manifest
    ? getManifestSkillWrites(step.manifest, step.skill, novelAbs, ch || 1)
    : [];
  const validateRels = step.requires_files?.length ? step.requires_files : manifestRel;
  const handoffArtifactRels = manifestRel.length ? manifestRel : validateRels;
  const artifacts = handoffArtifactRels.map((rel) => {
    const p = path.join(novelAbs, substTokens(rel, ctx));
    return { path: rel, exists: fs.existsSync(p) };
  });
  const missingArts = validateRels.map((rel) => {
    const p = path.join(novelAbs, substTokens(rel, ctx));
    return { path: rel, exists: fs.existsSync(p) };
  }).filter((a) => !a.exists);
  if (missingArts.length) {
    return {
      ok: false,
      error: `missing artifacts: ${missingArts.map((a) => a.path).join(', ')}`,
    };
  }

  if (step.skill === 'chapter-production') {
    const dc = draftCheckChapter(novelAbs, ch || 1);
    if (!dc.exists) {
      return { ok: false, error: `missing manuscript for chapter-production handoff` };
    }
    if (dc.evaluation?.tier === 'fail') {
      return {
        ok: false,
        error: `draft check fail: ${dc.evaluation.msg} — run forge draft check --chapter ${ch}`,
      };
    }
    if (dc.integrity && !dc.integrity.ok) {
      return {
        ok: false,
        error: `prose integrity gate: ${dc.integrity.errors.slice(0, 3).join('; ')}`,
      };
    }
  }

  let postflightPassed = [];
  if (post.length) {
    const run = runCliPreflight(novelRoot, post);
    postflightPassed = run.results.filter((r) => r.ok).map((r) => r.cmd);
    if (!run.ok) {
      return {
        ok: false,
        error: `cli_postflight failed: ${run.results.filter((r) => !r.ok).map((r) => r.cmd).join(', ')}`,
      };
    }
  }

  if (step.skill === 'rule-reviewer' && wfName === 'chapter-cycle') {
    if (!reviewPassForChapter(novelAbs, ch || 1)) {
      return {
        ok: false,
        error:
          'review must PASS before rule-reviewer handoff — fix via patch-cycle (forge next routes delegate_skill)',
      };
    }
  }

  const nextIdx = wf.steps.findIndex((s) => s.skill === skill) + 1;
  let nextSkill = '';
  for (let i = nextIdx; i < wf.steps.length; i++) {
    if (stepConditionActive(wf.steps[i], novelAbs, ch || 1, wfName)) {
      nextSkill = wf.steps[i].skill;
      break;
    }
  }

  const outPath = writeHandoff(novelAbs, {
    skill,
    chapter: ch,
    workflow: wfName,
    stepId: step.id || stepId,
    artifacts,
    nextSkill,
    notes,
    postflightPassed,
  });

  const runPlanPath = path.join(novelAbs, 'state/working/run-plan.json');
  const plan = compileRunPlan(novelAbs, novelRoot, wfName, ch || 1);
  fs.mkdirSync(path.dirname(runPlanPath), { recursive: true });
  fs.writeFileSync(runPlanPath, JSON.stringify(plan, null, 2), 'utf8');

  return { ok: true, path: outPath, next_skill: nextSkill, plan };
}

export function formatNextPlan(plan) {
  const lines = [
    `# Forge Next | ${plan.novel}`,
    ``,
    `workflow: ${plan.workflow}`,
    `phase: ${plan.phase}${plan.sub_phase ? ` · ${plan.sub_phase}` : ''} | chapter: ${plan.chapter}`,
    `blocked: ${plan.blocked}${plan.blocked ? ` (${plan.block_reason})` : ''}`,
    ``,
    `## 当前智能体（隔离会话）`,
    `@${plan.skill_focus}`,
    plan.manifest ? `manifest: ${plan.manifest}` : '',
    `isolation: ${plan.isolation} — 不读其他 Skill 对话，只读 handoff + manifest`,
    ``,
  ];

  if (plan.handoff_pending?.length) {
    lines.push(`## 等待 handoff`, ...plan.handoff_pending.map((s) => `- @${s} 未完成`), ``);
  }
  if (plan.waiting) {
    lines.push(`## 阻塞`, `- ${plan.waiting}`, ``);
  }
  if (plan.cli_preflight?.length) {
    lines.push(`## CLI 前置`, ...plan.cli_preflight.map((c) => `- pnpm forge ${c}`), ``);
  }
  if (plan.requires_files?.length) {
    lines.push(`## 本步产物`, ...plan.requires_files.map((f) => `- ${f}`), ``);
  }
  if (plan.cli_postflight?.length) {
    lines.push(`## CLI 后置`, ...plan.cli_postflight.map((c) => `- pnpm forge ${c}`), ``);
  }
  lines.push(`## 完成后`, `- pnpm forge ${plan.on_complete}`, '');
  if (plan.note) lines.push(`> ${plan.note}`, '');
  if (plan.session_collect_warning) {
    lines.push(`## 作者待确认`, plan.session_collect_warning, ``);
  }
  return lines.filter((l) => l !== '').join('\n');
}
