---
name: plot-architect
description: >-
  Creates macro outlines and story arcs in creation-chain step 8. Writes
  canon/plot/outline.md and arcs.yaml only — beats are batch-planner's
  isolated session. Use after persona-voice-binder handoff.
---

# Plot Architect

## 工作流位置

`creation-chain` 第 8 步 · 读 `@persona-voice-binder` handoff · 交 `@foreshadow-engineer`

## 前置门禁

- `cast-roster.yaml` 须含父母/核心社会关系
- `voice-matrix.yaml` 与 `persona-shifts.yaml` 已就绪

## 产出（本步仅宏观）

- `canon/plot/outline.md` — 三幕/卷结构
- `canon/plot/arcs.yaml` — 弧 id 与章范围

**不在本步写** `canon/plot/beats/`（属 `@batch-planner` 隔离会话）

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
