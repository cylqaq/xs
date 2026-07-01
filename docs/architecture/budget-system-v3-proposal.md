# Context Budget System v3 提案

> 诊断日期：2026-06-25
> 问题：预算系统与实际加载逻辑脱节，导致每章必红

## 一、问题根因

### 1.1 预算计算 Bug

`context-budget-lib.mjs:assessContextHealth` 函数遍历 `sections.before` 的所有文件，
但不读取 `priority`、`source`、`snapshot` 字段。

```javascript
// 当前代码（错误）
for (const f of opts.manifestSections.before || []) {
  if (fs.existsSync(f)) manifestBytes += fs.statSync(f).size;
}

// 应该的逻辑
for (const meta of opts.manifestSections.beforeMeta || []) {
  if (meta.source === 'on_demand') continue;           // 默认不加载
  if (meta.source === 'from_index' && !indexHit(meta)) continue;  // INDEX未命中不加载
  const size = meta.snapshot ? getSnapshotSize(meta) : getFileSize(meta);
  manifestBytes += size;
}
```

### 1.2 设计理念缺陷

当前设计假设"列出=加载"，但实际有三种加载策略：
- `critical`：永远加载
- `from_index`：INDEX命中才加载
- `on_demand`：显式请求才加载

预算系统没有实现这个分层。

### 1.3 INDEX 无收敛机制

INDEX文件包含所有历史条目，随章节线性增长。
设计上说"≤ 2KB"，但没有自动裁剪机制。

## 二、修复方案

### 2.1 第一层：修复预算计算（立即）

修改 `assessContextHealth` 函数：

```javascript
export function assessContextHealth(novelAbs, chapter, opts = {}) {
  const budget = loadContextBudget();
  const nav = loadNavIndices(novelAbs);
  const warnings = [];
  const errors = [];

  // ... NAV检查保持不变 ...

  let manifestBytes = 0;
  let skippedBySource = 0;
  let snapshotSavings = 0;

  if (opts.manifestSections) {
    const SNAPSHOTTED = new Set([
      'registries/foreshadowing.yaml', 'registries/hooks.yaml',
      'registries/open-threads.yaml', 'registries/character-state-log.yaml',
      'registries/world-state-log.yaml', 'registries/narrative-sparks.yaml',
      'registries/emotional-beats.yaml', 'registries/cool-points.yaml',
    ]);
    const novelPrefix = novelAbs.replace(/\\/g, '/') + '/';

    for (const meta of opts.manifestSections.beforeMeta || []) {
      // on_demand 文件默认不计入
      if (meta.source === 'on_demand') {
        skippedBySource++;
        continue;
      }

      // snapshot 文件用snapshot大小（如果存在）
      if (meta.snapshot) {
        const rel = meta.path.startsWith(novelPrefix)
          ? meta.path.slice(novelPrefix.length) : meta.path;
        const snapPath = path.join(novelAbs,
          `state/working/context-snapshot-ch-${padChapter(chapter)}`,
          path.basename(rel));
        if (fs.existsSync(snapPath)) {
          const fullSize = fs.existsSync(meta.path) ? fs.statSync(meta.path).size : 0;
          const snapSize = fs.statSync(snapPath).size;
          manifestBytes += snapSize;
          snapshotSavings += (fullSize - snapSize);
          continue;
        }
      }

      // from_index 文件：如果INDEX未命中则不计入
      // 简化处理：计入，但标记为可优化
      if (fs.existsSync(meta.path)) {
        manifestBytes += fs.statSync(meta.path).size;
      }
    }
  }

  // ... 后续逻辑不变 ...
}
```

### 2.2 第二层：INDEX 自动收敛

在 `rebuildNavIndices` 中添加收敛逻辑：

```javascript
function convergeNavIndex(novelAbs, maxAgeChapters) {
  // 对每个INDEX文件：
  // 1. 读取当前内容
  // 2. 标记 last_seen < (currentChapter - maxAgeChapters) 的条目
  // 3. 将这些条目移到归档区
  // 4. 只保留热条目在主INDEX中
}
```

