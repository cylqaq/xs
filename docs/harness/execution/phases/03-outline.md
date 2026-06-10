# Phase 03 — Outline + 分批框架

**Skill 链（每步隔离会话 + handoff）**：

`plot-architect` → `foreshadow-engineer` → `hook-manager` → `batch-planner` → `retention-analyst`

workflow：`creation-chain` · manifest：`outline-batch`

## BEFORE

```bash
pnpm forge manifest outline-batch stories/{id} --chapter 1
pnpm forge next stories/{id}
```

## 各步产物

| Skill | 写入 |
|-------|------|
| plot-architect | `outline.md`、`arcs.yaml` |
| foreshadow-engineer | `foreshadowing.yaml`、`chekhov-guns.yaml` |
| hook-manager | `hooks.yaml`、`open-threads.yaml` |
| batch-planner | `beats/ch-{NNN}.md`、`state/batches/batch-*.yaml` |
| retention-analyst | `plot-debt.yaml` 汇总 |

每步结束：`pnpm forge handoff complete --skill <name> --chapter 1`

## 分批规则

| 规则 | 值 |
|------|-----|
| 单次 batch | 最多 **2 章** beats |
| 禁止 | 单次 >2 章 beats 或 >1 章正文 |

## AFTER

- `state/phase.yaml` → `drafting`（batch-001 beats 就绪）
- 按章进入 Phase 05，每章走 chapter-cycle
