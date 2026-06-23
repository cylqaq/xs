/**
 * Shared helpers for Novel Forge CLI (manifest, phase state, validators, review).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

const REVIEW_CONFIG_DEFAULTS = {
  defaultMinWordsPerChapter: 2000,
  defaultMinWordsHardFail: 1600,
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
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(new RegExp(`^${key}:\\s*(.*)$`));
    if (!m) continue;
    const head = m[1].trim();
    if (head === '>-' || head === '|' || head === '|-' || head === '>') {
      const parts = [];
      for (let j = i + 1; j < lines.length; j++) {
        const line = lines[j];
        if (/^\S/.test(line)) break;
        const t = line.trim();
        if (t) parts.push(t);
      }
      return parts.join(' ').replace(/^["']|["']$/g, '');
    }
    if (!head) return null;
    return head.replace(/^["']|["']$/g, '');
  }
  return null;
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

const CLI_FLAGS_WITH_VALUE = new Set([
  '--chapter',
  '--workflow',
  '--skill',
  '--notes',
  '--task',
  '--reason',
  '--force',
]);

/** Resolve novel root from argv; tolerates flags before or after path. */
export function resolveNovelRootFromArgs(args, opts = {}) {
  const skip = new Set(opts.skipTokens || []);
  let i = opts.startIndex ?? 0;
  const candidates = [];
  while (i < args.length) {
    const a = args[i];
    if (a.startsWith('--')) {
      i += CLI_FLAGS_WITH_VALUE.has(a) ? 2 : 1;
      continue;
    }
    if (!skip.has(a)) candidates.push(a);
    i += 1;
  }
  return (
    candidates.find((p) => p.includes('/') || p.includes('\\')) ||
    candidates[candidates.length - 1] ||
    null
  );
}

/** Drafting chapter for memory compact: max(last_completed, current_chapter, override). */
export function effectiveDraftChapter(novelAbs, chapterOverride = null) {
  const phase = loadPhaseState(novelAbs);
  const { authoritative: lastCompleted } = getLastCompleted(novelAbs);
  return Math.max(lastCompleted, phase.current_chapter || 0, chapterOverride || 0, 1);
}

/** Count persona-shifts scheduled to trigger on chapter N. */
export function personaShiftTriggersForChapter(novelAbs, chapter) {
  const t = loadText(path.join(novelAbs, 'registries/persona-shifts.yaml')) || '';
  let count = 0;
  for (const m of t.matchAll(/trigger_chapter:\s*(\d+)/g)) {
    if (parseInt(m[1], 10) === chapter) count += 1;
  }
  return count;
}

export function extractMarkdownSection(body, title) {
  const re = new RegExp(`## ${title}\\r?\\n\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)`);
  const m = body.match(re);
  return m ? m[1].trim() : '';
}

