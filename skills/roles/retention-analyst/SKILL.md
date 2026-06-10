---
name: retention-analyst
description: >-
  Quantifies retention metrics in Novel Forge. Two workflow slots — outline
  closing (plot-debt) and per-chapter (state/retention). Use after batch-planner
  or continuity-warden per forge next routing.
---

# Retention Analyst（追读力）

## 工作流位置（二选一，由 `forge next` 路由）

| 场景 | workflow 步 | 前置 handoff |
|------|-------------|--------------|
| 开书 outline 收尾 | `creation-chain` / outline-retention | batch-planner |
| 单章章后 | `chapter-cycle` / retention | persona-evolution-warden |

## Outline 阶段产出

- `registries/plot-debt.yaml` — 聚合 planned 伏笔/钩子/线程
- 与 cool-points / micro-payoffs **planned** 对齐
- handoff postflight：`validate --task outline-batch`

## 章后产出

1. `registries/cool-points.yaml` — delivered 标记
2. `registries/micro-payoffs.yaml` — overdue 检测
3. `state/retention/ch-{NNN}.yaml`（见 `harness/templates/retention-chapter.yaml`）
4. **`state/working/session-collect.yaml`** — ≤3 条向作者追问（剧情洞、新实体、待确认设定）

### session-collect 规则

- 基于本章 summary、open-threads、continuity_flags 推导
- 不重复 seed-intake 已闭合项
- 标注 `suggested_canon` 供下轮写入路径
- **`priority: high` 项须作者设 `author_ack: true` 后才可 `phase advance`**（或 CLI `--ack-session-collect`）
- 见 [`skills/guides/session-relay-protocol.md`](../../guides/session-relay-protocol.md)

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill retention-analyst --chapter N
```
