---
name: novel-orchestrator
description: >-
  Orchestrates the Novel Forge pipeline from seed to publish. Routes tasks to
  role skills, enforces phase gates and BEFORE/DURING/AFTER harness. Use when
  starting a novel, unsure which step is next, or coordinating multi-role work.
---

# Novel Orchestrator

## 入口（每轮必跑）

```bash
pnpm forge next stories/{id} [--chapter N]    # 当前应激活哪个 Skill、CLI 前后置
pnpm forge run stories/{id} [--workflow auto] # 完整多智能体剧本 → state/working/run-plan.json
pnpm forge handoff status stories/{id}        # 已完成的 Skill 交接
```

**多智能体铁律**：一次会话只扮演一个 Skill；完成后 `pnpm forge handoff complete stories/{id} --skill <本角色名>`，再 `forge next` 交给下一智能体。

## 路由表（见 unified-pipeline.md）

| phase | workflow | Skill 链 |
|-------|----------|----------|
| ideation | `creation-chain` | seed-intake → intake check → novel-bootstrap → … |
| worldbuilding / outlining | `creation-chain` | world → character → plot → foreshadow → hook → batch → retention |
| drafting | `chapter-cycle` | context-router → production → [dialogue] → continuity → persona-evolution → retention → reviewer |
| review_fail | `patch-cycle` | `forge review` FAIL 自动脚手架 `state/revisions/`；`forge next` 路由 delegate |
| review_pass | advance 步 | handoff @rule-reviewer → `forge phase advance --chapter N` → **自动写本角色 handoff** |
| metadata_drift | `rebuild-chain` | canon-rebuilder（`sub_phase: rebuild-canon`） |
| revision | `revision-volume` | chief-editor → style-guardian → patch-refiner → rule-reviewer |

工作流定义：`harness/workflows/*.yaml`

## 单章 DoD

全章 handoff 链完成 + `@rule-reviewer` handoff（review PASS）→ `pnpm forge phase advance --chapter N`（自动写 `ch-{NNN}-novel-orchestrator.yaml`）

历史章缺 advance handoff：`pnpm forge phase backfill-advance stories/{id} --chapter N`

正式首跑清单：[`docs/ops/first-run-checklist.md`](../../../docs/ops/first-run-checklist.md)

## 铁律

- 不得在同一对话连续扮演 production + warden + reviewer
- 不得连续写两章而不执行 continuity + review AFTER
- batch-planner：单次最多 2 章 beats（`maxChaptersPerBatch`）
- chapter-production：单次会话最多 `writing-plan.maxChaptersPerSession` 章（默认 **4**）
- 章后/新会话：`pnpm forge relay refresh` → `state/working/session-relay.md`
- **必须先** `forge intake check` PASS，再 novel-bootstrap
- ideation 禁止 `forge context` / `forge review`（CLI 已拦截）
- 评审失败禁止绕过；`--force` 须 `--reason` + continuity-log

## 输出

每轮结束报告：`forge next` 摘要 + 已完成 handoff + 需用户确认项。

## 会话结束前（作者要开新对话时）

1. `pnpm forge relay refresh stories/{id}` — 再生 `session-relay.md`
2. 确认 `session-collect.yaml` 无阻塞项
3. 指向 `harness/SESSION-START.md` 与 [`new-session-onboarding.md`](../../guides/new-session-onboarding.md)
