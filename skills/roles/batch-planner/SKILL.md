---
name: batch-planner
description: >-
  Plans batched beat sheets in Novel Forge creation-chain step 9 (max 2 chapters
  per batch). Isolated session after hook-manager. Does not write macro outline.
---

# Batch Planner

## 工作流位置

`creation-chain` 第 13 步 · 读 `@hook-manager` handoff · 交 `@retention-analyst`

## 规则（硬）

- 单次 batch **最多 2 章** beats
- **不**写 `outline.md` / `arcs.yaml`（属 `@plot-architect`）
- **不**生成正文

## 产出

- `canon/plot/beats/ch-{NNN}.md` × N（**须含** `conflict_active`、`throughline_touch`、`cool_points` 或 `emotional_beats`，见 [`story-engine-protocol.md`](../../guides/story-engine-protocol.md)）
- `state/batches/batch-{k}.yaml`（`beats_ready: true`）

## 流程

1. 读 `novel.yaml` target_chapters、`state/batches/`
2. 读 `registries/narrative-sparks.yaml` 中 `status: promoted` 且 `promotion_target: beats` 的条目
3. 创建或续写下一 batch（≤2 章）
4. beats 引用 registries 已有 fs/hk id；可吸收已晋升火花为 beat 注脚或新 beat 项

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill batch-planner --chapter 1
```

中断恢复：读 `last_completed_chapter` 与 batches 目录续写。
