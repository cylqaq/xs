/**
 * Shared helpers for Novel Forge CLI (manifest, phase state, validators, review).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

const REVIEW_CONFIG_DEFAULTS = {
  defaultMinWordsPerChapter: 3000,
  beatsCoverageRatio: 0.7,
  openingHookMaxChapter: 3,
  dialogueMinSnippets: 2,
  dialogueMinRatio: 0.08,
  coolPointKeywordMinHits: { xuanhuan: 1, general: 1, default: 0 },
};

export function loadReviewConfig() {
  const p = path.join(ROOT, 'harness/review/config.json');
  if (!fs.existsSync(p)) return { ...REVIEW_CONFIG_DEFAULTS };
  try {
    return { ...REVIEW_CONFIG_DEFAULTS, ...JSON.parse(fs.readFileSync(p, 'utf8')) };
  } catch (_) {
    return { ...REVIEW_CONFIG_DEFAULTS };
  }
}

export function beatsExpectsDialogue(novelAbs, chapter) {
  const beats =
    loadText(path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`)) || '';
  return /对话|说道|「/.test(beats);
}

export function padChapter(n) {
  return String(n).padStart(3, '0');
}

export function loadText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

export function loadTextSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  const filtered = Buffer.from(buf.filter((b) => b !== 0 && (b >= 9 || b === 10 || b === 13)));
  return filtered.toString('utf8');
}

export function parseYamlScalar(text, key) {
  const m = text?.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

export function parseYamlInt(text, key) {
  const v = parseYamlScalar(text, key);
  return v != null ? parseInt(v, 10) : null;
}

export function parseYamlBool(text, key) {
  const v = parseYamlScalar(text, key);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return null;
}

export function setYamlField(filePath, key, value) {
  let text = loadText(filePath) || `${key}: ${value}\n`;
  const line =
    typeof value === 'boolean'
      ? `${key}: ${value}`
      : typeof value === 'number'
        ? `${key}: ${value}`
        : `${key}: ${value}`;
  if (new RegExp(`^${key}:`, 'm').test(text)) {
    text = text.replace(new RegExp(`^${key}:.*$`, 'm'), line);
  } else {
    text = `${text.trimEnd()}\n${line}\n`;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

export function loadPhaseState(novelAbs) {
  const text = loadText(path.join(novelAbs, 'state/phase.yaml')) || '';
  return {
    phase: parseYamlScalar(text, 'phase') || 'ideation',
    sub_phase: parseYamlScalar(text, 'sub_phase'),
    current_chapter: parseYamlInt(text, 'current_chapter') ?? 0,
    last_completed_chapter: parseYamlInt(text, 'last_completed_chapter') ?? 0,
    review_round: parseYamlInt(text, 'review_round') ?? 0,
    max_review_rounds: parseYamlInt(text, 'max_review_rounds') ?? 3,
    blocked: parseYamlBool(text, 'blocked') ?? false,
    block_reason: parseYamlScalar(text, 'block_reason'),
  };
}

/** phase.yaml is authoritative; mirror progress fields into novel.yaml */
export function syncNovelFromPhase(novelAbs, phaseState) {
  const novelPath = path.join(novelAbs, 'novel.yaml');
  if (!fs.existsSync(novelPath)) return;
  setYamlField(novelPath, 'last_completed_chapter', phaseState.last_completed_chapter);
  setYamlField(novelPath, 'current_chapter', phaseState.current_chapter);
  const statusMap = {
    ideation: 'ideation',
    worldbuilding: 'worldbuilding',
    outlining: 'outlining',
    drafting: 'drafting',
    revision: 'revision',
    publish: 'publish',
  };
  if (statusMap[phaseState.phase]) {
    setYamlField(novelPath, 'status', statusMap[phaseState.phase]);
  }
}

export function getLastCompleted(novelAbs) {
  const phase = loadPhaseState(novelAbs);
  const novelText = loadText(path.join(novelAbs, 'novel.yaml')) || '';
  const novelLast = parseInt(
    (novelText.match(/last_completed_chapter:\s*(\d+)/) || [])[1] || '0',
    10
  );
  return { phase, novelLast, authoritative: phase.last_completed_chapter };
}