### 2.3 第三层：预算分层对齐

修改 `context-budget.yaml` 的预算分配：

```yaml
# 实际预算分配（基于实际加载行为）
budget_tiers:
  always_load:      # critical + INDEX = 必须在预算内
    max_kb: 35
  conditional_load: # from_index 命中 = 按INDEX命中率动态
    max_kb: 25
  never_count:      # on_demand = 不计入预算
    description: 显式请求才加载，不影响预算判断
```

## 三、实施优先级

1. **P0（立即）**：修复 `assessContextHealth` 的计算逻辑
2. **P1（本迭代）**：INDEX 自动收敛机制
3. **P2（下迭代）**：预算分层对齐

## 四、预期效果

- 修复后，正常章节预算应在 35-50KB 范围（绿色/黄色）
- 只有真正复杂的章节（多角色、多线索）才会达到红色
- INDEX 大小稳定在 6KB 以内

## 五、实施记录（2026-06-25 完成）

### 5.1 已修复

| 修复项 | 文件 | 效果 |
|--------|------|------|
| 解析 `source` 字段 | `forge-lib.mjs:resolveManifest` | `on_demand` 文件正确识别 |
| 跳过 `on_demand` | `context-budget-lib.mjs:assessContextHealth` | 4 个文件不计入预算 |
| Snapshot 大小计算 | `context-budget-lib.mjs:assessContextHealth` | 用 snapshot 而非原始文件 |
| Snapshot 文件名映射 | `context-budget-lib.mjs` + `forge.mjs` | 正确查找 snapshot（如 `character-state-log.yaml` → `character-state-active.yaml`） |
| Snapshot 条目上限 | `context-budget.yaml` + `forge-lib.mjs:writeContextRegistrySnapshots` | 从无限制改为 12 条，按章节接近度排序 |
| appearance-log snapshot | `forge-lib.mjs` + `chapter-draft.yaml` | 19KB → 4KB |
| INDEX 收敛命令 | `context-budget-lib.mjs:convergeNavIndices` + `forge.mjs:cmdNav` | `forge nav converge` 截断 hot_refs/delivered_recent/notes |
| Snapshot 审计命令 | `context-budget-lib.mjs:auditSnapshots` + `forge.mjs:cmdSnapshot` | `forge snapshot audit` 监控压缩率 |
| 工作流顺序 | `AGENTS.md` | `context` → `doctor` → `nav build` → `nav converge` |

### 5.2 效果对比

| 指标 | 修复前 | 修复后 | 改善 |
|------|--------|--------|------|
| 总预算 | 106 KB | 69 KB | -35% |
| 状态 | RED (177%) | YELLOW (115%) | 可用 |
| Snapshot 节省 | 0 KB | 34 KB (59% reduction) | +34 KB |
| 跳过 on_demand | 0 | 4 files | -4 KB |
| circuit_state | red | yellow | 解除阻塞 |

### 5.3 新增 CLI 命令

```bash
# INDEX 收敛（章后或预算 yellow 时运行）
node forge.mjs nav converge . [--max-refs N] [--max-delivered N]

# Snapshot 质量审计（context 之后运行）
node forge.mjs snapshot audit . --chapter N
```

### 5.4 新工作流

```bash
# 每章首动作（更新后）
node forge.mjs context . --chapter N    # 1. 生成 snapshot
node forge.mjs nav converge .           # 2. 收敛 INDEX
node forge.mjs doctor . --chapter N     # 3. 检查预算（使用 snapshot）
node forge.mjs snapshot audit . --chapter N  # 4. 审计 snapshot 质量
node forge.mjs nav build . --chapter N  # 5. 构建导航计划
```

### 5.5 遗留

- INDEX 总大小 7KB > 6KB cap（warning 但不阻塞）
- 预算 69KB > 60KB budget（yellow 但 < 72KB hard cap）
- 如需进一步压缩，可降低 `snapshot_limits.max_items_per_file` 到 10

