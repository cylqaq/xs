# 框架现状（2026-06-11 · 第八轮 · 叙述文笔链）

北极星：**用户 seed → 多智能体 Skill 链（隔离会话 + handoff）→ Canon 防失忆 → 规则评审 → 可恢复续写**。

**本轮**：生产完整性迭代 — 字数 band 降至 2000–4500/硬下限 1600 · 单会话≤2 章 · review `meta_prose_leakage`+`anti_padding` · production handoff integrity 硬门禁。见 [`harness-integrity-iteration.md`](harness-integrity-iteration.md)。

**单书进度**：不在本文追踪；见 [`book-framework-sync.md`](book-framework-sync.md)。

**状态机**：[`pipeline-state-machine.md`](../architecture/pipeline-state-machine.md)  
**编排**：[`harness/workflows/`](../../harness/workflows/) + `orchestrator-lib.mjs`  
**五层联动**：[`layer-sync-contract.md`](../harness/layer-sync-contract.md)

## 能力矩阵（仅框架）

| 层 | 状态 | 路径 / 命令 |
|----|------|-------------|
| 5 工作流 + handoff 硬化 | ✅ | `harness/workflows/` · `forge handoff` |
| 24 Skill（对齐 workflow） | ✅ | `skills/roles/` |
| 12 manifest + workflow validate | ✅ | `forge workflow validate`（含 `prose-style`） |
| 12 维 review + 外置阈值 | ✅ | `harness/review/config.json` · 含 `ai_crutch_words` |
| 叙述文笔链（开书） | ✅ | `prose-style` manifest · `harness/style-profiles/` |
| 旧书脚手架同步 | ✅ | `forge sync framework` |
| 七路 smoke + CI | ✅ | `pnpm smoke:all` |
| publish 导出 | ⬜ | `publish/exports/` |
| `forge diff-canon` / `forge graph` | ⬜ | 路线图 |

## 工作流 × Skill

| workflow | Skill 链 |
|----------|----------|
| creation-chain | orchestrator → seed → bootstrap → **prose-style** → world → character → cast-network → persona-voice → plot → foreshadow → hook → batch → retention |
| chapter-cycle | context → production → [dialogue] → continuity → persona-evolution → retention → reviewer → advance |
| patch-cycle | delegate → re-review |
| revision-volume | chief-editor → style → patch → reviewer |
| rebuild-chain | canon-rebuilder → orchestrator |

## CLI 入口

| 命令 | 用途 |
|------|------|
| `forge next` | 每轮当前 Skill |
| `forge handoff complete` | 强制 postflight + 产物 |
| `forge phase advance` | 须 review PASS + handoff 齐全 |
| `forge workflow validate` | manifest 契约 |
| `forge sync framework` | 旧书补缺脚手架 + 文笔就绪检测 |
| `forge draft check` | 字数 tier 预检（production handoff 前） |
| `forge relay refresh` | 再生 `session-relay.md` |

## 文档入口

| 任务 | 读 |
|------|-----|
| **框架迭代** | [`layer-sync-contract.md`](../harness/layer-sync-contract.md) |
| 旧书跟框架 | [`book-framework-sync.md`](book-framework-sync.md) |
| 用笔顺清单 | [`first-run-checklist.md`](first-run-checklist.md) |
| Skill 一览 | [`skills/README.md`](../../skills/README.md) |
| 文笔契约 | [`prose-style-protocol.md`](../../skills/guides/prose-style-protocol.md) |
| 路线图（框架待办） | [`roadmap.md`](roadmap.md) |