export function isSummaryRollingPlaceholderSection(text) {
  if (!text) return true;
  return (
    /请 continuity-warden 补全|（根据近章摘要合并|（尚无章节）|见 canon\/plot\/arcs\.yaml/.test(text)
  );
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

  const lines = raw.split(/\r?\n/);
  const sections = {
    before: [],
    beforeMeta: [],   // {path, priority, optional, snapshot}
    optional: [],
    during: [],
    after: [],
    validators: [],
    skills: [],
    duringBySkill: {},
  };
  let current = null;
  let duringSkillKey = null;
  let pendingBeforeItem = null;  // 用于累积多行 before 条目
  const novelRootSlash = novelAbs.replace(/\\/g, '/');

  const flushBeforeItem = () => {
    if (pendingBeforeItem) {
      sections.before.push(pendingBeforeItem.path);
      sections.beforeMeta.push(pendingBeforeItem);
      pendingBeforeItem = null;
    }
  };

  const pushDuring = (absPath, skillKey = null) => {
    const rel = absPath.startsWith(novelRootSlash)
      ? absPath.slice(novelRootSlash.length + 1)
      : absPath;
    sections.during.push(absPath);
    if (skillKey) {
      if (!sections.duringBySkill[skillKey]) sections.duringBySkill[skillKey] = [];
      sections.duringBySkill[skillKey].push(rel);
    }
  };

  for (const line of lines) {
    // 检测 section 切换
    if (line.match(/^[a-z_]+:/) && !line.startsWith(' ')) {
      flushBeforeItem();
    }

    if (line.startsWith('before:')) {
      current = 'before';
      duringSkillKey = null;
    } else if (line.startsWith('optional_if_exists:')) {
      current = 'optional';
      duringSkillKey = null;
    } else if (line.startsWith('during_write:')) {
      current = 'during';
      duringSkillKey = null;
    } else if (line.startsWith('during_write_by_skill:')) {
      current = 'during_by_skill';
      duringSkillKey = null;
    } else if (line.startsWith('after_must_update:')) {
      current = 'after';
      duringSkillKey = null;
    } else if (line.startsWith('validators:')) {
      current = 'validators';
      duringSkillKey = null;
    } else if (line.startsWith('skills:')) {
      current = 'skills';
      duringSkillKey = null;
    } else if (current === 'during_by_skill' && line.match(/^  (\S+):\s*\[\]\s*$/)) {
      duringSkillKey = line.match(/^  (\S+):/)[1];
      sections.duringBySkill[duringSkillKey] = [];
    } else if (current === 'during_by_skill' && line.match(/^  (\S+):$/)) {
      duringSkillKey = line.trim().slice(0, -1);
      if (!sections.duringBySkill[duringSkillKey]) sections.duringBySkill[duringSkillKey] = [];
    } else if (current === 'before') {
      // 新格式：- path: "..." 带属性
      const pathMatch = line.match(/^\s+-\s+path:\s*["']?(.+?)["']?\s*$/);
      if (pathMatch) {
        flushBeforeItem();
        pendingBeforeItem = { path: subst(pathMatch[1]), priority: 'medium', optional: false, snapshot: false };
      } else if (pendingBeforeItem) {
        // 解析属性行
        const prioMatch = line.match(/^\s+priority:\s*(\S+)/);
        const optMatch = line.match(/^\s+optional:\s*(true)/);
        const snapMatch = line.match(/^\s+snapshot:\s*(true)/);
        if (prioMatch) pendingBeforeItem.priority = prioMatch[1];
        if (optMatch) pendingBeforeItem.optional = true;
        if (snapMatch) pendingBeforeItem.snapshot = true;
      } else {
        // 旧格式：- "{novel_root}/..."
        const item = subst(line.trim().slice(2).replace(/^["']|["']$/g, ''));
        if (item) {
          sections.before.push(item);
          sections.beforeMeta.push({ path: item, priority: 'medium', optional: false, snapshot: false });
        }
      }
    } else if (line.trim().startsWith('- ') && current) {
      const item = subst(line.trim().slice(2).replace(/^["']|["']$/g, ''));
      if (current === 'during_by_skill' && duringSkillKey) {
        pushDuring(item, duringSkillKey);
      } else if (current === 'during') {
        pushDuring(item);
      } else if (current === 'optional') {
        if (fs.existsSync(item)) sections.optional.push(item);
      } else if (current && sections[current]) {
        sections[current].push(item);
      }
    }
  }
  flushBeforeItem();

  return { novelAbs, chapter: ch, sections, manifestName };
}

/** Relative write paths for a skill within a manifest (falls back to union during_write). */
export function getManifestSkillWrites(manifestName, skill, novelRoot, chapter) {
  const { sections } = resolveManifest(manifestName, novelRoot, chapter);
  // Explicit during_write_by_skill entry (even []) must not fall back to during_write union.
  if (sections.duringBySkill && Object.prototype.hasOwnProperty.call(sections.duringBySkill, skill)) {
    return sections.duringBySkill[skill];
  }
  if (!sections.during.length) return [];
  const novelAbs = path.resolve(ROOT, novelRoot);
  const prefix = novelAbs.replace(/\\/g, '/') + '/';
  return sections.during.map((abs) =>
    abs.startsWith(prefix) ? abs.slice(prefix.length) : abs
  );
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

/** 字数策略：目标 band + 硬下限（见 session-production-limits.md） */
export function resolveWordCountPolicy(novelAbs, reviewCfg = null) {
  const cfg = reviewCfg || loadReviewConfig();
  const plan = loadWritingPlan(novelAbs);
  const targetMin = plan.minWordsPerChapter ?? cfg.defaultMinWordsPerChapter ?? 2000;
  const targetMax = plan.maxWordsPerChapter ?? 6000;
  const hardFail =
    plan.minWordsHardFail ??
    cfg.defaultMinWordsHardFail ??
    Math.max(1800, targetMin - 800);
  return { targetMin, targetMax, hardFail };
}

/**
 * 字数 tier：仅 hardFail 以下 review FAIL；targetMin 以下为 warn（仍 PASS）
 * 避免 2984/3000 边界 thrashing；严重欠幅才交 chapter-expander
 * 
 * 字数哲学：故事合理性优先于字数达标。字数是参考指标，不是硬性目标。
 * 详见 skills/guides/word-count-philosophy.md
 */
export function evaluateWordcount(wc, policy) {
  const { targetMin, targetMax, hardFail } = policy;
  if (wc < hardFail) {
    const deficit = targetMin - wc;
    return {
      pass: false,
      tier: 'fail',
      msg: `${wc}/${targetMin} 汉字（低于硬下限 ${hardFail}）`,
      delegate_skill: 'chapter-expander',
      hint: `按 beats 整段扩写感官/对话，一次建议 ≥${Math.max(300, deficit + 200)} 字；禁止改结尾凑字`,
    };
  }
  if (wc < targetMin) {
    const deficit = targetMin - wc;
    return {
      pass: true,
      tier: 'warn',
      msg: `${wc}/${targetMin} 汉字（未达目标 band ${targetMin}–${targetMax}，可后续扩写）`,
      delegate_skill: null,
      hint: deficit > 0 ? `可选扩写约 ${deficit} 字；优先增 beat 段落，勿凑单行` : null,
    };
  }
  if (wc > targetMax) {
    return {
      pass: true,
      tier: 'long',
      msg: `${wc}/${targetMin} 汉字（超过软上限 ${targetMax}）`,
      delegate_skill: null,
      hint: '可选精简重复段落',
    };
  }
  return {
    pass: true,
    tier: 'ok',
    msg: `${wc}/${targetMin} 汉字`,
    delegate_skill: null,
    hint: null,
  };
}

/** production 前字数预检（不阻断 handoff，仅输出 tier） */
export function draftCheckChapter(novelAbs, chapter) {
  const padded = padChapter(chapter);
  const msPath = path.join(novelAbs, `manuscripts/chapters/ch-${padded}.md`);
  const text = loadTextSafe(msPath);
  const policy = resolveWordCountPolicy(novelAbs);
  if (!text) {
    return {
      chapter,
      padded,
      manuscript: `manuscripts/chapters/ch-${padded}.md`,
      exists: false,
      chars: 0,
      policy,
      evaluation: null,
      beats_path: `canon/plot/beats/ch-${padded}.md`,
      beats_exists: fs.existsSync(path.join(novelAbs, `canon/plot/beats/ch-${padded}.md`)),
    };
  }
  const body = text.replace(/^---[\s\S]*?---\r?\n?/, '');
  const chars = countChineseChars(body);
  const evaluation = evaluateWordcount(chars, policy);
  const integrity = scanProseIntegrity(body);
  return {
    chapter,
    padded,
    manuscript: `manuscripts/chapters/ch-${padded}.md`,
    exists: true,
    chars,
    policy,
    evaluation,
    integrity,
    beats_path: `canon/plot/beats/ch-${padded}.md`,
    beats_exists: fs.existsSync(path.join(novelAbs, `canon/plot/beats/ch-${padded}.md`)),
  };
}

export function formatDraftCheckReport(check, novelRoot) {
  const lines = [`# Draft check | ch-${check.padded} | ${novelRoot}`, ''];
  if (!check.exists) {
    lines.push(`✗ missing ${check.manuscript}`);
    if (!check.beats_exists) lines.push(`✗ missing ${check.beats_path}`);
    return lines.join('\n');
  }
  const ev = check.evaluation;
  const icon = ev.tier === 'fail' ? '✗' : ev.tier === 'warn' ? '⚠' : '✓';
  lines.push(`${icon} wordcount: ${ev.msg}`);
  lines.push(`  tier: ${ev.tier} | hardFail: ${check.policy.hardFail} | target: ${check.policy.targetMin}–${check.policy.targetMax}`);
  if (ev.hint) lines.push(`  hint: ${ev.hint}`);
  if (check.integrity) {
    const iIcon = check.integrity.ok ? '✓' : '✗';
    lines.push(
      `${iIcon} integrity: ${check.integrity.ok ? 'ok' : check.integrity.errors.slice(0, 3).join('; ')}`
    );
    if (!check.integrity.ok) {
      lines.push('  → 禁止 handoff：删 meta/重复章末，按 beats 扩写中段');
    }
  }
  if (ev.tier === 'fail') {
    lines.push('', '→ patch-cycle / @chapter-expander（按 beats 扩段，≤2 轮）');
  } else if (!check.integrity?.ok) {
    lines.push('', '→ patch-cycle / @patch-refiner（integrity 硬门禁）');
  } else if (ev.tier === 'warn') {
    lines.push('', '→ 可 handoff；未达目标 band 时优先扩 beat 段，禁止凑单行/章末堆字');
  } else {
    lines.push('', '→ 可 handoff production');
  }
  if (!check.beats_exists) lines.push(`⚠ missing ${check.beats_path} — 先 batch-planner`);
  return lines.join('\n');
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

/** Resolve characters_present entries (id: foo or 明昼) to display names via index.yaml */
export function resolveSummaryCharacterNames(novelAbs, summaryText) {
  if (!summaryText) return [];
  const parsed = parseSummaryYaml(summaryText);
  const index = loadText(path.join(novelAbs, 'canon/characters/index.yaml')) || '';
  const names = [];
  for (const item of parsed.characters_present) {
    const idM = item.match(/^id:\s*(\S+)/);
    if (idM) {
      const id = idM[1];
      const block = index.split(/-\s+id:/).find((b) => b.trimStart().startsWith(id));
      const nameM = block?.match(/name:\s*(.+)/);
      names.push(nameM ? nameM[1].trim().replace(/^["']|["']$/g, '') : id);
    } else {
      names.push(item.replace(/^["']|["']$/g, ''));
    }
  }
  return names.filter(Boolean);
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

export function beatsEmotionalBeatRefs(beats) {
  return [...beats.matchAll(/emotional_beats.*\[([^\]]+)\]/g)].flatMap((m) =>
    m[1].split(',').map((s) => s.trim()).filter(Boolean)
  );
}

/** Match `- **field**: [x]` or `- field: [x]` with non-empty list */
export function beatsHasRegistryList(beats, field) {
  const re = new RegExp(`(?:\\*\\*)?${field}(?:\\*\\*)?:\\s*\\[([^\\]]+)\\]`);
  const m = beats.match(re);
  if (!m) return false;
  return m[1].split(',').some((s) => s.trim().length > 0);
}

/** Match `- **field**: text` (non-bracket scalar line) */
export function beatsHasFieldLine(beats, field) {
  const re = new RegExp(`(?:\\*\\*)?${field}(?:\\*\\*)?:\\s*(.+)`);
  const m = beats.match(re);
  return Boolean(m?.[1]?.trim().length > 2);
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
const ACTIVE_STATE = new Set(['active']);

/** 检查过滤后的 YAML 是否为空（items/entries/sparks 列表无条目） */
function isFilteredYamlEmpty(filtered) {
  return !filtered || !/-\s+id:\s*\S/.test(filtered);
}

function yamlIdBlocks(yamlText) {
  return [...yamlText.matchAll(/(?:^|\n)\s*(-\s+id:[\s\S]*?)(?=\n\s*-\s+id:|\n[a-zA-Z_][\w-]*:\s*|$)/g)].map(
    (m) => m[1]
  );
}

function filterYamlEntries(yamlText, listKey, predicate) {
  if (!yamlText?.trim()) return `${listKey}: []\n`;
  const blocks = yamlIdBlocks(yamlText);
  const kept = blocks.filter((b) => {
    const id = b.match(/id:\s*(\S+)/)?.[1];
    return id && predicate(b);
  });
  const header = yamlText.match(new RegExp(`^[\\s\\S]*?${listKey}:\\s*\\n`))?.[0] || `${listKey}:\n`;
  return header + (kept.length ? kept.join('\n') + '\n' : '');
}

function filterYamlItems(yamlText, predicate) {
  return filterYamlEntries(yamlText, 'items', predicate);
}

export function writeContextRegistrySnapshots(novelAbs, chapter) {
  const snapDir = path.join(novelAbs, 'state/working', `context-snapshot-ch-${padChapter(chapter)}`);
  fs.mkdirSync(snapDir, { recursive: true });
  const out = {};

  function writeSnap(snapName, origPath, filtered) {
    if (isFilteredYamlEmpty(filtered)) return;
    const snap = path.join(snapDir, snapName);
    fs.writeFileSync(snap, filtered, 'utf8');
    out[origPath.replace(/\\/g, '/')] = snap.replace(/\\/g, '/');
  }

  const fsPath = path.join(novelAbs, 'registries/foreshadowing.yaml');
  const fsText = loadText(fsPath);
  if (fsText) {
    writeSnap('foreshadowing-open.yaml', fsPath, filterYamlItems(fsText, (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      if (!(status && OPEN_FORESHADOW.has(status))) return false;
      const plantCh = parseInt(b.match(/plant_chapter:\s*(\d+)/)?.[1] || '0', 10);
      return plantCh <= chapter;
    }));
  }

  const hkPath = path.join(novelAbs, 'registries/hooks.yaml');
  const hkText = loadText(hkPath);
  if (hkText) {
    writeSnap('hooks-open.yaml', hkPath, filterYamlItems(hkText, (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      if (!(status && OPEN_HOOK.has(status))) return false;
      const hkCh = parseInt(b.match(/chapter:\s*(\d+)/)?.[1] || '0', 10);
      return hkCh <= chapter;
    }));
  }

  const otPath = path.join(novelAbs, 'registries/open-threads.yaml');
  const otText = loadText(otPath);
  if (otText) {
    writeSnap('open-threads-active.yaml', otPath, filterYamlItems(otText, (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      if (!(status === 'open' || status === 'active')) return false;
      const otCh = parseInt(b.match(/opened_chapter:\s*(\d+)/)?.[1] || '0', 10);
      return otCh <= chapter;
    }));
  }

  const cslPath = path.join(novelAbs, 'registries/character-state-log.yaml');
  const cslText = loadText(cslPath);
  if (cslText) {
    writeSnap('character-state-active.yaml', cslPath, filterYamlEntries(cslText, 'entries', (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      return status && ACTIVE_STATE.has(status);
    }));
  }

  const wslPath = path.join(novelAbs, 'registries/world-state-log.yaml');
  const wslText = loadText(wslPath);
  if (wslText) {
    writeSnap('world-state-active.yaml', wslPath, filterYamlEntries(wslText, 'entries', (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      return status && ACTIVE_STATE.has(status);
    }));
  }

  const nkPath = path.join(novelAbs, 'registries/narrative-sparks.yaml');
  const nkText = loadText(nkPath);
  if (nkText) {
    const OPEN_SPARK = new Set(['captured', 'triaged', 'deferred']);
    writeSnap('narrative-sparks-open.yaml', nkPath, filterYamlEntries(nkText, 'sparks', (b) => {
      const status = b.match(/status:\s*(\S+)/)?.[1];
      return status && OPEN_SPARK.has(status);
    }));
  }

  const ebPath = path.join(novelAbs, 'registries/emotional-beats.yaml');
  const ebText = loadText(ebPath);
  if (ebText) {
    writeSnap('emotional-beats-due.yaml', ebPath, filterYamlItems(ebText, (b) => {
      const planned = parseInt(b.match(/planned_chapter:\s*(\d+)/)?.[1] || '0', 10);
      const delivered = b.match(/delivered_chapter:\s*(\d+|null)?/)?.[1];
      return planned === chapter && (!delivered || delivered === 'null');
    }));
  }

  const cpPath = path.join(novelAbs, 'registries/cool-points.yaml');
  const cpText = loadText(cpPath);
  if (cpText) {
    writeSnap('cool-points-due.yaml', cpPath, filterYamlItems(cpText, (b) => {
      const planned = parseInt(b.match(/planned_chapter:\s*(\d+)/)?.[1] || '0', 10);
      const delivered = b.match(/delivered_chapter:\s*(\d+|null)?/)?.[1];
      return planned === chapter && (!delivered || delivered === 'null');
    }));
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
    fieldFilled(l2, 'prose_reference', 4) &&
    fieldFilled(l2, 'sentence_rhythm', 2) &&
    fieldFilled(l2, 'emotional_temperature', 2) &&
    (parseYamlInt(l2, 'target_chapters') ?? 0) >= 10 &&
    layerCompleted(l2);
  if (l2Ok) layers.l2 = 'complete';
  else if (!fs.existsSync(l2Path)) gaps.push('layer2: 缺少 seed/layer2-customize.yaml');
  else {
    if (!fieldFilled(l2, 'world_direction', 6)) gaps.push('layer2: world_direction 过短');
    if (!fieldFilled(l2, 'pov_tone', 4)) gaps.push('layer2: pov_tone 过短');
    if (!fieldFilled(l2, 'theme', 4)) gaps.push('layer2: theme 过短');
    if (!fieldFilled(l2, 'audience', 2)) gaps.push('layer2: audience 未填');
    if (!fieldFilled(l2, 'prose_reference', 4)) gaps.push('layer2: prose_reference 过短');
    if (!fieldFilled(l2, 'sentence_rhythm', 2)) gaps.push('layer2: sentence_rhythm 未填');
    if (!fieldFilled(l2, 'emotional_temperature', 2)) gaps.push('layer2: emotional_temperature 未填');
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

const STYLE_PROFILE_DIR = path.join(ROOT, 'harness/style-profiles');
const FRAMEWORK_SCAFFOLD_PATHS = [
  'canon/style/prose-profile.yaml',
  'canon/style/exemplars/positive.md',
  'canon/style/exemplars/negative.md',
  'state/checkpoints/prose-style.yaml',
  'canon/plot/story-engine.yaml',
  'registries/emotional-beats.yaml',
  'canon/INDEX.yaml',
  'registries/INDEX.yaml',
  'state/memory/INDEX.yaml',
];

export function countYamlListItems(text, key) {
  if (!text) return 0;
  const lines = text.split('\n');
  let inBlock = false;
  let count = 0;
  for (const line of lines) {
    if (new RegExp(`^${key}:`).test(line)) {
      inBlock = true;
      if (/:\s*\[\s*\]/.test(line)) return 0;
      continue;
    }
    if (inBlock) {
      if (/^\s+-\s+/.test(line)) count++;
      else if (/^\S/.test(line)) break;
    }
  }
  return count;
}

export function loadFrameworkCrutchWords() {
  const p = path.join(STYLE_PROFILE_DIR, 'ai-crutch-words.yaml');
  const text = loadText(p) || '';
  return [...text.matchAll(/^\s+-\s+(.+)$/gm)].map((m) => m[1].trim()).filter(Boolean);
}

export function resolveGenreProfileKey(seedGenreText, novelGenre) {
  const hay = `${seedGenreText || ''} ${novelGenre || ''}`.toLowerCase();
  const profiles = ['survival-puzzle', 'xuanhuan', 'mystery', 'romance', 'general'];
  for (const key of profiles) {
    if (key === 'general') continue;
    const raw = loadText(path.join(STYLE_PROFILE_DIR, `${key}.yaml`)) || '';
    const aliasBlock = raw.match(/^aliases:\s*\n([\s\S]*?)(?=^\S|$)/m)?.[1] || '';
    const aliases = [...aliasBlock.matchAll(/^\s+-\s+(.+)$/gm)].map((m) => m[1].trim());
    const label = raw.match(/^label:\s*(.+)$/m)?.[1]?.trim() || '';
    const keys = [key, label, ...aliases].filter(Boolean);
    if (keys.some((k) => hay.includes(String(k).toLowerCase()))) return key;
  }
  if (/无限流|生存游戏|解谜|规则怪谈|大逃杀|survival/.test(hay)) return 'survival-puzzle';
  if (/玄幻|修仙|仙侠|xuanhuan/.test(hay)) return 'xuanhuan';
  if (/悬疑|推理|惊悚|刑侦|mystery/.test(hay)) return 'mystery';
  if (/甜宠|言情|女性向|耽美|romance/.test(hay)) return 'romance';
  return novelGenre && fs.existsSync(path.join(STYLE_PROFILE_DIR, `${novelGenre}.yaml`))
    ? novelGenre
    : 'general';
}

export function loadProseProfileText(novelAbs) {
  return loadText(path.join(novelAbs, 'canon/style/prose-profile.yaml')) || '';
}

export function assessProseStyleReadiness(novelAbs) {
  const gaps = [];
  const profilePath = path.join(novelAbs, 'canon/style/prose-profile.yaml');
  const voicePath = path.join(novelAbs, 'canon/style/voice.md');
  const checkpointPath = path.join(novelAbs, 'state/checkpoints/prose-style.yaml');

  if (!fs.existsSync(profilePath)) {
    gaps.push('missing canon/style/prose-profile.yaml — run: forge sync framework');
    return { ready: false, gaps };
  }
  const profile = loadProseProfileText(novelAbs);
  const status = parseYamlScalar(profile, 'status');
  if (status !== 'ready') gaps.push('prose-profile status 须为 ready（@prose-style-architect）');
  const version = parseYamlInt(profile, 'version') ?? 0;
  if (version < 1) gaps.push('prose-profile version 须 ≥ 1');
  if (countYamlListItems(profile, 'signature_moves') < 2) gaps.push('signature_moves 须 ≥ 2 条');
  if (countYamlListItems(profile, 'anti_patterns') < 1) gaps.push('anti_patterns 须 ≥ 1 条');

  if (!fs.existsSync(voicePath)) gaps.push('missing canon/style/voice.md');
  else {
    const voice = loadText(voicePath) || '';
    const pov = voice.match(/^-?\s*POV[：:][ \t]*([^\n\r]*)/m)?.[1]?.trim();
    if (!pov || pov.length < 2 || pov === '：' || pov === ':') gaps.push('voice.md POV 未填写');
  }

  const posEx = path.join(novelAbs, 'canon/style/exemplars/positive.md');
  if (!fs.existsSync(posEx)) gaps.push('missing canon/style/exemplars/positive.md');
  else if ((loadText(posEx) || '').includes('待填写')) gaps.push('exemplars/positive.md 仍为模板占位');

  if (fs.existsSync(checkpointPath)) {
    const cp = loadText(checkpointPath) || '';
    if (parseYamlScalar(cp, 'completed') !== 'true') gaps.push('state/checkpoints/prose-style.yaml completed 须为 true');
  } else {
    gaps.push('missing state/checkpoints/prose-style.yaml');
  }

  return { ready: gaps.length === 0, gaps };
}

export function collectProseKillList(novelAbs) {
  const profile = loadProseProfileText(novelAbs);
  const bookTerms = [...(profile.match(/^kill_list:\s*\n([\s\S]*?)(?=^\S|$)/m)?.[1] || '').matchAll(/^\s+-\s+(.+)$/gm)].map(
    (m) => m[1].trim()
  );
  const useFramework = parseYamlScalar(profile, 'use_framework_crutch_list');
  const framework = useFramework !== 'false' ? loadFrameworkCrutchWords() : [];
  const voice = loadText(path.join(novelAbs, 'canon/style/voice.md')) || '';
  const forbiddenBlock = voice.match(/禁忌[用语：:]*\s*\n([\s\S]*?)(?:\n#|$)/)?.[1] || '';
  const voiceTerms = forbiddenBlock.split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean);
  return [...new Set([...bookTerms, ...framework, ...voiceTerms])].filter((t) => t.length >= 2);
}

export function validateTaskProseStyle(novelAbs, errors, warnings = []) {
  const { ready, gaps } = assessProseStyleReadiness(novelAbs);
  if (!ready) {
    for (const g of gaps) errors.push(`prose-style: ${g}`);
  }
  const profile = loadProseProfileText(novelAbs);
  if (profile && !parseYamlScalar(profile, 'genre_profile')) {
    warnings.push('prose-style: genre_profile 未设');
  }
}

export function syncFrameworkScaffolds(novelAbs, { copyMissing = true } = {}) {
  const templateRoot = path.join(ROOT, 'stories/_template');
  const copied = [];
  const existing = [];
  for (const rel of FRAMEWORK_SCAFFOLD_PATHS) {
    const dest = path.join(novelAbs, rel);
    if (fs.existsSync(dest)) {
      existing.push(rel);
      continue;
    }
    const src = path.join(templateRoot, rel);
    if (!fs.existsSync(src)) continue;
    if (copyMissing) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      copied.push(rel);
    }
  }
  const styleReady = assessProseStyleReadiness(novelAbs);
  const engineReady = assessStoryEngineReadiness(novelAbs);
  const agentTasks = [];
  if (!styleReady.ready) {
    agentTasks.push('@prose-style-architect — 填满 canon/style 与 prose-profile status:ready');
  }
  if (!engineReady.ready) {
    agentTasks.push('@conflict-architect — 填满 story-engine.yaml + emotional-beats + cool-points planned');
  }
  return { copied, existing, styleReady, engineReady, agentTasks };
}

/** Story engine scaffold filled (not placeholder). */
export function assessStoryEngineReadiness(novelAbs) {
  const gaps = [];
  const enginePath = path.join(novelAbs, 'canon/plot/story-engine.yaml');
  if (!fs.existsSync(enginePath)) {
    gaps.push('missing canon/plot/story-engine.yaml');
    return { ready: false, gaps };
  }
  const engine = loadText(enginePath) || '';
  const stmt = engine.match(/statement:\s*(.+)/)?.[1]?.trim() || '';
  if (stmt.length < 12 || /主角为守住 X/.test(stmt)) {
    gaps.push('story-engine throughline.statement 仍为模板占位');
  }
  if (countYamlListItems(engine, 'position_conflicts') < 1) {
    gaps.push('story-engine 缺 position_conflicts');
  }
  const ebPath = path.join(novelAbs, 'registries/emotional-beats.yaml');
  if (!fs.existsSync(ebPath)) gaps.push('missing registries/emotional-beats.yaml');
  return { ready: gaps.length === 0, gaps };
}

export function gateDraftingEntry(novelAbs, errors) {
  const phase = loadPhaseState(novelAbs);
  if (phase.phase === 'ideation') {
    errors.push('drafting tasks blocked in ideation — complete seed intake + bootstrap first');
    return;
  }
  if (phase.phase === 'worldbuilding') {
    errors.push('chapter/outlining tasks blocked in worldbuilding — finish world + characters + outline first');
    return;
  }
  if (phase.phase === 'drafting' || phase.phase === 'revision') {
    const { ready, gaps } = assessProseStyleReadiness(novelAbs);
    if (!ready) {
      errors.push(
        `prose style not ready — ${gaps.slice(0, 2).join('; ')}. Run: forge sync framework then @prose-style-architect`
      );
    }
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
  if (!fs.existsSync(path.join(novelAbs, 'canon/world/power-defects.yaml')))
    errors.push('worldbuilding: missing canon/world/power-defects.yaml');
}

export function validateTaskCharacters(novelAbs, errors) {
  const indexPath = path.join(novelAbs, 'canon/characters/index.yaml');
  if (!fs.existsSync(indexPath)) {
    errors.push('characters: missing canon/characters/index.yaml');
    return;
  }
  const indexText = loadText(indexPath) || '';
  const ids = [...indexText.matchAll(/^\s+-\s+id:\s*(\S+)/gm)].map((m) => m[1]);
  if (ids.length === 0) errors.push('characters: index.yaml has no character entries');
  for (const id of ids) {
    const md = path.join(novelAbs, `canon/characters/${id}.md`);
    if (!fs.existsSync(md)) errors.push(`characters: missing canon/characters/${id}.md for index id ${id}`);
  }
  const protagonists = (indexText.match(/role:\s*protagonist/g) || []).length;
  if (protagonists < 1) errors.push('characters: need at least one protagonist in index.yaml');
}

export function validateTaskCastNetwork(novelAbs, errors, warnings = []) {
  const rosterPath = path.join(novelAbs, 'canon/characters/cast-roster.yaml');
  if (!fs.existsSync(rosterPath)) {
    errors.push('cast-network: missing canon/characters/cast-roster.yaml');
    return;
  }
  const roster = loadText(rosterPath) || '';
  const graphPath = path.join(novelAbs, 'canon/entities/graph.yaml');
  if (!fs.existsSync(graphPath)) {
    errors.push('cast-network: missing canon/entities/graph.yaml');
    return;
  }
  const graph = loadText(graphPath) || '';
  const edgeCount = (graph.match(/type:\s*relation/g) || []).length;
  if (edgeCount < 3) warnings.push('cast-network: graph has fewer than 3 relation edges');
  const appearPath = path.join(novelAbs, 'registries/appearance-log.yaml');
  if (!fs.existsSync(appearPath)) errors.push('cast-network: missing registries/appearance-log.yaml');
  const indexIds = new Set(
    [...(loadText(path.join(novelAbs, 'canon/characters/index.yaml')) || '').matchAll(/^\s+-\s+id:\s*(\S+)/gm)].map(
      (m) => m[1]
    )
  );
  for (const m of roster.matchAll(/^\s+id:\s*(\S+)/gm)) {
    if (!indexIds.has(m[1])) errors.push(`cast-network: cast-roster id ${m[1]} not in index.yaml`);
  }
}

export function validateTaskPersonaVoice(novelAbs, errors, warnings = []) {
  const voicePath = path.join(novelAbs, 'canon/characters/voice-matrix.yaml');
  if (!fs.existsSync(voicePath)) {
    errors.push('persona-voice: missing canon/characters/voice-matrix.yaml');
    return;
  }
  const voice = loadText(voicePath) || '';
  const shiftPath = path.join(novelAbs, 'registries/persona-shifts.yaml');
  if (!fs.existsSync(shiftPath)) errors.push('persona-voice: missing registries/persona-shifts.yaml');
  const indexText = loadText(path.join(novelAbs, 'canon/characters/index.yaml')) || '';
  const coreIds = [];
  for (const block of indexText.split(/-\s+id:/).slice(1)) {
    const id = block.match(/^(\S+)/)?.[1];
    const role = block.match(/role:\s*(\S+)/)?.[1];
    if (id && (role === 'protagonist' || role === 'antagonist' || role === 'major')) coreIds.push(id);
  }
  for (const id of coreIds) {
    if (!new RegExp(`${id}:`, 'm').test(voice) && !voice.includes(`id: ${id}`)) {
      warnings.push(`persona-voice: voice-matrix may missing entry for ${id}`);
    }
  }
}

export function validateTaskOutlineBatch(novelAbs, chapter, errors, warnings = []) {
  const beatsPath = path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`);
  if (!fs.existsSync(beatsPath)) errors.push(`outline-batch: missing beats ch-${padChapter(chapter)}`);

  const enginePath = path.join(novelAbs, 'canon/plot/story-engine.yaml');
  if (!fs.existsSync(enginePath)) {
    errors.push('outline-batch: missing canon/plot/story-engine.yaml — run @conflict-architect');
  } else {
    const engine = loadText(enginePath) || '';
    if (!/throughline:/.test(engine) || !/statement:/.test(engine)) {
      errors.push('outline-batch: story-engine.yaml missing throughline.statement');
    }
    if (countYamlListItems(engine, 'position_conflicts') < 1) {
      warnings.push('outline-batch: story-engine needs >=1 position_conflicts');
    }
    if (countYamlListItems(engine, 'character_tensions') < 1) {
      warnings.push('outline-batch: story-engine needs >=1 character_tensions');
    }
  }

  if (!fs.existsSync(path.join(novelAbs, 'registries/emotional-beats.yaml'))) {
    warnings.push('outline-batch: missing registries/emotional-beats.yaml');
  }

  const beats = loadText(beatsPath) || '';
  if (beats && !beatsHasRegistryList(beats, 'conflict_active')) {
    warnings.push(`outline-batch: ch-${padChapter(chapter)} beats missing conflict_active`);
  }
  if (beats && !beatsHasFieldLine(beats, 'throughline_touch')) {
    warnings.push(`outline-batch: ch-${padChapter(chapter)} beats missing throughline_touch`);
  }
  const hasCp = beatsHasRegistryList(beats, 'cool_points');
  const hasEb = beatsHasRegistryList(beats, 'emotional_beats');
  if (beats && !hasCp && !hasEb) {
    warnings.push(`outline-batch: ch-${padChapter(chapter)} beats need cool_points or emotional_beats`);
  }
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
  const ebIds = registryIds(loadText(path.join(novelAbs, 'registries/emotional-beats.yaml')));
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
    for (const m of beats.matchAll(/emotional_beats:\s*\[([^\]]+)\]/g)) {
      for (const id of m[1].split(',').map((s) => s.trim())) {
        if (id && !ebIds.has(id)) errors.push(`ch-${padChapter(ch)} beats refs unknown emotional-beat ${id}`);
      }
    }
  }

  if (lastCompleted > 0 && cgIds.size === 0 && fsIds.size > 0) {
    warnings.push('chekhov-guns.yaml empty while foreshadowing has items — consider foreshadow-engineer sync');
  }
}

/** High-priority session-collect questions without author_ack block advance. */
export function assessSessionCollect(novelAbs) {
  const t = loadText(path.join(novelAbs, 'state/working/session-collect.yaml')) || '';
  const unackedHigh = [];
  for (const block of t.split(/-\s+id:/).slice(1)) {
    const id = block.match(/^(\S+)/)?.[1]?.trim();
    const priority = block.match(/priority:\s*(\S+)/)?.[1]?.trim();
    const ack = /author_ack:\s*true/.test(block);
    if (id && priority === 'high' && !ack) unackedHigh.push(id);
  }
  return { ok: unackedHigh.length === 0, unackedHigh };
}

/** Scaffold revision triple when review FAIL (patch-cycle entry). */
export function scaffoldRevisionRound(novelAbs, chapter, round) {
  const padded = padChapter(chapter);
  const dir = path.join(novelAbs, 'state/revisions', `ch-${padded}-r${round}`);
  fs.mkdirSync(dir, { recursive: true });
  const msPath = path.join(novelAbs, `manuscripts/chapters/ch-${padded}.md`);
  const origPath = path.join(dir, 'original.md');
  if (!fs.existsSync(origPath) && fs.existsSync(msPath)) {
    fs.copyFileSync(msPath, origPath);
  }
  for (const f of ['patch.md', 'diff.md']) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) fs.writeFileSync(p, '', 'utf8');
  }
  return dir;
}

/** appearance-log character ids should exist as nodes in graph.yaml */
export function validateAppearanceGraphSync(novelAbs, chapter, warnings, errors, strict = false) {
  const graph = loadText(path.join(novelAbs, 'canon/entities/graph.yaml')) || '';
  const nodeIds = new Set([...graph.matchAll(/-\s+id:\s*(\S+)/g)].map((m) => m[1]));
  const appear = loadText(path.join(novelAbs, 'registries/appearance-log.yaml')) || '';
  const chAppearances = [...appear.matchAll(/character_id:\s*(\S+)[\s\S]*?chapter:\s*(\d+)/g)]
    .filter((m) => parseInt(m[2], 10) === chapter)
    .map((m) => m[1]);
  const missing = [...new Set(chAppearances)].filter((id) => !nodeIds.has(id));
  if (!missing.length) return;
  const msg = `ch-${padChapter(chapter)} appearance-log ids missing in graph.yaml: ${missing.join(', ')} — delegate cast-network-weaver`;
  if (strict) errors.push(msg);
  else warnings.push(msg);
}

/** Sync per-novel harness/read-order.md after phase advance. */
export function syncReadOrderOnAdvance(novelAbs, completedChapter) {
  const p = path.join(novelAbs, 'harness/read-order.md');
  if (!fs.existsSync(p)) return;
  const nextCh = completedChapter + 1;
  let text = loadText(p) || '';
  text = text.replace(
    /## 当前阶段：[^\n]*/,
    `## 当前阶段：drafting · 第 ${nextCh} 章写作（已完成 ${completedChapter} 章）`
  );
  fs.writeFileSync(p, text, 'utf8');
}

export function validateContinuityArtifacts(novelAbs, lastCompleted, errors, warnings) {
  for (let ch = 1; ch <= lastCompleted; ch++) {
    const padded = padChapter(ch);
    const summaryPath = path.join(novelAbs, `state/memory/chapter-summaries/ch-${padded}.yaml`);
    const retentionPath = path.join(novelAbs, `state/retention/ch-${padded}.yaml`);
    if (!fs.existsSync(summaryPath)) errors.push(`missing chapter-summary ch-${padded} (required after continuity)`);
    if (!fs.existsSync(retentionPath)) errors.push(`missing retention ch-${padded} (retention-analyst)`);

    validateAppearanceGraphSync(novelAbs, ch, warnings, errors, false);

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
  validateStateEvolutionLogs(novelAbs, warnings);
  validateNarrativeSparks(novelAbs, warnings);
}

/** promoted sparks should have linked_registry_id or promotion_target beats path */
export function validateNarrativeSparks(novelAbs, warnings) {
  const nkText = loadText(path.join(novelAbs, 'registries/narrative-sparks.yaml'));
  if (!nkText) return;
  for (const block of [...nkText.matchAll(/(^|\n)(-\s+id:[\s\S]*?)(?=\n-\s+id:|\nsparks:|$)/g)].map((m) => m[2])) {
    const eid = block.match(/^\s*-\s+id:\s*(\S+)/m)?.[1];
    const status = block.match(/status:\s*(\S+)/)?.[1];
    const tier = block.match(/impact_tier:\s*(\S+)/)?.[1];
    const ack = block.match(/author_ack:\s*(\S+)/)?.[1];
    const linked = block.match(/linked_registry_id:\s*(\S+)/)?.[1];
    if (status === 'promoted' && (!linked || linked === 'null')) {
      warnings.push(`narrative-sparks ${eid}: promoted but missing linked_registry_id`);
    }
    if ((tier === 'arc' || tier === 'outline') && status === 'promoted' && ack !== 'true') {
      warnings.push(`narrative-sparks ${eid}: ${tier} promotion requires author_ack: true`);
    }
  }
}

/** character-state-log / world-state-log entity refs should resolve to index/graph */
export function validateStateEvolutionLogs(novelAbs, warnings) {
  const indexText = loadText(path.join(novelAbs, 'canon/characters/index.yaml')) || '';
  const charIds = new Set([...indexText.matchAll(/-\s+id:\s*(\S+)/g)].map((m) => m[1]));
  const graphText = loadText(path.join(novelAbs, 'canon/entities/graph.yaml')) || '';
  const graphIds = new Set([...graphText.matchAll(/-\s+id:\s*(\S+)/g)].map((m) => m[1]));

  const cslText = loadText(path.join(novelAbs, 'registries/character-state-log.yaml'));
  if (cslText) {
    for (const block of [...cslText.matchAll(/(^|\n)(-\s+id:[\s\S]*?)(?=\n-\s+id:|\nentries:|$)/g)].map((m) => m[2])) {
      const cid = block.match(/character_id:\s*(\S+)/)?.[1];
      const eid = block.match(/^\s*-\s+id:\s*(\S+)/m)?.[1];
      if (cid && charIds.size > 0 && !charIds.has(cid)) {
        warnings.push(`character-state-log ${eid}: character_id "${cid}" not in index.yaml`);
      }
    }
  }

  const wslText = loadText(path.join(novelAbs, 'registries/world-state-log.yaml'));
  if (wslText) {
    for (const block of [...wslText.matchAll(/(^|\n)(-\s+id:[\s\S]*?)(?=\n-\s+id:|\nentries:|$)/g)].map((m) => m[2])) {
      const entityId = block.match(/entity_id:\s*(\S+)/)?.[1];
      const eid = block.match(/^\s*-\s+id:\s*(\S+)/m)?.[1];
      if (entityId && graphIds.size > 0 && !graphIds.has(entityId)) {
        warnings.push(`world-state-log ${eid}: entity_id "${entityId}" not in graph.yaml`);
      }
    }
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
    for (const name of resolveSummaryCharacterNames(novelAbs, summary)) {
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

export function reviewPersonaVoice(novelAbs, chapter, text, results) {
  const voicePath = path.join(novelAbs, 'canon/characters/voice-matrix.yaml');
  const shiftsPath = path.join(novelAbs, 'registries/persona-shifts.yaml');
  if (!fs.existsSync(voicePath)) {
    results.dimensions.push({ id: 'persona_voice', pass: true, msg: 'no voice-matrix yet' });
    return;
  }
  const voice = loadText(voicePath) || '';
  const shifts = loadText(shiftsPath) || '';
  const forbiddenHits = [];
  for (const m of voice.matchAll(/forbidden_ooc:\s*\n((?:\s+-\s+.+\n?)+)/g)) {
    const block = m[1];
    for (const line of block.matchAll(/-\s+(.+)/g)) {
      const phrase = line[1].trim();
      if (phrase.length >= 2 && text.includes(phrase)) forbiddenHits.push(phrase);
    }
  }
  const activeShifts = [];
  for (const block of shifts.split(/-\s+id:/).slice(1)) {
    const status = block.match(/status:\s*(\S+)/)?.[1];
    const fromCh = parseInt(block.match(/active_from_ch:\s*(\d+)/)?.[1] || '0', 10);
    const charId = block.match(/^(\S+)/)?.[1];
    if (status === 'active' && fromCh > 0 && fromCh <= chapter && charId) activeShifts.push(charId);
  }
  const pass = forbiddenHits.length === 0;
  results.dimensions.push({
    id: 'persona_voice',
    pass,
    msg: pass
      ? `active_shifts=${activeShifts.length}`
      : `forbidden_ooc_hits=${forbiddenHits.join(',')}`,
  });
  if (!pass) {
    pushActionItem(results, {
      dimension: 'persona_voice',
      delegate_skill: 'dialogue-craftsman',
      message: '对白触犯 voice-matrix forbidden_ooc 或转变后声线漂移',
      hint: '对照 voice-matrix 与 persona-shifts voice_delta 润色对话',
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

export function reviewEmotionalBeatDelivery(novelAbs, chapter, text, results) {
  const beats = loadText(path.join(novelAbs, `canon/plot/beats/ch-${padChapter(chapter)}.md`)) || '';
  const refs = beatsEmotionalBeatRefs(beats);
  if (!refs.length) {
    results.dimensions.push({ id: 'emotional_beat_delivery', pass: true, msg: 'no emotional_beats in beats' });
    return;
  }
  const ebYaml = loadText(path.join(novelAbs, 'registries/emotional-beats.yaml')) || '';
  const undelivered = refs.filter((id) => {
    const block = ebYaml.match(new RegExp(`-\\s+id:\\s*${id}[\\s\\S]*?(?=\\n-\\s+id:|$)`));
    if (!block) return true;
    const delivered = parseInt(block[0].match(/delivered_chapter:\s*(\d+)/)?.[1] || '0', 10);
    return delivered !== chapter;
  });
  const pass = undelivered.length === 0;
  results.dimensions.push({
    id: 'emotional_beat_delivery',
    pass,
    msg: pass ? `registry_delivered=${refs.length}` : `undelivered=${undelivered.join(',')}`,
  });
  if (!pass) {
    pushActionItem(results, {
      dimension: 'emotional_beat_delivery',
      delegate_skill: 'patch-refiner',
      message: 'beats 登记的情绪节拍未在本章兑现',
      hint: '更新 registries/emotional-beats.yaml delivered_chapter 或补写哭点/共鸣场景',
    });
  }
}

/** 正文 meta 规则（登记册/章号/框架术语不得进 manuscripts） */
export const PROSE_META_RULES = [
  { re: /\bch\d+\b/gi, label: '章编号 meta (chN)' },
  { re: /\b(hk|fs|ot|cg|cp|eb|pd)-\d{3}\b/gi, label: '登记册 id 泄漏' },
  { re: /表世界/g, label: '框架术语「表世界」' },
  { re: /缺陷链/g, label: '框架术语「缺陷链」' },
  { re: /这本书/g, label: '打破第四墙「这本书」' },
  { re: /(同桌线[，,]|三巷名入档|首见、)/g, label: '作者弧光摘要语' },
  { re: /留到\s*ch\d+/gi, label: '远期章号 meta' },
  { re: /一个钩子，终于/g, label: '钩子/meta 收束语' },
  { re: /关键道具/g, label: '作者视角「关键道具」' },
  { re: /埋设\s*fs-/gi, label: 'beats 指令泄漏' },
  { re: /作者(埋|锁|注)/g, label: '作者指令语' },
];

export function scanProseMeta(body) {
  const hits = [];
  for (const { re, label } of PROSE_META_RULES) {
    const m = body.match(re);
    if (m?.length) hits.push(`${label}×${m.length}`);
  }
  return hits;
}

/** 反凑字/反重复章末（padding） */
export function scanProsePadding(body, reviewCfg = null) {
  const cfg = reviewCfg || loadReviewConfig();
  const hits = [];
  const dayEnd = body.match(/第[一二三四五六七八九十\d]+日尽/g) || [];
  const maxDayEnd = cfg.maxClosingDayEndMarkers ?? 1;
  if (dayEnd.length > maxDayEnd) {
    hits.push(`重复「第N日尽」章末收束×${dayEnd.length}（上限 ${maxDayEnd}）`);
  }
  const closing = body.slice(Math.floor(body.length * 0.65));
  const arcPat = /(线[，,]?\s*起|线[，,]?\s*收|入档|首见、|定心丸|最早的呼吸|第二口气)/g;
  const arcHits = closing.match(arcPat) || [];
  const maxArc = cfg.maxClosingArcSummaryHits ?? 1;
  if (arcHits.length > maxArc) {
    hits.push(`章末弧光/摘要语堆叠×${arcHits.length}`);
  }
  const sentences = closing.split(/[。！？\n]/).filter((s) => countChineseChars(s) > 10);
  const seen = new Map();
  for (const s of sentences) {
    const key = s.trim().slice(0, 18);
    if (key.length < 8) continue;
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  for (const [k, n] of seen) {
    if (n >= 2) {
      hits.push(`章末重复句「${k}…」×${n}`);
      break;
    }
  }
  return hits;
}

export function scanProseIntegrity(body, reviewCfg = null) {
  const meta = scanProseMeta(body);
  const padding = scanProsePadding(body, reviewCfg);
  const errors = [...meta, ...padding];
  return { ok: errors.length === 0, errors, meta, padding };
}

export function reviewMetaProseLeakage(chapter, text, results) {
  const body = text.replace(/^---[\s\S]*?---\s*/, '');
  const hits = scanProseMeta(body);
  const pass = hits.length === 0;
  results.dimensions.push({
    id: 'meta_prose_leakage',
    pass,
    msg: pass ? 'ok' : hits.slice(0, 4).join('; '),
  });
  if (!pass) {
    results.pass = false;
    pushActionItem(results, {
      dimension: 'meta_prose_leakage',
      delegate_skill: 'patch-refiner',
      severity: 'error',
      message: `正文含框架/登记册 meta：${hits.slice(0, 3).join('; ')}`,
      hint: '删除 chN、hk-/fs- id、表世界/缺陷链/这本书等；登记只写 registries，不进 manuscripts',
    });
  }
}

export function reviewAntiPadding(chapter, text, results) {
  const body = text.replace(/^---[\s\S]*?---\s*/, '');
  const hits = scanProsePadding(body);
  const pass = hits.length === 0;
  results.dimensions.push({
    id: 'anti_padding',
    pass,
    msg: pass ? 'ok' : hits.slice(0, 3).join('; '),
  });
  if (!pass) {
    results.pass = false;
    pushActionItem(results, {
      dimension: 'anti_padding',
      delegate_skill: 'patch-refiner',
      severity: 'error',
      message: `章末凑字/重复收束：${hits.slice(0, 2).join('; ')}`,
      hint: '删重复「第N日尽」与弧光摘要；扩 beats 中段，禁止堆章末说明文',
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

export function loadWritingPlan(novelAbs) {
  const p = path.join(novelAbs, 'state/writing-plan.json');
  const defaults = {
    version: 1,
    minWordsPerChapter: 2000,
    minWordsHardFail: 1600,
    maxWordsPerChapter: 4500,
    maxChaptersPerSession: 2,
    maxChaptersPerBatch: 2,
    writingMode: 'serial',
  };
  if (!fs.existsSync(p)) return defaults;
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(p, 'utf8')) };
  } catch (_) {
    return defaults;
  }
}

/** 新会话接力包 — 写入 state/working/session-relay.md */
export function writeSessionRelay(novelAbs, novelRoot, nextStepSummary = null) {
  const phase = loadPhaseState(novelAbs);
  const plan = loadWritingPlan(novelAbs);
  const novelYaml = loadText(path.join(novelAbs, 'novel.yaml')) || '';
  const title = parseYamlScalar(novelYaml, 'title') || parseYamlScalar(novelYaml, 'id') || 'unknown';
  const id = parseYamlScalar(novelYaml, 'id') || 'unknown';
  const lastCh = phase.last_completed_chapter || 0;
  const currentCh = phase.current_chapter || 1;
  const summaryRolling = loadText(path.join(novelAbs, 'state/memory/summary-rolling.md')) || '（尚无滚动摘要）';
  const collectPath = path.join(novelAbs, 'state/working/session-collect.yaml');
  const collect = loadText(collectPath) || 'questions: []\n';
  const agents = loadText(path.join(novelAbs, 'AGENTS.md'));
  const readOrder = loadText(path.join(novelAbs, 'harness/read-order.md'));

  const relayDir = path.join(novelAbs, 'state/working');
  if (!fs.existsSync(relayDir)) fs.mkdirSync(relayDir, { recursive: true });

  const nextBlock = nextStepSummary
    ? typeof nextStepSummary === 'string'
      ? nextStepSummary
      : JSON.stringify(nextStepSummary, null, 2)
    : '运行 `pnpm forge next` 获取当前 Skill';

  const body = `# 会话接力包（Session Relay）

> 自动生成 · ${new Date().toISOString().slice(0, 19)}  
> **新会话/新模型请先读本文**，再读 \`harness/read-order.md\`。

## 本书快照

| 项 | 值 |
|----|-----|
| id | ${id} |
| 书名 | ${title} |
| phase | ${phase.phase} · ${phase.sub_phase || '-'} |
| 已完成章 | ${lastCh} |
| 当前写作章 | ${currentCh} |

## 生产约束（writing-plan.json）

- 单章目标 band：${plan.minWordsPerChapter}–${plan.maxWordsPerChapter} 汉字（review 硬下限 ${plan.minWordsHardFail ?? Math.max(1800, plan.minWordsPerChapter - 800)}；未达目标仅 warn）
- **单次对话最多写 ${plan.maxChaptersPerSession} 章正文**（超过须新开会话）
- batch-planner 硬上限：每批 ≤ ${plan.maxChaptersPerBatch} 章 beats

## 下一步

${nextBlock}

## 待作者确认（session-collect）

\`\`\`yaml
${collect.trim()}
\`\`\`

## 滚动摘要（节选）

${summaryRolling.slice(0, 2000)}${summaryRolling.length > 2000 ? '\n\n…（完整见 state/memory/summary-rolling.md）' : ''}

## 本书铁律摘要

${agents ? agents.split('\n').filter((l) => l.includes('铁律') || l.match(/^\d+\./)).slice(0, 12).join('\n') : '见 AGENTS.md'}

## 命令速查

\`\`\`bash
pnpm forge next ${novelRoot.replace(/\\/g, '/')}
pnpm forge doctor ${novelRoot.replace(/\\/g, '/')} --chapter ${currentCh}
pnpm forge nav build ${novelRoot.replace(/\\/g, '/')} --chapter ${currentCh}
pnpm forge manifest chapter-draft ${novelRoot.replace(/\\/g, '/')} --chapter ${currentCh}
pnpm forge relay refresh ${novelRoot.replace(/\\/g, '/')}
\`\`\`

## 新会话粘贴块（复制到新对话第一条）

\`\`\`
Novel Forge 续写《${title}》· id=${id}
书目录：${novelRoot.replace(/\\/g, '/')}
请先读：state/working/session-relay.md → harness/read-order.md → AGENTS.md
再执行：
  pnpm forge doctor "${novelRoot.replace(/\\/g, '/')}" --chapter ${currentCh}
  pnpm forge next "${novelRoot.replace(/\\/g, '/')}"
只扮演一个 Skill；单会话≤${plan.maxChaptersPerSession}章正文；circuit_state=red 须先 forge nav rebuild。
\`\`\`

详见 \`harness/SESSION-START.md\` 与框架 \`skills/guides/new-session-onboarding.md\`
`;
  const outPath = path.join(relayDir, 'session-relay.md');
  fs.writeFileSync(outPath, body, 'utf8');
  return outPath;
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
