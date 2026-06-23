# 框架现状（2026-06-11 · 第十轮 · 上下文预算/防雪球）

北极星：**用户 seed → 多智能体 Skill 链（隔离会话 + handoff）→ Canon 防失忆 → 规则评审 → 可恢复续写 · 项目越大单次会话越轻**。

**本轮（第十轮）**：上下文预算与防雪球 — L0 INDEX 导航层（三份 ≤ 6 KB）+ `@navigator` sub-agent + `forge doctor/budget/nav` + AI Loop 安全栓（circuit_state/stall/cost）。见 [`context-budget-iteration.md`](context-budget-iteration.md)。

**上轮（第九）**：叙事引擎 — `conflict-architect` + `story-engine.yaml` + `emotional-beats`。见 [`story-engine-iteration.md`](story-engine-iteration.md)。

**第八轮**：生产完整性 — 字数 band · 单会话≤2 章 · meta/anti_padding。见 [`harness-integrity-iteration.md`](harness-integrity-iteration.md)。

**单书进度**：不在本文追踪；见 [`book-framework-sync.md`](book-framework-sync.md)。

**状态机**：[`pipeline-state-machine.md`](../architecture/pipeline-state-machine.md)  
**防雪球架构**：[`context-budget-system.md`](../architecture/context-budget-system.md)  
**编排**：[`harness/workflows/`](../../harness/workflows/) + `orchestrator-lib.mjs`  
**五层联动**（含 L0 INDEX）：[`layer-sync-contract.md`](../harness/layer-sync-contract.md)

## 能力矩阵（仅框架）

| 层 | 状态 | 路径 / 命令 |
|----|------|-------------|
| 5 工作流 + handoff 硬化 | ✅ | `harness/workflows/` · `forge handoff` |
| **26 Skill**（含 navigator） | ✅ | `skills/roles/` · 含 `conflict-architect` `navigator` |
| 12 manifest + workflow validate | ✅ | `forge workflow validate` |
| 13 维 review + 外置阈值 | ✅ | 含 `emotional_beat_delivery` |
| 叙述文笔链（开书） | ✅ | `prose-style` manifest |
| 叙事引擎链（开书+连载） | ✅ | `story-engine-protocol` · `conflict-architect` |
| **L0 INDEX 导航层（防雪球）** | ✅ | `canon/INDEX.yaml` · `registries/INDEX.yaml` · `state/memory/INDEX.yaml` |
| **AI Loop 安全栓** | ✅ | `harness/context-budget.yaml` loop_safety · `state/memory/INDEX.yaml.circuit_state` |
| **forge doctor / budget / nav** | ✅ | 新 CLI（第十轮） |
| 旧书脚手架同步 | ✅ | `forge sync framework`（含 INDEX 自动复制） |
| 七路 smoke + CI | ✅ | `pnpm smoke:all` |
| publish 导出 | ⬜ | `publish/exports/` |
| `forge diff-canon` / `forge graph` | ⬜ | 路线图 |

## 工作流 × Skill

| workflow | Skill 链 |
|----------|----------|
| creation-chain | orchestrator → seed → bootstrap → prose-style → world → character → cast-network → persona-voice → plot → **conflict** → foreshadow → hook → batch → retention |
| chapter-cycle | **navigator** → context → production → [dialogue] → continuity → persona-evolution → retention → reviewer → advance |
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
| `forge sync framework` | 旧书补缺 + prose/engine/INDEX 就绪检测 |
| `forge draft check` | 字数 tier + integrity |
| `forge relay refresh` | 再生 `session-relay.md` |
| **`forge doctor`** | 第十轮 · 预算 + INDEX 鲜度 + loop 体检 |
| **`forge budget`** | 第十轮 · 当前章预算条目可视化 |
| **`forge nav build|rebuild|lookup`** | 第十轮 · INDEX 导航助手 |

## 文档入口

| 任务 | 读 |
|------|-----|
| **框架迭代** | [`layer-sync-contract.md`](../harness/layer-sync-contract.md) |
| **防雪球（必读）** | [`context-budget-system.md`](../architecture/context-budget-system.md) · [`context-budget-protocol.md`](../../skills/guides/context-budget-protocol.md) |
| **上下文预算迭代** | [`context-budget-iteration.md`](context-budget-iteration.md) |
| 叙事引擎 | [`story-engine-iteration.md`](story-engine-iteration.md) |
| 旧书跟框架 | [`book-framework-sync.md`](book-framework-sync.md) |
| 用笔顺清单 | [`first-run-checklist.md`](first-run-checklist.md) |
| Skill 一览 | [`skills/README.md`](../../skills/README.md) |
| 路线图 | [`roadmap.md`](roadmap.md) |
| **字数哲学** | [`../../skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md) — 故事合理性优先于字数达标 |
| **根项目保护** | [`root-project-protection.md`](root-project-protection.md) — 防止书籍生产污染根项目 |
| **错误恢复指南** | [`error-recovery-guide.md`](error-recovery-guide.md) — 流程卡住/手稿写坏时的恢复路径 |
| **单书生命周期** | [`book-lifecycle.md`](book-lifecycle.md) — 从创建到归档的完整管理 |
| **质量门禁检查清单** | [`quality-gates-checklist.md`](quality-gates-checklist.md) — 每章/每卷/每书的质量检查 |
