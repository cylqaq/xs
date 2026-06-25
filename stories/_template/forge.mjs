#!/usr/bin/env node
/**
 * Novel Forge — 子项目 Wrapper
 *
 * 用法：
 *   node forge.mjs <command> [options]
 *   node forge.mjs doctor . --chapter 1
 *   node forge.mjs next .
 *
 * 根项目发现顺序：
 *   1. 环境变量 NOVEL_FORGE_ROOT
 *   2. 本目录 .forge-root 文件内容
 *   3. 默认路径 e:/my-project/novel-forge
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- 根项目发现 ----------
function findForgeRoot() {
  // 1. 环境变量
  if (process.env.NOVEL_FORGE_ROOT) {
    const p = process.env.NOVEL_FORGE_ROOT.replace(/\\/g, '/');
    if (fs.existsSync(path.join(p, 'harness/scripts/forge.mjs'))) return p;
  }

  // 2. 配置文件
  const configPath = path.join(__dirname, '.forge-root');
  if (fs.existsSync(configPath)) {
    const p = fs.readFileSync(configPath, 'utf8').trim().replace(/\\/g, '/');
    if (fs.existsSync(path.join(p, 'harness/scripts/forge.mjs'))) return p;
  }

  // 3. 默认路径
  const defaults = [
    'e:/my-project/novel-forge',
    'E:/my-project/novel-forge',
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'novel-forge'),
  ];
  for (const p of defaults) {
    if (fs.existsSync(path.join(p, 'harness/scripts/forge.mjs'))) return p.replace(/\\/g, '/');
  }

  return null;
}

const FORGE_ROOT = findForgeRoot();
if (!FORGE_ROOT) {
  console.error('❌ 找不到 Novel Forge 根项目');
  console.error('   请设置环境变量 NOVEL_FORGE_ROOT 或创建 .forge-root 文件');
  console.error('   示例: echo "e:/my-project/novel-forge" > .forge-root');
  process.exit(1);
}

// ---------- 参数转换 ----------
// 将 "." 或空路径转换为当前目录的绝对路径
function resolveNovelPath(args) {
  return args.map((arg) => {
    if (arg === '.' || arg === './') return __dirname.replace(/\\/g, '/');
    if (arg.startsWith('./')) return path.join(__dirname, arg.slice(2)).replace(/\\/g, '/');
    return arg;
  });
}

// ---------- 执行 ----------
const rawArgs = process.argv.slice(2);
const args = resolveNovelPath(rawArgs);
const forgeScript = path.join(FORGE_ROOT, 'harness/scripts/forge.mjs');

try {
  execSync(`node "${forgeScript}" ${args.join(' ')}`, {
    stdio: 'inherit',
    cwd: FORGE_ROOT,
  });
} catch (e) {
  process.exit(e.status || 1);
}
