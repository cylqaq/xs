/**
 * Context Budget / Navigation helpers (v2 · 第十轮)
 * 协议：docs/architecture/context-budget-system.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadText, padChapter, parseYamlScalar, parseYamlInt, setYamlField } from './forge-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

const NAV_INDEX_PATHS = [
  'canon/INDEX.yaml',
  'registries/INDEX.yaml',
  'state/memory/INDEX.yaml',
];

export function loadContextBudget() {
  const p = path.join(REPO_ROOT, 'harness/context-budget.yaml');
  const text = loadText(p) || '';
  const totalKb = parseInt(text.match(/^total_budget_kb:\s*(\d+)/m)?.[1] || '60', 10);
  const hardCapKb = parseInt(text.match(/^hard_total_cap_kb:\s*(\d+)/m)?.[1] || '72', 10);
  const warnRatio = parseFloat(text.match(/^warn_at_ratio:\s*([\d.]+)/m)?.[1] || '0.85');
  const navCapKb = parseInt(text.match(/^nav_total_cap_kb:\s*(\d+)/m)?.[1] || '6', 10);
  const navMaxAge = parseInt(text.match(/^nav_max_age_chapters:\s*(\d+)/m)?.[1] || '5', 10);
  const navFirst = /^navigation_first:\s*true/m.test(text);
  return { totalKb, hardCapKb, warnRatio, navCapKb, navMaxAge, navFirst };
}

export function loadNavIndices(novelAbs) {
  const out = {};
  for (const rel of NAV_INDEX_PATHS) {
    const fp = path.join(novelAbs, rel);
    out[rel] = {
      exists: fs.existsSync(fp),
      bytes: fs.existsSync(fp) ? fs.statSync(fp).size : 0,
      last_synced: null,
      last_rebuilt_at: null,
    };
    if (out[rel].exists) {
      const t = loadText(fp) || '';
      const lc = parseYamlInt(t, 'last_synced_chapter');
      const lcc = parseYamlInt(t, 'last_completed_chapter');
      out[rel].last_synced = lcc ?? lc ?? 0;
      out[rel].last_rebuilt_at = parseYamlScalar(t, 'last_rebuilt_at') || '';
    }
  }
  const totalBytes = Object.values(out).reduce((s, v) => s + v.bytes, 0);
  return { files: out, total_bytes: totalBytes };
}

export function assessContextHealth(novelAbs, chapter, opts = {}) {
  const budget = loadContextBudget();
  const nav = loadNavIndices(novelAbs);
  const warnings = [];
  const errors = [];

  for (const rel of NAV_INDEX_PATHS) {
    const meta = nav.files[rel];
    if (!meta.exists) {
      warnings.push('missing nav index: ' + rel + ' (run: forge nav rebuild)');
      continue;
    }
    if (chapter && meta.last_synced != null) {
      const dist = chapter - meta.last_synced;
      if (dist > budget.navMaxAge) {
        warnings.push(rel + ' stale (last_synced=' + meta.last_synced + ', distance=' + dist + ')');
      }
    }
  }

  const navKb = Math.ceil(nav.total_bytes / 1024);
  if (navKb > budget.navCapKb) {
    warnings.push('nav indices total ' + navKb + 'KB > cap ' + budget.navCapKb + 'KB — 须收敛');
  }

  let manifestBytes = 0;
  let skippedOnDemand = 0;
  let snapshotSavings = 0;

  // snapshot 文件名映射（original → snapshot）
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

  if (opts.manifestSections) {
    const novelPrefix = novelAbs.replace(/\\/g, '/') + '/';
    const padded = chapter ? padChapter(chapter) : '001';
    const snapDir = path.join(novelAbs, 'state/working/context-snapshot-ch-' + padded);

    for (const meta of opts.manifestSections.beforeMeta || []) {
      // on_demand 文件默认不计入预算（需显式请求）
      if (meta.source === 'on_demand') {
        skippedOnDemand++;
        continue;
      }

      const exists = fs.existsSync(meta.path);
      if (!exists) continue;

      const fullSize = fs.statSync(meta.path).size;

      // snapshot 文件用 snapshot 大小（如果 snapshot 存在）
      if (meta.snapshot && snapDir) {
        const basename = path.basename(meta.path);
        const snapName = SNAP_NAME_MAP[basename] || basename;
        const snapPath = path.join(snapDir, snapName);
        if (fs.existsSync(snapPath)) {
          const snapSize = fs.statSync(snapPath).size;
          manifestBytes += snapSize;
          snapshotSavings += (fullSize - snapSize);
          continue;
        }
      }

      manifestBytes += fullSize;
    }
  }
  const manifestKb = Math.ceil(manifestBytes / 1024);
  const totalKb = navKb + manifestKb;
  const ratio = totalKb / budget.totalKb;

  let circuit = 'green';
  if (totalKb >= budget.hardCapKb) circuit = 'red';
  else if (ratio >= budget.warnRatio) circuit = 'yellow';

  if (circuit === 'red') {
    errors.push('context BUDGET RED: ' + totalKb + 'KB ≥ hard cap ' + budget.hardCapKb + 'KB — 强制 navigator');
  } else if (circuit === 'yellow') {
    warnings.push('context BUDGET YELLOW: ' + totalKb + 'KB / ' + budget.totalKb + 'KB (' + Math.round(ratio * 100) + '%)');
  }

  return {
    budget,
    nav,
    nav_kb: navKb,
    manifest_kb: manifestKb,
    total_kb: totalKb,
    ratio,
    circuit_state: circuit,
    warnings,
    errors,
    skipped_on_demand: skippedOnDemand,
    snapshot_savings_kb: Math.ceil(snapshotSavings / 1024),
  };
}

export function writeCircuitState(novelAbs, circuit) {
  const indexPath = path.join(novelAbs, 'state/memory/INDEX.yaml');
  if (!fs.existsSync(indexPath)) return;
  setYamlField(indexPath, 'circuit_state', circuit);
}

export function rebuildNavIndices(novelAbs, chapter = null) {
  const reports = [];
  const lastCh = chapter || parseYamlInt(loadText(path.join(novelAbs, 'state/phase.yaml')) || '', 'last_completed_chapter') || 0;
  const nowIso = new Date().toISOString();

  const charIndex = path.join(novelAbs, 'canon/characters/index.yaml');
  if (fs.existsSync(charIndex)) {
    const navPath = path.join(novelAbs, 'canon/INDEX.yaml');
    if (fs.existsSync(navPath)) {
      setYamlField(navPath, 'last_synced_chapter', lastCh);
      setYamlField(navPath, 'last_rebuilt_at', '"' + nowIso + '"');
      reports.push('updated canon/INDEX.yaml header');
    }
  }
  const regNavPath = path.join(novelAbs, 'registries/INDEX.yaml');
  if (fs.existsSync(regNavPath)) {
    setYamlField(regNavPath, 'last_synced_chapter', lastCh);
    setYamlField(regNavPath, 'last_rebuilt_at', '"' + nowIso + '"');
    reports.push('updated registries/INDEX.yaml header');
  }
  const memNavPath = path.join(novelAbs, 'state/memory/INDEX.yaml');
  if (fs.existsSync(memNavPath)) {
    setYamlField(memNavPath, 'last_completed_chapter', lastCh);
    setYamlField(memNavPath, 'last_rebuilt_at', '"' + nowIso + '"');
    reports.push('updated state/memory/INDEX.yaml header');
  }
  return reports;
}

/**
 * 收敛 NAV INDEX 文件，使其符合 cap 限制
 * 策略：
 * 1. 截断 hot_state_refs 到 max 5 条
 * 2. 截断 delivered_recent 到 max 5 条
 * 3. 缩短 notes 字段
 * 4. 归档旧条目
 */
