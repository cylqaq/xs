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
  if (opts.manifestSections) {
    for (const f of opts.manifestSections.before || []) {
      if (fs.existsSync(f)) manifestBytes += fs.statSync(f).size;
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

export function formatDoctorReport(novelRoot, check, chapter) {
  const lines = [];
  lines.push('# Doctor | ' + novelRoot + ' | ch-' + (chapter ? padChapter(chapter) : '?'));
  lines.push('');
  const icon = check.circuit_state === 'green' ? '✓' : check.circuit_state === 'yellow' ? '⚠' : '✗';
  lines.push(icon + ' circuit_state: ' + check.circuit_state);
  lines.push('  nav: ' + check.nav_kb + ' KB / cap ' + check.budget.navCapKb + ' KB');
  lines.push('  manifest: ' + check.manifest_kb + ' KB');
  lines.push('  total: ' + check.total_kb + ' KB / budget ' + check.budget.totalKb + ' KB / hard ' + check.budget.hardCapKb + ' KB (' + Math.round(check.ratio * 100) + '%)');
  lines.push('');
  for (const w of check.warnings) lines.push('⚠ ' + w);
  for (const e of check.errors) lines.push('✗ ' + e);
  if (!check.warnings.length && !check.errors.length) lines.push('✓ no issues');
  return lines.join('\n');
}

export { NAV_INDEX_PATHS };
