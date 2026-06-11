---
name: plot-architect
description: >-
  Creates macro outlines and story arcs in creation-chain step 8. Writes
  canon/plot/outline.md and arcs.yaml only — beats are batch-planner's
  isolated session. Use after persona-voice-binder handoff.
---

# Plot Architect

## 工作流位置

`creation-chain` 第 9 步 · 读 `@persona-voice-binder` handoff · 交 `@foreshadow-engineer`

## 前置门禁

- `cast-roster.yaml` 须含父母/核心社会关系
- `voice-matrix.yaml` 与 `persona-shifts.yaml` 已就绪

## 产出（本步仅宏观）

- `canon/plot/outline.md` — 三幕/卷结构
- `canon/plot/arcs.yaml` — 弧 id 与章范围
- `canon/plot/outline-amendments.md` — 初始化 append-only 补丁日志（连载期火花晋升 outline 级时追加，**不改写** outline.md 正文）

**不在本步写** `canon/plot/beats/`（属 `@batch-planner` 隔离会话）

连载期宏观调整：读 `outline-amendments.md` + `narrative-sparks` 已晋升 outline/arc 项，须 author_ack 后合并意图到 outline/arcs。

## BEFORE

```bash
pnpm forge manifest outline-batch stories/{id} --chapter 1
```

## 多智能体交接

```bash
pnpm forge next stories/{id}
pnpm forge handoff complete stories/{id} --skill plot-architect --chapter 1
```

见 [`guides/handoff-protocol.md`](../../guides/handoff-protocol.md)