export function convergeNavIndices(novelAbs, options = {}) {
  const maxHotRefs = options.maxHotRefs || 5;
  const maxDelivered = options.maxDelivered || 5;
  const maxNotesLen = options.maxNotesLen || 100;
  const reports = [];

  // 收敛 canon/INDEX.yaml
  const canonPath = path.join(novelAbs, 'canon/INDEX.yaml');
  if (fs.existsSync(canonPath)) {
    let text = loadText(canonPath) || '';
    let changed = false;

    // 截断 hot_state_refs
    const hotRefPattern = /hot_state_refs:\s*\[([^\]]*)\]/g;
    let match;
    while ((match = hotRefPattern.exec(text)) !== null) {
      const refs = match[1].split(',').map(s => s.trim()).filter(Boolean);
      if (refs.length > maxHotRefs) {
        const truncated = refs.slice(-maxHotRefs);
        text = text.replace(match[0], `hot_state_refs: [${truncated.join(', ')}]`);
        changed = true;
      }
    }

    // 缩短 notes 字段
    const notesPattern = /notes:\s*"([^"]*)"/g;
    while ((match = notesPattern.exec(text)) !== null) {
      if (match[1].length > maxNotesLen) {
        const shortened = match[1].slice(0, maxNotesLen) + '...';
        text = text.replace(match[0], `notes: "${shortened}"`);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(canonPath, text, 'utf8');
      reports.push(`converged canon/INDEX.yaml (hot_refs: ${maxHotRefs}, notes: ${maxNotesLen})`);
    }
  }

  // 收敛 registries/INDEX.yaml
  const regPath = path.join(novelAbs, 'registries/INDEX.yaml');
  if (fs.existsSync(regPath)) {
    let text = loadText(regPath) || '';
    let changed = false;

    // 截断 hot_refs
    const hotRefPattern = /hot_refs:\s*\[([^\]]*)\]/g;
    let match;
    while ((match = hotRefPattern.exec(text)) !== null) {
      const refs = match[1].split(',').map(s => s.trim()).filter(Boolean);
      if (refs.length > maxHotRefs) {
        const truncated = refs.slice(-maxHotRefs);
        text = text.replace(match[0], `hot_refs: [${truncated.join(', ')}]`);
        changed = true;
      }
    }

    // 截断 delivered_recent
    const deliveredPattern = /delivered_recent:\s*\[([^\]]*)\]/g;
    while ((match = deliveredPattern.exec(text)) !== null) {
      const items = match[1].split(',').map(s => s.trim()).filter(Boolean);
      if (items.length > maxDelivered) {
        const truncated = items.slice(-maxDelivered);
        text = text.replace(match[0], `delivered_recent: [${truncated.join(', ')}]`);
        changed = true;
      }
    }

    // 截断 index_summary 条目（保留最近 5 条）
    const summaryPattern = /index_summary:\s*\n((?:\s+-\s+.*\n)*)/g;
    while ((match = summaryPattern.exec(text)) !== null) {
      const lines = match[1].split('\n').filter(l => l.trim());
      if (lines.length > 5) {
        const truncated = lines.slice(-5);
        const newSummary = `index_summary:\n${truncated.join('\n')}\n`;
        text = text.replace(match[0], newSummary);
        changed = true;
      }
    }

    // 截断 closed_recent 条目（保留最近 3 条）
    const closedPattern = /closed_recent:\s*\n((?:\s+-\s+.*\n)*)/g;
    while ((match = closedPattern.exec(text)) !== null) {
      const lines = match[1].split('\n').filter(l => l.trim());
      if (lines.length > 3) {
        const truncated = lines.slice(-3);
        const newClosed = `closed_recent:\n${truncated.join('\n')}\n`;
        text = text.replace(match[0], newClosed);
        changed = true;
      }
    }

    // 截断 hot 条目（保留最近 3 条）
    const hotPattern = /hot:\s*\n((?:\s+-\s+.*\n)*)/g;
    while ((match = hotPattern.exec(text)) !== null) {
      const lines = match[1].split('\n').filter(l => l.trim());
      if (lines.length > 3) {
        const truncated = lines.slice(-3);
        const newHot = `hot:\n${truncated.join('\n')}\n`;
        text = text.replace(match[0], newHot);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(regPath, text, 'utf8');
      reports.push(`converged registries/INDEX.yaml (hot_refs: ${maxHotRefs}, delivered: ${maxDelivered})`);
    }
  }

  // 收敛 state/memory/INDEX.yaml
  const memPath = path.join(novelAbs, 'state/memory/INDEX.yaml');
  if (fs.existsSync(memPath)) {
    let text = loadText(memPath) || '';
    let changed = false;

    // 缩短 notes 字段（更宽松的匹配）
    const notesMatch = text.match(/notes:\s*"([^"]*(?:"[^"]*")*[^"]*)"/);
    if (notesMatch && notesMatch[1].length > maxNotesLen) {
      const shortened = notesMatch[1].slice(0, maxNotesLen) + '...';
      text = text.replace(notesMatch[0], `notes: "${shortened}"`);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(memPath, text, 'utf8');
      reports.push(`converged state/memory/INDEX.yaml (notes: ${maxNotesLen})`);
    }
  }

  return reports;
}

