# AGENTS

面向 AI Agent：规则入口与重定向。细则在 `docs/`，**禁止把长篇设定只留在对话里**。

## Rule Entry Points

1. 根规范：**本文**
2. 文档门户：`docs/README.md`
3. 文档 Harness：`docs/harness/README.md` — 跨域、不确定读序时**必读**
4. 执行 Harness：`docs/harness/execution/README.md` — 生成前/中/后**必读**
5. 任务路由：`docs/style-guide/agent-routing.md`
6. 单书入口：`stories/{novel-id}/AGENTS.md`（存在时优先于全局）

冲突处理：安全与 Canon 一致性优先 → 禁止项优先 → **单书 AGENTS 就近优先**。

## 五层联动（改 Skill / workflow / manifest / 文档必查）

Skill、`harness/workflows/`、`harness/manifests/`、执行 phases、状态机**解耦但环环相扣**。  
更新任意一层 → 对照 [`docs/harness/layer-sync-contract.md`](docs/harness/layer-sync-contract.md) 检查表 + `pnpm forge workflow validate`。

## Repository Map

| 路径 | 职责 |
|------|------|
| `docs/` | 框架设计、Harness 读序、架构与 PRD |
| `skills/` | AI 团队角色（项目级，非全局） |
| `harness/` | 可执行：manifest 生成、校验、记忆压缩 |
| `stories/_template/` | 新书骨架 |
| `stories/{novel-id}/` | 一部小说的全部 Canon、登记册、手稿 |

## 写小说时的铁律

0. **每轮先 next** — `pnpm forge next stories/{id}` 决定当前 Skill；多智能体完成后 `pnpm forge handoff complete`
1. **开书先 intake** — `pnpm forge intake questions` 多轮收 seed（含文笔字段），`forge intake check` PASS 后才 novel-bootstrap → **prose-style-architect**
2. **先 context + manifest，再动笔** — `pnpm forge context` + `pnpm forge manifest`
3. **只改手稿与 state** — `canon/` 须经 continuity 流程更新，禁止凭记忆覆盖
3a. **新会话先读** `state/working/session-relay.md`（`pnpm forge relay refresh`）
3b. **单会话≤2章正文** · **integrity 硬门禁** — `pnpm forge draft check` 须 integrity ok 才可 production handoff（见 `production-integrity-gates.md`）
3c. **正文禁止 meta** — 登记册 id / chN / 表世界 等不得进 `manuscripts/`
4. **登记册必同步** — 伏笔/钩子/爽点/微兑现/plot-debt/character-state-log/world-state-log/**narrative-sparks** 章后更新
5. **章后链** — continuity-warden → persona-evolution-warden → retention-analyst → **review**
6. **review 失败** — `forge next` 进入 `patch-cycle`；按 `action_items.delegate_skill` 修补（revision 三元组自动脚手架），≤3 轮否则 blocked
7. **章完成** — rule-reviewer handoff（须 review PASS）→ `forge phase advance --chapter N`（写 `@novel-orchestrator` handoff；高优 session-collect 须 `author_ack` 或 `--ack-session-collect`）
8. **禁止**在未更新 `continuity-log.yaml` 的情况下声称「已回收伏笔」

## Canonical Docs

- 状态机（唯一真相源）：`docs/architecture/pipeline-state-machine.md`
- 统一流水线：`docs/architecture/unified-pipeline.md`
- 框架现状：`docs/ops/framework-status.md`（**仅框架能力，不追踪单书进度**）
- 单书跟框架：`docs/ops/book-framework-sync.md`
- **生产完整性迭代**：`docs/ops/harness-integrity-iteration.md`
- 路线图：`docs/ops/roadmap.md`
- 用书清单：`docs/ops/first-run-checklist.md`
- 五层联动契约：`docs/harness/layer-sync-contract.md`
- Handoff 协议：`skills/guides/handoff-protocol.md`
- 记忆架构：`docs/architecture/memory-system.md`
- 目录契约：`docs/architecture/story-directory-schema.md`
- 生产流水线：`docs/architecture/production-pipeline.md`
- 单书生命周期：`docs/harness/execution/lifecycle.md`

## Do Not

- 不要把角色设定、世界观只写在对话或临时 md 里而不入库。
- 不要跳过 `registries/` 直接写「后面会解释」。
- 不要整本读取 `manuscripts/` 当上下文；用 `state/memory/` 与 manifest。
- 不要修改 `stories/_template/` 作为正式创作（应复制为新 id）。
