# 框架现状（2026-06-11 · 第五轮 · post-chapter 硬化）

北极星：**用户 seed → 多智能体 Skill 链（隔离会话 + handoff）→ Canon 防失忆 → 规则评审 → 可恢复续写**。

**状态机**：[`pipeline-state-machine.md`](../architecture/pipeline-state-machine.md)  
**编排**：[`harness/workflows/`](../../harness/workflows/) + `orchestrator-lib.mjs`  
**首跑验证**：[`first-run-checklist.md`](first-run-checklist.md)

## 能力矩阵

| 层 | 状态 | 路径 |
|----|------|------|
| 5 工作流 + handoff 硬化 | ✅ | advance handoff · patch-cycle 脚手架 · session-collect 门禁 · graph 漂移 WARN |
| 23 Skill（已对齐 workflow） | ✅ | `skills/roles/` |
| 10 manifest + workflow validate | ✅ | `forge workflow validate` |
| 11 维 review + 外置阈值 | ✅ | `harness/review/config.json` |
| 六路 smoke + CI | ✅ | `pnpm smoke:all` |
| 真实 seed 首章 E2E | ⬜ | 待正式生成验证 |

## 工作流 × Skill

| workflow | Skill 链 |
|----------|----------|
| creation-chain | orchestrator → seed → bootstrap → world → character → cast-network → persona-voice → plot → foreshadow → hook → batch → retention |
| chapter-cycle | context → production → [dialogue] → continuity → persona-evolution → retention → reviewer → advance |
| patch-cycle | delegate → re-review |
| revision-volume | chief → style → patch → reviewer |
| rebuild-chain | canon-rebuilder → orchestrator |

## CLI 入口

| 命令 | 用途 |
|------|------|
| `forge next` | 每轮当前 Skill |
| `forge handoff complete` | 强制 postflight + 产物 |
| `forge phase advance` | 须 review PASS + handoff 齐全 |
| `forge workflow validate` | manifest 契约 |
| `forge relay refresh` | 再生 `state/working/session-relay.md` 新会话接力 |

## 文档入口

| 任务 | 读 |
|------|-----|
| 正式开书 | [`first-run-checklist.md`](first-run-checklist.md) |
| **迭代时五层同步** | [`../harness/layer-sync-contract.md`](../harness/layer-sync-contract.md) |
| Skill 一览 | [`skills/README.md`](../../skills/README.md) |
| Handoff 协议 | [`skills/guides/handoff-protocol.md`](../../skills/guides/handoff-protocol.md) |
| 路线图 | [`roadmap.md`](roadmap.md) |