export function formatDoctorReport(novelRoot, check, chapter) {
  const lines = [];
  lines.push('# Doctor | ' + novelRoot + ' | ch-' + (chapter ? padChapter(chapter) : '?'));
  lines.push('');
  const icon = check.circuit_state === 'green' ? '✓' : check.circuit_state === 'yellow' ? '⚠' : '✗';
  lines.push(icon + ' circuit_state: ' + check.circuit_state);
  lines.push('  nav: ' + check.nav_kb + ' KB / cap ' + check.budget.navCapKb + ' KB');
  lines.push('  manifest: ' + check.manifest_kb + ' KB');
  if (check.skipped_on_demand > 0) {
    lines.push('  skipped_on_demand: ' + check.skipped_on_demand + ' files');
  }
  if (check.snapshot_savings_kb > 0) {
    lines.push('  snapshot_savings: ' + check.snapshot_savings_kb + ' KB');
  }
  lines.push('  total: ' + check.total_kb + ' KB / budget ' + check.budget.totalKb + ' KB / hard ' + check.budget.hardCapKb + ' KB (' + Math.round(check.ratio * 100) + '%)');
  lines.push('');
  for (const w of check.warnings) lines.push('⚠ ' + w);
  for (const e of check.errors) lines.push('✗ ' + e);
  if (!check.warnings.length && !check.errors.length) lines.push('✓ no issues');
  return lines.join('\n');
}

