---
name: canon-rebuilder
description: >-
  Realigns metadata with manuscripts via rebuild-chain workflow. Triggered when
  sub_phase is rebuild-canon. Never edits manuscript prose.
---

# Canon Rebuilder（重建阶段）

## 工作流位置

`rebuild-chain` · orchestrator 设 `state/phase.yaml` → `sub_phase: rebuild-canon`

## 铁律

**禁止修改** `manuscripts/` 正文。

## 流程

1. `pnpm forge manifest rebuild-canon stories/{id} --chapter N`
2. 从 summaries + 手稿重建 `canon/characters/index.yaml` last_seen
3. 对齐 registries 与 beats 引用
4. 重算 `plot-debt.yaml`
5. `pnpm forge context-index` + `forge compact`

handoff postflight：`validate --task rebuild-canon`

## 完成后

orchestrator 清除 `sub_phase: rebuild-canon`，`forge next` 回到 `chapter-cycle`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill canon-rebuilder --chapter N --workflow rebuild-chain
```