export function resolveManifest(manifestName, novelRoot, chapter) {
  const manifestPath = path.join(ROOT, 'harness/manifests', `${manifestName}.yaml`);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const ch = chapter ?? 1;
  const padded = padChapter(ch);
  const prev = padChapter(Math.max(0, ch - 1));
  const novelAbs = path.resolve(ROOT, novelRoot);

  const subst = (s) =>
    s
      .replaceAll('{novel_root}', novelAbs.replace(/\\/g, '/'))
      .replaceAll('{chapter_padded}', padded)
      .replaceAll('{prev_chapter_padded}', prev);

  const lines = raw.split('\n');
  const sections = { before: [], optional: [], during: [], after: [], validators: [], skills: [] };
  let current = null;

  for (const line of lines) {
    if (line.startsWith('before:')) current = 'before';
    else if (line.startsWith('optional_if_exists:')) current = 'optional';
    else if (line.startsWith('during_write:')) current = 'during';
    else if (line.startsWith('after_must_update:')) current = 'after';
    else if (line.startsWith('validators:')) current = 'validators';
    else if (line.startsWith('skills:')) current = 'skills';
    else if (line.trim().startsWith('- ') && current) {
      const item = subst(line.trim().slice(2).replace(/^["']|["']$/g, ''));
      sections[current].push(item);
    }
  }

  return { novelAbs, chapter: ch, sections, manifestName };
}

export function manifestFilesExist(sections) {
  const files = new Set();
  for (const f of [...sections.before, ...sections.optional, ...sections.during, ...sections.after]) {
    if (fs.existsSync(f)) files.add(f);
  }
  return files;
}

export function collectCharacterNames(novelAbs) {
  const names = new Set();
  const indexPath = path.join(novelAbs, 'canon/characters/index.yaml');
  const indexText = loadText(indexPath);
  if (indexText) {
    for (const m of indexText.matchAll(/name:\s*(.+)/g)) {
      names.add(m[1].trim().replace(/^["']|["']$/g, ''));
    }
  }
  const charDir = path.join(novelAbs, 'canon/characters');
  if (fs.existsSync(charDir)) {
    for (const f of fs.readdirSync(charDir)) {
      if (f.endsWith('.md')) {
        const t = loadText(path.join(charDir, f));
        const h1 = t?.match(/^#\s+(.+)/m);
        if (h1) names.add(h1[1].trim());
      }
    }
  }
  return names;
}

export function collectGlossaryTerms(novelAbs) {
  const terms = new Set();
  const g = loadText(path.join(novelAbs, 'canon/style/glossary.md')) || '';
  for (const m of g.matchAll(/^\|\s*([^|]+)\s*\|/gm)) {
    const t = m[1].trim();
    if (t && t !== '词条' && t !== '---') terms.add(t);
  }
  for (const m of g.matchAll(/^-\s+(.+)$/gm)) {
    terms.add(m[1].trim());
  }
  return terms;
}

const COMMON_ZH = new Set([
  '他们', '我们', '你们', '什么', '一个', '没有', '自己', '知道', '开始', '时候', '已经',
  '可以', '这样', '不是', '就是', '因为', '所以', '但是', '如果', '虽然', '然后', '现在',
  '今天', '明天', '昨天', '这里', '那里', '怎么', '为什么', '一定', '可能', '应该', '需要',
  '看着', '说道', '声音', '目光', '心中', '身上', '面前', '身后', '突然', '立刻', '慢慢',
  '第一', '第二', '第三', '世界', '时间', '地方', '事情', '感觉', '发现', '继续', '回来',
]);

export function pushActionItem(results, item) {
  results.action_items.push({
    dimension: item.dimension,
    delegate_skill: item.delegate_skill || 'patch-refiner',
    severity: item.severity || 'error',
    message: item.message,
    hint: item.hint || '',
  });
}

export function countChineseChars(text) {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length;
}

export function parseSummaryYaml(text) {
  const get = (key) => {
    const m = text.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'));
    return m ? m[1].trim() : '';
  };
  const getList = (key) => {
    const block = text.match(new RegExp(`${key}:\\s*\\n([\\s\\S]*?)(?=\\n\\w|$)`));
    if (!block) return [];
    return [...block[1].matchAll(/-\s+(.+)/g)].map((m) => m[1].trim());
  };
  return {
    chapter: get('chapter'),
    title: get('title'),
    events: getList('events'),
    characters_present: getList('characters_present'),
    word_count: parseInt(get('word_count') || '0', 10),
  };
}

export function loadGraph(novelAbs) {
  const g = loadText(path.join(novelAbs, 'canon/entities/graph.yaml')) || '';
  const nodes = {};
  for (const m of g.matchAll(/-\s+id:\s*(\S+)[\s\S]*?type:\s*(\S+)/g)) {
    nodes[m[1]] = { type: m[2] };
  }
  const edges = [...g.matchAll(/from:\s*(\S+)[\s\S]*?to:\s*(\S+)/g)].map((m) => [m[1], m[2]]);
  return { nodes, edges };
}

export function beatsCharRefs(beats) {
  return [...beats.matchAll(/characters.*\[([^\]]+)\]/g)].flatMap((m) =>
    m[1].split(',').map((s) => s.trim()).filter(Boolean)
  );
}

export function beatsCoolPointRefs(beats) {
  return [...beats.matchAll(/cool_points.*\[([^\]]+)\]/g)].flatMap((m) =>
    m[1].split(',').map((s) => s.trim()).filter(Boolean)
  );
}

export function parseBeatsItems(beats) {
  const section = beats.split('## Beats')[1] || beats;
  return [...section.matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => m[1].trim());
}

/** Characters with appear_in containing chapter or beats-referenced id */
export function collectAppearInCharacterFiles(novelAbs, chapter, beatsCharIds = []) {
  const files = [];
  const indexText = loadText(path.join(novelAbs, 'canon/characters/index.yaml')) || '';
  const beatSet = new Set(beatsCharIds);
  for (const block of indexText.split(/-\s+id:/).slice(1)) {
    const id = block.match(/^(\S+)/)?.[1]?.trim();
    if (!id) continue;
    const appearIn = block.match(/appear_in:\s*\[([^\]]*)\]/)?.[1] || '';
    const chapters = appearIn.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    const file = block.match(/file:\s*(\S+)/)?.[1]?.trim();
    if ((chapters.includes(chapter) || beatSet.has(id)) && file) {
      const abs = path.join(novelAbs, file);
      if (fs.existsSync(abs)) files.push(abs.replace(/\\/g, '/'));
    }
  }
  return files;
}

const OPEN_FORESHADOW = new Set(['planned', 'planted', 'hinted']);
const OPEN_HOOK = new Set(['open', 'partially_addressed']);

function filterYamlItems(yamlText, predicate) {
  if (!yamlText?.trim()) return 'items: []\n';
  const blocks = [...yamlText.matchAll(/(^|\n)(-\s+id:[\s\S]*?)(?=\n-\s+id:|\nitems:|\n#|$)/g)].map((m) => m[2]);
  const kept = blocks.filter((b) => {
    const id = b.match(/id:\s*(\S+)/)?.[1];
    return id && predicate(b);
  });
  const header = yamlText.match(/^[\s\S]*?items:\s*\n/)?.[0] || 'items:\n';
  return header + (kept.length ? kept.join('\n') + '\n' : '');
}

export function writeContextRegistrySnapshots(novelAbs, chapter) {
  const snapDir = path.join(novelAbs, 'state/working', `context-snapshot-ch-${padChapter(chapter)}`);
  fs.mkdirSync(snapDir, { recursive: true });
  const out = {};

  const fsPath = path.join(novelAbs, 'registries/foreshadowing.yaml');
  const fsText = loadText(fsPath);
  if (fsText) {
    const filtered = filterYamlItems(fsText, (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      return status && OPEN_FORESHADOW.has(status);
    });
    const snap = path.join(snapDir, 'foreshadowing-open.yaml');
    fs.writeFileSync(snap, filtered, 'utf8');
    out[fsPath.replace(/\\/g, '/')] = snap.replace(/\\/g, '/');
  }

  const hkPath = path.join(novelAbs, 'registries/hooks.yaml');
  const hkText = loadText(hkPath);
  if (hkText) {
    const filtered = filterYamlItems(hkText, (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      return status && OPEN_HOOK.has(status);
    });
    const snap = path.join(snapDir, 'hooks-open.yaml');
    fs.writeFileSync(snap, filtered, 'utf8');
    out[hkPath.replace(/\\/g, '/')] = snap.replace(/\\/g, '/');
  }

  const otPath = path.join(novelAbs, 'registries/open-threads.yaml');
  const otText = loadText(otPath);
  if (otText) {
    const filtered = filterYamlItems(otText, (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      return !status || status === 'open' || status === 'active';
    });
    const snap = path.join(snapDir, 'open-threads-active.yaml');
    fs.writeFileSync(snap, filtered, 'utf8');
    out[otPath.replace(/\\/g, '/')] = snap.replace(/\\/g, '/');
  }

  return out;
}

export const ADVANCE_ALLOWED_PHASES = new Set(['drafting', 'revision', 'outlining']);

export function validatePhaseAllowsAdvance(phaseState, errors) {
  if (!ADVANCE_ALLOWED_PHASES.has(phaseState.phase)) {
    errors.push(
      `cannot advance chapter in phase "${phaseState.phase}" — complete bootstrap chain to drafting/outlining first`
    );
  }
}

export function appendForceAdvanceAudit(novelAbs, chapter, reason) {
  const logPath = path.join(novelAbs, 'registries/continuity-log.yaml');
  let text = loadText(logPath) || 'entries:\n';
  const entry = `  - chapter: ${chapter}\n    at: ${new Date().toISOString()}\n    type: force_advance\n    note: ${JSON.stringify(reason)}\n`;
  if (/entries:\s*\n/.test(text)) {
    text = text.replace(/entries:\s*\n/, `entries:\n${entry}`);
  } else {
    text = `entries:\n${entry}`;
  }
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, text, 'utf8');
}

export function validateRevisionTriples(novelAbs, chapter, errors) {
  const revDir = path.join(novelAbs, 'state/revisions');
  if (!fs.existsSync(revDir)) return;
  const padded = padChapter(chapter);
  const prefix = `ch-${padded}-r`;
  const rounds = fs.readdirSync(revDir).filter((d) => d.startsWith(prefix));
  for (const roundDir of rounds) {
    const dir = path.join(revDir, roundDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of ['original.md', 'patch.md', 'diff.md']) {
      if (!fs.existsSync(path.join(dir, f))) {
        errors.push(`incomplete revision triple: state/revisions/${roundDir}/ missing ${f}`);
      }
    }
  }
}

const ROLLING_PLACEHOLDER = /请 continuity-warden 补全|（根据近章摘要合并/;

export function validateSummaryRollingPlaceholder(novelAbs, lastCompleted, warnings, errors, strict) {
  if (lastCompleted < 3) return;
  const rolling = loadText(path.join(novelAbs, 'state/memory/summary-rolling.md')) || '';
  if (!ROLLING_PLACEHOLDER.test(rolling)) return;
  const msg = 'summary-rolling.md still contains compact placeholder — continuity-warden must fill M1 layer';
  if (lastCompleted >= 10 && strict) errors.push(msg);
  else warnings.push(msg);
}

export function loadIntakeQuestions() {
  const p = path.join(ROOT, 'harness/templates/intake-questions.yaml');
  return loadText(p) || '';
}

function fieldFilled(text, key, minChars = 2) {
  const v = parseYamlScalar(text, key);
  return v != null && v.length >= minChars && v !== '""';
}

function layerCompleted(text) {
  return parseYamlBool(text, 'completed') === true;
}

function extractAuthorIntentCore(md) {
  const m = md?.match(/##\s*核心幻想[^\n]*\n+([\s\S]*?)(?=\n##|\n#|$)/);
  return (m?.[1] || '').replace(/[#>*\-\s]/g, '').trim();
}

/** Assess seed intake; sync intake-status.yaml when writeStatus=true */
export function assessSeedIntake(novelAbs, writeStatus = false) {
  const qText = loadIntakeQuestions();
  const authorMin = parseInt(qText.match(/author_intent:[\s\S]*?min_chars:\s*(\d+)/)?.[1] || '24', 10);

  const gaps = [];
  const layers = { author_intent: 'pending', l1: 'pending', l2: 'pending', l3: 'pending' };

  const intentPath = path.join(novelAbs, 'seed/author-intent.md');
  const intent = loadText(intentPath) || '';
  const core = extractAuthorIntentCore(intent);
  if (core.length >= authorMin) layers.author_intent = 'complete';
  else gaps.push(`author-intent: 核心幻想不足 ${authorMin} 字（当前 ${core.length}）`);

  const l1Path = path.join(novelAbs, 'seed/layer1-core.yaml');
  const l1 = loadText(l1Path) || '';
  const l1Ok =
    fieldFilled(l1, 'genre', 2) &&
    fieldFilled(l1, 'protagonist', 8) &&
    fieldFilled(l1, 'core_conflict', 8) &&
    layerCompleted(l1);
  if (l1Ok) layers.l1 = 'complete';
  else {
    if (!fieldFilled(l1, 'genre', 2)) gaps.push('layer1: genre 未填');
    if (!fieldFilled(l1, 'protagonist', 8)) gaps.push('layer1: protagonist 过短');
    if (!fieldFilled(l1, 'core_conflict', 8)) gaps.push('layer1: core_conflict 过短');
    if (!layerCompleted(l1)) gaps.push('layer1: completed 须为 true');
  }

  const l2Path = path.join(novelAbs, 'seed/layer2-customize.yaml');
  const l2 = loadText(l2Path) || '';
  const l2Ok =
    fs.existsSync(l2Path) &&
    fieldFilled(l2, 'world_direction', 6) &&
    fieldFilled(l2, 'pov_tone', 4) &&
    fieldFilled(l2, 'theme', 4) &&
    fieldFilled(l2, 'audience', 2) &&
    (parseYamlInt(l2, 'target_chapters') ?? 0) >= 10 &&
    layerCompleted(l2);
  if (l2Ok) layers.l2 = 'complete';
  else if (!fs.existsSync(l2Path)) gaps.push('layer2: 缺少 seed/layer2-customize.yaml');
  else {
    if (!fieldFilled(l2, 'world_direction', 6)) gaps.push('layer2: world_direction 过短');
    if (!fieldFilled(l2, 'pov_tone', 4)) gaps.push('layer2: pov_tone 过短');
    if (!fieldFilled(l2, 'theme', 4)) gaps.push('layer2: theme 过短');
    if (!fieldFilled(l2, 'audience', 2)) gaps.push('layer2: audience 未填');
    if ((parseYamlInt(l2, 'target_chapters') ?? 0) < 10) gaps.push('layer2: target_chapters < 10');
    if (!layerCompleted(l2)) gaps.push('layer2: completed 须为 true');
  }

  const novelTitle = parseYamlScalar(loadText(path.join(novelAbs, 'novel.yaml')), 'title');
  const l3Path = path.join(novelAbs, 'seed/layer3-title.md');
  const l3Body = loadText(l3Path)?.replace(/#+\s/g, '').trim() || '';
  const titleOk =
    (novelTitle && novelTitle !== '未命名' && novelTitle.length >= 2) || l3Body.length >= 2;
  if (titleOk) layers.l3 = 'complete';
  else gaps.push('layer3: 书名未设（novel.yaml title 或 seed/layer3-title.md）');

  const ready = gaps.length === 0;
  let currentLayer = 1;
  if (layers.author_intent !== 'complete' || layers.l1 !== 'complete') currentLayer = 1;
  else if (layers.l2 !== 'complete') currentLayer = 2;
  else if (layers.l3 !== 'complete') currentLayer = 3;
  else currentLayer = 0;

  if (writeStatus) {
    const statusPath = path.join(novelAbs, 'seed/intake-status.yaml');
    const status = `readiness: ${ready ? 'ready' : 'collecting'}
current_layer: ${currentLayer || 3}
layers:
  author_intent: ${layers.author_intent}
  l1: ${layers.l1}
  l2: ${layers.l2}
  l3: ${layers.l3}
last_updated: ${new Date().toISOString().slice(0, 10)}
`;
    fs.mkdirSync(path.dirname(statusPath), { recursive: true });
    fs.writeFileSync(statusPath, status, 'utf8');
  }

  return { ready, gaps, layers, currentLayer };
}

export function nextIntakeQuestions(novelAbs, max = 3) {
  const { layers } = assessSeedIntake(novelAbs, false);
  const qText = loadIntakeQuestions();
  const out = [];

  if (layers.author_intent !== 'complete') {
    const prompt = qText.match(/author_intent:[\s\S]*?prompt:\s*(.+)/)?.[1]?.trim();
    if (prompt) out.push({ layer: 'author_intent', field: '核心幻想', prompt });
  }

  const pullLayer = (layerKey, yamlFile) => {
    const block = qText.match(new RegExp(`${layerKey}:[\\s\\S]*?fields:([\\s\\S]*?)(?=\\n  l\\d:|\\n  [a-z]|$)`));
    if (!block) return;
    const yaml = yamlFile ? loadText(path.join(novelAbs, yamlFile)) || '' : '';
    for (const m of block[1].matchAll(/(\w+):[\s\S]*?prompt:\s*(.+)/g)) {
      const field = m[1];
      const prompt = m[2].trim();
      if (field === 'title') {
        const title = parseYamlScalar(loadText(path.join(novelAbs, 'novel.yaml')), 'title');
        if (!title || title === '未命名') out.push({ layer: layerKey, field, prompt });
        continue;
      }
      if (field === 'target_chapters') {
        const n = parseYamlInt(yaml, 'target_chapters') ?? 0;
        if (n < 10) out.push({ layer: layerKey, field, prompt });
        continue;
      }
      const min = parseInt(m[0].match(/min_chars:\s*(\d+)/)?.[1] || '2', 10);
      if (!fieldFilled(yaml, field, min)) out.push({ layer: layerKey, field, prompt });
    }
  };

  if (layers.l1 !== 'complete') pullLayer('l1', 'seed/layer1-core.yaml');
  else if (layers.l2 !== 'complete') pullLayer('l2', 'seed/layer2-customize.yaml');
  else if (layers.l3 !== 'complete') pullLayer('l3', null);

  return out.slice(0, max);
}

export function validateSeedReadiness(novelAbs, errors, warnings, requireReady = true) {
  const { ready, gaps } = assessSeedIntake(novelAbs, true);
  if (!ready && requireReady) {
    for (const g of gaps) errors.push(`seed-readiness: ${g}`);
  } else if (!ready) {
    for (const g of gaps) warnings.push(`seed-readiness: ${g}`);
  }
}

export function gateLeaveIdeation(novelAbs, errors) {
  const phase = loadPhaseState(novelAbs);
  if (phase.phase !== 'ideation') return;
  const { ready, gaps } = assessSeedIntake(novelAbs, true);
  if (!ready) {
    errors.push(
      `cannot leave ideation — seed intake incomplete (${gaps.slice(0, 3).join('; ')}). Run: forge intake questions`
    );
  }
}

export const DRAFTING_PHASES = new Set(['drafting', 'revision', 'outlining']);

export function gateDraftingEntry(novelAbs, errors) {
  const phase = loadPhaseState(novelAbs);
  if (phase.phase === 'ideation') {
    errors.push('drafting tasks blocked in ideation — complete seed intake + bootstrap first');
    return;
  }
  if (phase.phase === 'worldbuilding') {
    errors.push('chapter/outlining tasks blocked in worldbuilding — finish world + characters + outline first');
  }
}

export function validateTaskBootstrap(novelAbs, errors, warnings) {
  if (!fs.existsSync(path.join(novelAbs, 'seed/author-intent.md')))
    warnings.push('bootstrap: missing seed/author-intent.md');
  if (!fs.existsSync(path.join(novelAbs, 'seed/layer1-core.yaml')))
    warnings.push('bootstrap: missing seed/layer1-core.yaml');
  if (!fs.existsSync(path.join(novelAbs, 'seed/intake-status.yaml')))
    warnings.push('bootstrap: missing seed/intake-status.yaml');
}

export function validateTaskWorldbuilding(novelAbs, errors) {
  if (!fs.existsSync(path.join(novelAbs, 'canon/world/overview.md')))
    errors.push('worldbuilding: missing canon/world/overview.md');
  if (!fs.existsSync(path.join(novelAbs, 'canon/world/rules.md')))
    errors.push('worldbuilding: missing canon/world/rules.md');
}

export function validateTaskCharacters(novelAbs, errors) {
  if (!fs.existsSync(path.join(novelAbs, 'canon/characters/index.yaml')))
    errors.push('characters: missing canon/characters/index.yaml');
}

export function validateTaskOutlineBatch(novelAbs, chapter, errors) {
  const beatsPath = path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`);
  if (!fs.existsSync(beatsPath)) errors.push(`outline-batch: missing beats ch-${padChapter(chapter)}`);
}

export function validateTaskRebuild(novelAbs, errors) {
  if (!fs.existsSync(path.join(novelAbs, 'canon/characters/index.yaml')))
    errors.push('rebuild-canon: missing canon/characters/index.yaml');
}

export function validateTaskRevisionVolume(novelAbs, chapter, errors, warnings) {
  const ck = path.join(novelAbs, 'state/checkpoints/revision-vol-01.yaml');
  const ckEx = path.join(novelAbs, 'state/checkpoints/revision-vol-01.yaml.example');
  if (!fs.existsSync(ck) && !fs.existsSync(ckEx)) {
    warnings.push('revision-volume: missing state/checkpoints/revision-vol-01.yaml');
  }
}

export function validateTimelineMaster(novelAbs, warnings, errors) {
  const tlPath = path.join(novelAbs, 'canon/timeline/master.yaml');
  const tl = loadText(tlPath);
  if (!tl) return;
  const chapters = [...tl.matchAll(/chapter:\s*(\d+)/g)].map((m) => parseInt(m[1], 10));
  for (let i = 1; i < chapters.length; i++) {
    if (chapters[i] < chapters[i - 1]) {
      errors.push(`timeline/master.yaml: chapter order not monotonic at index ${i}`);
      break;
    }
  }
}

export function validateEntityGraph(novelAbs, warnings) {
  const gPath = path.join(novelAbs, 'canon/entities/graph.yaml');
  const g = loadText(gPath);
  if (!g) return;
  const nodeIds = new Set([...g.matchAll(/^\s+id:\s*(.+)$/gm)].map((m) => m[1].trim()));
  for (const m of g.matchAll(/^\s+from:\s*(.+)$/gm)) {
    const from = m[1].trim();
    if (from && !nodeIds.has(from)) warnings.push(`graph.yaml: edge from unknown node ${from}`);
  }
  for (const m of g.matchAll(/^\s+to:\s*(.+)$/gm)) {
    const to = m[1].trim();
    if (to && !nodeIds.has(to)) warnings.push(`graph.yaml: edge to unknown node ${to}`);
  }
}

export function validateCharacterHeat(novelAbs, lastCompleted, warnings) {
  const indexText = loadText(path.join(novelAbs, 'canon/characters/index.yaml'));
  if (!indexText || lastCompleted < 10) return;
  for (const block of indexText.split(/-\s+id:/).slice(1)) {
    const role = block.match(/role:\s*(\S+)/)?.[1];
    const last = parseInt(block.match(/last_seen_chapter:\s*(\d+)/)?.[1] || '0', 10);
    if (role === 'protagonist' && lastCompleted - last > 5) {
      const id = block.match(/^(\S+)/)?.[1];
      warnings.push(`protagonist ${id} absent since ch ${last} (${lastCompleted - last} chapters)`);
    }
  }
}

export function scanIllegalBytes(novelAbs, lastCompleted, errors) {
  for (let ch = 1; ch <= lastCompleted; ch++) {
    const fp = path.join(novelAbs, `manuscripts/chapters/ch-${padChapter(ch)}.md`);
    if (!fs.existsSync(fp)) continue;
    const buf = fs.readFileSync(fp);
    if (buf.includes(0)) errors.push(`illegal null byte in ch-${padChapter(ch)}`);
  }
}

export function registryIds(yamlText) {
  return new Set([...(yamlText || '').matchAll(/^-\s+id:\s*(\S+)/gm)].map((m) => m[1]));
}

export function validateRegistryConsistency(novelAbs, lastCompleted, errors, warnings) {
  const fsIds = registryIds(loadText(path.join(novelAbs, 'registries/foreshadowing.yaml')));
  const hkIds = registryIds(loadText(path.join(novelAbs, 'registries/hooks.yaml')));
  const cpIds = registryIds(loadText(path.join(novelAbs, 'registries/cool-points.yaml')));
  const cgIds = registryIds(loadText(path.join(novelAbs, 'registries/chekhov-guns.yaml')));

  for (let ch = 1; ch <= lastCompleted; ch++) {
    const beats = loadText(path.join(novelAbs, `canon/plot/beats/ch-${padChapter(ch)}.md`)) || '';
    if (!beats) continue;
    for (const m of beats.matchAll(/foreshadowing:\s*\[([^\]]+)\]/g)) {
      for (const id of m[1].split(',').map((s) => s.trim())) {
        if (id && !fsIds.has(id)) errors.push(`ch-${padChapter(ch)} beats refs unknown foreshadowing ${id}`);
      }
    }
    for (const m of beats.matchAll(/hooks:\s*\[([^\]]+)\]/g)) {
      for (const id of m[1].split(',').map((s) => s.trim())) {
        if (id && !hkIds.has(id)) errors.push(`ch-${padChapter(ch)} beats refs unknown hook ${id}`);
      }
    }
    for (const m of beats.matchAll(/cool_points:\s*\[([^\]]+)\]/g)) {
      for (const id of m[1].split(',').map((s) => s.trim())) {
        if (id && !cpIds.has(id)) errors.push(`ch-${padChapter(ch)} beats refs unknown cool-point ${id}`);
      }
    }
  }

  if (lastCompleted > 0 && cgIds.size === 0 && fsIds.size > 0) {
    warnings.push('chekhov-guns.yaml empty while foreshadowing has items — consider foreshadow-engineer sync');
  }
}

export function validateContinuityArtifacts(novelAbs, lastCompleted, errors, warnings) {
  for (let ch = 1; ch <= lastCompleted; ch++) {
    const padded = padChapter(ch);
    const summaryPath = path.join(novelAbs, `state/memory/chapter-summaries/ch-${padded}.yaml`);
    const retentionPath = path.join(novelAbs, `state/retention/ch-${padded}.yaml`);
    if (!fs.existsSync(summaryPath)) errors.push(`missing chapter-summary ch-${padded} (required after continuity)`);
    if (!fs.existsSync(retentionPath)) warnings.push(`missing retention ch-${padded} (retention-analyst)`);

    const ms = loadTextSafe(path.join(novelAbs, `manuscripts/chapters/ch-${padded}.md`));
    const summary = loadText(summaryPath);
    if (ms && summary) {
      const parsed = parseSummaryYaml(summary);
      const msWc = countChineseChars(ms);
      if (parsed.word_count && Math.abs(parsed.word_count - msWc) > msWc * 0.15) {
        warnings.push(`ch-${padded} summary word_count (${parsed.word_count}) diverges from manuscript (${msWc})`);
      }
      for (const name of parsed.characters_present) {
        if (name && !ms.includes(name)) {
          warnings.push(`ch-${padded} summary lists "${name}" not found in manuscript`);
        }
      }
    }
  }

  const logPath = path.join(novelAbs, 'registries/continuity-log.yaml');
  if (lastCompleted > 0 && !loadText(logPath)?.trim()) {
    warnings.push('continuity-log.yaml empty after completed chapters');
  }
}

export function checkPhaseNovelSync(novelAbs, warnings, errors = null, strict = false) {
  const { phase, novelLast, authoritative } = getLastCompleted(novelAbs);
  if (novelLast !== authoritative) {
    const msg = `phase.yaml last_completed_chapter (${authoritative}) != novel.yaml (${novelLast}) — run forge phase sync`;
    if (strict && errors) errors.push(msg);
    else warnings.push(msg);
  }
  return phase;
}

export function reviewCharacterConsistency(novelAbs, chapter, text, results) {
  const known = collectCharacterNames(novelAbs);
  const glossary = collectGlossaryTerms(novelAbs);
  const summaryPath = path.join(novelAbs, `state/memory/chapter-summaries/ch-${padChapter(chapter)}.yaml`);
  const summary = loadText(summaryPath);

  if (known.size === 0) {
    results.dimensions.push({ id: 'character_consistency', pass: true, msg: 'no characters in index yet' });
    return;
  }

  let summaryOk = true;
  const missingFromText = [];
  if (summary) {
    const parsed = parseSummaryYaml(summary);
    for (const name of parsed.characters_present) {
      if (name && !text.includes(name)) {
        summaryOk = false;
        missingFromText.push(name);
      }
    }
  }

  const knownInText = [...known].filter((n) => n && text.includes(n));
  const needsKnown = known.size > 0 && chapter >= 1;
  const knownOk = !needsKnown || knownInText.length > 0;

  const pass = summaryOk && knownOk;
  results.dimensions.push({
    id: 'character_consistency',
    pass,
    msg: pass
      ? 'ok'
      : `missing_summary=${missingFromText.join(',') || 'none'} known_in_text=${knownInText.length}`,
  });
  if (!pass) {
    pushActionItem(results, {
      dimension: 'character_consistency',
      delegate_skill: 'continuity-warden',
      message: '角色名与 canon/summary 不一致',
      hint: '核对 index.yaml 与 chapter-summary characters_present，新角色须先登记',
    });
  }
}

export function reviewTimelineOrder(novelAbs, chapter, text, results) {
  const tl = loadText(path.join(novelAbs, 'canon/timeline/master.yaml')) || '';
  const tlChapters = [...tl.matchAll(/chapter:\s*(\d+)/g)].map((m) => parseInt(m[1], 10));
  let monotonic = true;
  for (let i = 1; i < tlChapters.length; i++) {
    if (tlChapters[i] < tlChapters[i - 1]) monotonic = false;
  }

  const fmChapter = parseInt(text.match(/^chapter:\s*(\d+)/m)?.[1] || `${chapter}`, 10);
  const marker = text.match(/^timeline_marker:\s*"?([^"\n]+)"?/m)?.[1]?.trim() || '';
  const chapterMatch = fmChapter === chapter;

  const prevEvents = [...tl.matchAll(/chapter:\s*(\d+)[\s\S]*?marker:\s*"?([^"\n]*)"?/g)]
    .map((m) => ({ ch: parseInt(m[1], 10), marker: m[2].trim() }))
    .filter((e) => e.ch < chapter)
    .sort((a, b) => a.ch - b.ch);
  const lastMarker = prevEvents.length ? prevEvents[prevEvents.length - 1].marker : '';

  let markerOk = true;
  if (marker && lastMarker && marker < lastMarker) markerOk = false;

  const pass = monotonic && chapterMatch && markerOk;
  results.dimensions.push({
    id: 'timeline_order',
    pass,
    msg: pass ? 'ok' : `monotonic=${monotonic} fm_ch=${fmChapter} marker_ok=${markerOk}`,
  });
  if (!pass) {
    pushActionItem(results, {
      dimension: 'timeline_order',
      delegate_skill: 'continuity-warden',
      message: '时间线或 frontmatter 与 timeline/master 不一致',
      hint: '对齐 chapter、timeline_marker，并更新 canon/timeline/master.yaml',
    });
  }
}

export function reviewBeatsCoverage(novelAbs, chapter, text, results) {
  const beats = loadText(path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`)) || '';
  const items = parseBeatsItems(beats);
  if (!items.length) {
    results.dimensions.push({ id: 'beats_coverage', pass: true, msg: 'no numbered beats' });
    return;
  }
  const missed = [];
  for (const beat of items) {
    const keywords = [...beat.matchAll(/[\u4e00-\u9fff]{2,}/g)]
      .map((m) => m[0])
      .filter((w) => !COMMON_ZH.has(w) && w.length >= 2);
    if (!keywords.length) continue;
    if (!keywords.some((kw) => text.includes(kw))) missed.push(beat.slice(0, 24));
  }
  const threshold = Math.ceil(items.length * loadReviewConfig().beatsCoverageRatio);
  const covered = items.length - missed.length;
  const pass = covered >= threshold;
  results.dimensions.push({
    id: 'beats_coverage',
    pass,
    msg: pass ? `covered=${covered}/${items.length}` : `covered=${covered}/${items.length} missed=${missed.length}`,
  });
  if (!pass) {
    pushActionItem(results, {
      dimension: 'beats_coverage',
      delegate_skill: 'chapter-production',
      message: '节拍表覆盖率不足',
      hint: '对照 beats 逐条落实 goal/conflict/turn 与登记册引用',
    });
  }
}

export function reviewCoolPointDensity(novelAbs, chapter, text, results) {
  const beats = loadText(path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`)) || '';
  const refs = beatsCoolPointRefs(beats);
  const cpYaml = loadText(path.join(novelAbs, 'registries/cool-points.yaml')) || '';

  if (refs.length > 0) {
    const undelivered = refs.filter((id) => {
      const block = cpYaml.match(new RegExp(`-\\s+id:\\s*${id}[\\s\\S]*?(?=\\n-\\s+id:|$)`));
      if (!block) return true;
      const delivered = parseInt(block[0].match(/delivered_chapter:\s*(\d+)/)?.[1] || '0', 10);
      return delivered !== chapter;
    });
    const pass = undelivered.length === 0;
    results.dimensions.push({
      id: 'cool_point_density',
      pass,
      msg: pass ? `registry_delivered=${refs.length}` : `undelivered=${undelivered.join(',')}`,
    });
    if (!pass) {
      pushActionItem(results, {
        dimension: 'cool_point_density',
        delegate_skill: 'patch-refiner',
        message: 'beats 登记的爽点未在本章兑现',
        hint: '更新 registries/cool-points.yaml delivered_chapter 或补写手稿爽点场景',
      });
    }
    return;
  }

  const genre = parseYamlScalar(loadText(path.join(novelAbs, 'novel.yaml')), 'genre');
  const hitsCfg = loadReviewConfig().coolPointKeywordMinHits || {};
  const minHits = hitsCfg[genre] ?? hitsCfg.default ?? 0;
  const coolKw = /突破|震惊|不可能|碾压|觉醒|反转|暴涨|目瞪口呆/g;
  const hits = (text.match(coolKw) || []).length;
  const pass = hits >= minHits;
  results.dimensions.push({ id: 'cool_point_density', pass, msg: `keyword_hits=${hits}` });
  if (!pass) {
    pushActionItem(results, {
      dimension: 'cool_point_density',
      delegate_skill: 'patch-refiner',
      message: '爽点密度不足',
      hint: '增加至少一处情绪高潮，或在 beats/cool-points 登记后兑现',
    });
  }
}

export function reviewDialogueQuality(novelAbs, chapter, text, results) {
  const beats = loadText(path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`)) || '';
  const expectsDialogue = /对话|说道|「/.test(beats);
  const dialogueLines = (text.match(/「[^」]+」/g) || []).length;
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim() && !p.startsWith('---')).length;
  const ratio = paragraphs ? dialogueLines / paragraphs : 0;

  const rc = loadReviewConfig();
  const pass =
    !expectsDialogue ||
    dialogueLines >= rc.dialogueMinSnippets ||
    ratio >= rc.dialogueMinRatio;
  results.dimensions.push({
    id: 'dialogue_quality',
    pass,
    msg: `dialogue_snippets=${dialogueLines} ratio=${ratio.toFixed(2)}`,
  });
  if (!pass) {
    pushActionItem(results, {
      dimension: 'dialogue_quality',
      delegate_skill: 'dialogue-craftsman',
      message: '对话场景不足或声纹单调',
      hint: '按角色卡润色对话，遵守 golden-rules 展示法则',
    });
  }
}

export function updateReviewRound(novelAbs, passed) {
  const phasePath = path.join(novelAbs, 'state/phase.yaml');
  const state = loadPhaseState(novelAbs);
  if (passed) {
    setYamlField(phasePath, 'review_round', 0);
    setYamlField(phasePath, 'blocked', false);
    setYamlField(phasePath, 'block_reason', 'null');
  } else {
    const next = state.review_round + 1;
    setYamlField(phasePath, 'review_round', next);
    if (next > state.max_review_rounds) {
      setYamlField(phasePath, 'blocked', true);
      setYamlField(phasePath, 'block_reason', `"review exceeded ${state.max_review_rounds} rounds"`);
    }
  }
  syncNovelFromPhase(novelAbs, loadPhaseState(novelAbs));
}