/**
 * Snapshot 质量审计
 * 检查 snapshot 是否有效压缩、是否缺失关键条目
 */
export function auditSnapshots(novelAbs, chapter) {
  const padded = padChapter(chapter);
  const snapDir = path.join(novelAbs, 'state/working', `context-snapshot-ch-${padded}`);
  const reports = [];

  // 期望的 snapshot 文件列表
  // empty_is_ok: true 表示该 snapshot 筛选条件严格（如 due this chapter），空结果正常
  const expected = [
    { snap: 'foreshadowing-open.yaml', orig: 'registries/foreshadowing.yaml', label: 'foreshadowing', empty_is_ok: false },
    { snap: 'hooks-open.yaml', orig: 'registries/hooks.yaml', label: 'hooks', empty_is_ok: false },
    { snap: 'open-threads-active.yaml', orig: 'registries/open-threads.yaml', label: 'open-threads', empty_is_ok: false },
    { snap: 'character-state-active.yaml', orig: 'registries/character-state-log.yaml', label: 'character-state', empty_is_ok: false },
    { snap: 'world-state-active.yaml', orig: 'registries/world-state-log.yaml', label: 'world-state', empty_is_ok: false },
    { snap: 'narrative-sparks-open.yaml', orig: 'registries/narrative-sparks.yaml', label: 'narrative-sparks', empty_is_ok: true },
    { snap: 'emotional-beats-due.yaml', orig: 'registries/emotional-beats.yaml', label: 'emotional-beats', empty_is_ok: true },
    { snap: 'cool-points-due.yaml', orig: 'registries/cool-points.yaml', label: 'cool-points', empty_is_ok: true },
    { snap: 'appearance-recent.yaml', orig: 'registries/appearance-log.yaml', label: 'appearance', empty_is_ok: false },
  ];

  let totalOrig = 0;
  let totalSnap = 0;
  let missing = 0;
  let noCompression = 0;

  for (const e of expected) {
    const snapPath = path.join(snapDir, e.snap);
    const origPath = path.join(novelAbs, e.orig);

    if (!fs.existsSync(snapPath)) {
      if (e.empty_is_ok) {
        // 该 snapshot 可能因为筛选为空而未生成——正常
        reports.push(`○ ${e.label}: no snapshot (empty filter — ok)`);
      } else if (fs.existsSync(origPath) && fs.statSync(origPath).size > 100) {
        reports.push(`⚠ ${e.label}: snapshot missing (orig ${Math.ceil(fs.statSync(origPath).size / 1024)} KB) — run: forge context . --chapter ${chapter}`);
        missing++;
      }
      continue;
    }

    const snapSize = fs.statSync(snapPath).size;
    const origSize = fs.existsSync(origPath) ? fs.statSync(origPath).size : 0;

    totalSnap += snapSize;
    totalOrig += origSize;

    const snapKb = Math.ceil(snapSize / 1024);
    const origKb = Math.ceil(origSize / 1024);
    const ratio = origSize > 0 ? Math.round((snapSize / origSize) * 100) : 0;

    if (origSize > 0 && snapSize >= origSize * 0.9) {
      // 计算原始条目数
      const origBlocks = [...(fs.readFileSync(origPath, 'utf8').matchAll(/(?:^|\n)\s*-\s+id:/g))].length;
      if (origBlocks <= 5) {
        reports.push(`○ ${e.label}: ${snapKb} KB / ${origKb} KB (${ratio}%) — 条目少（${origBlocks}），压缩率低正常`);
      } else {
        reports.push(`⚠ ${e.label}: ${snapKb} KB / ${origKb} KB (${ratio}%) — 压缩率低，检查筛选逻辑`);
        noCompression++;
      }
    } else if (origSize > 0) {
      reports.push(`✓ ${e.label}: ${snapKb} KB / ${origKb} KB (${ratio}%) — saved ${origKb - snapKb} KB`);
    }
  }

  const savedKb = Math.ceil((totalOrig - totalSnap) / 1024);
  const overallRatio = totalOrig > 0 ? Math.round((totalSnap / totalOrig) * 100) : 0;

  return {
    reports,
    summary: {
      total_snap_kb: Math.ceil(totalSnap / 1024),
      total_orig_kb: Math.ceil(totalOrig / 1024),
      saved_kb: savedKb,
      compression_ratio: overallRatio,
      missing,
      no_compression: noCompression,
    },
  };
}

export { NAV_INDEX_PATHS };
