#!/usr/bin/env node
/**
 * Novel Forge — 子项目独立版
 *
 * 用法：
 *   node forge.mjs <command> [options]
 *   node forge.mjs doctor . --chapter 1
 *   node forge.mjs next .
 *
 * 本文件是子项目的独立 CLI 入口，不依赖根项目。
 * 所有框架文件已复制到本地 harness/ 和 skills/ 目录。
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 直接调用本地的 harness/scripts/forge.mjs
const forgeScript = path.join(__dirname, 'harness/scripts/forge.mjs');

// 参数转换：将 "." 或空路径转换为当前目录的绝对路径
function resolveNovelPath(args) {
  return args.map((arg) => {
    if (arg === '.' || arg === './') return __dirname.replace(/\\/g, '/');
    if (arg.startsWith('./')) return path.join(__dirname, arg.slice(2)).replace(/\\/g, '/');
    return arg;
  });
}

// 执行
const rawArgs = process.argv.slice(2);
const args = resolveNovelPath(rawArgs);

try {
  execSync(`node "${forgeScript}" ${args.join(' ')}`, {
    stdio: 'inherit',
    cwd: __dirname,
  });
} catch (e) {
  process.exit(e.status || 1);
}
