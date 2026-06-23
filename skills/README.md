# 项目级 Skills（AI 团队 · 26 角色 · 第十轮新增 navigator）

通过 **`pnpm forge next`** + **workflow 五步/章链** 编排，**禁止孤岛**（见 `unified-pipeline.md`、`harness/workflows/README.md`）。

**多智能体**：一次会话一个 Skill → `forge handoff complete` → 下一会话 `forge next`。细则：[`guides/handoff-protocol.md`](guides/handoff-protocol.md)

**防雪球（第十轮）**：每章首动作 `@navigator`（读 INDEX 输出 context-plan ≤ 200 行），主笔 Skill 不再加载海量原始文件。契约：[`guides/context-budget-protocol.md`](guides/context-budget-protocol.md)

## 跨 Skill 契约（非独立 workflow 步）

| 契约 | 路径 | 链式负责 |
|------|------|----------|
| **上下文预算（防雪球 · 第十轮）** | `skills/guides/context-budget-protocol.md` | navigator → 所有 Skill 永读 INDEX |
| **叙述文笔** | `skills/guides/prose-style-protocol.md` | prose-style → world/character → context/production/review |
| 能力缺陷矩阵 | `skills/guides/ability-defect-matrix.md` | world → character → foreshadow → hook → plot |
| 人物人格链 | `skills/guides/character-persona-chain.md` | character-forge → cast-network → persona-voice → 连载 evolution |
| 状态演化链 | `skills/guides/state-evolution-chain.md` | world/character 基线 → continuity 章后 delta → context JIT |
| 叙事火花 | `skills/guides/narrative-spark-protocol.md` | production 捕获 → retention 分诊 → 登记册/beats 晋升 |
| 灵魂卡字段 | `skills/guides/character-soul-card-schema.md` | character-forge |
| 会话生产约束 | `skills/guides/session-production-limits.md` | production / batch / orchestrator |
| **生产完整性门禁** | `skills/guides/production-integrity-gates.md` | draft check + review meta/anti_padding |
| **叙事引擎** | `skills/guides/story-engine-protocol.md` | conflict-architect → beats → context/production/review |
| 会话接力 | `skills/guides/session-relay-protocol.md` | relay refresh · retention session-collect · navigator context-plan |
| 新会话接入 | `skills/guides/new-session-onboarding.md` | 人类 + 新 LLM 必读 |
| 登记册扩展字段 | `skills/guides/registry-field-extensions.md` | foreshadow / hook / continuity |
| **字数哲学** | `skills/guides/word-count-philosophy.md` | chapter-production / chapter-expander / rule-reviewer |
| **根项目保护** | `docs/ops/root-project-protection.md` | 所有 Skill（防止书籍生产污染根项目） |
| **错误恢复指南** | `docs/ops/error-recovery-guide.md` | 所有 Skill（流程卡住时的恢复路径） |
| **单书生命周期** | `docs/ops/book-lifecycle.md` | novel-orchestrator（从创建到归档的管理） |
| **质量门禁检查清单** | `docs/ops/quality-gates-checklist.md` | 所有 Skill（每章/每卷/每书的质量检查） |

## 编排层

| Skill | 职责 |
|-------|------|
| novel-orchestrator | 总控、advance、blocked、rebuild 恢复 |

## 创建链（`creation-chain` · 每步隔离会话 · 14 步）

| 顺序 | Skill | 产出要点 |
|------|-------|----------|
| 1 | novel-orchestrator | manifest bootstrap |
| 2 | seed-intake | seed 三层 + `intake check` |
| 3 | novel-bootstrap | premise、phase→worldbuilding |
| 4 | **prose-style-architect** | prose-profile、voice、exemplars |
| 5 | world-architect | canon/world、power-defects |
| 6 | character-forge | 灵魂卡 index + {id}.md |
| 7 | cast-network-weaver | cast-roster、graph、appearance-log |
| 8 | persona-voice-binder | voice-matrix、persona-shifts planned |
| 9 | plot-architect | outline.md、arcs.yaml |
| 10 | **conflict-architect** | story-engine.yaml、emotional-beats、cool-points planned |
| 11 | foreshadow-engineer | foreshadowing、chekhov-guns |
| 12 | hook-manager | hooks、open-threads |
| 13 | batch-planner | beats（≤2章/batch，须 conflict_active） |
| 14 | retention-analyst | plot-debt + diary_drift（outline 末步） |

## 连载链（`chapter-cycle` · 每章）

| 顺序 | Skill | 备注 |
|------|-------|------|
| 0 | **navigator** | **第十轮** · 读 INDEX 输出 context-plan（防雪球） |
| 1 | context-router | 按 plan 决定 mode + 跑 `forge context` |
| 2 | chapter-production | 手稿 + **sparks draft** |
| 3 | dialogue-craftsman | **条件**：beats 含对话 |
| 4 | continuity-warden | memory + registries + appearance-log + **state logs + INDEX 三件套** |
| 5 | persona-evolution-warden | persona-shifts active |
| 6 | retention-analyst | retention/ch-NNN.yaml + **spark 分诊** + session-collect + INDEX.plot_debt |
| 7 | rule-reviewer | **强制** review postflight |
| 8 | novel-orchestrator | phase advance |

## 补丁链（`patch-cycle` · review FAIL）

novel-orchestrator 读 `delegate_skill` → patch-refiner | chapter-expander | dialogue-craftsman | continuity-warden → rule-reviewer

## 卷精修（`revision-volume`）

chief-editor → style-guardian → patch-refiner → rule-reviewer

## 维护（`rebuild-chain` · `sub_phase: rebuild-canon`）

canon-rebuilder → novel-orchestrator 恢复 drafting

## CLI 速查

```bash
pnpm forge next|run|handoff|workflow validate|sync framework stories/{id}
pnpm forge intake|manifest|context|validate|review|compact|phase advance
pnpm forge doctor|budget|nav build|rebuild|lookup stories/{id}   # 第十轮 · 防雪球
pnpm smoke:all
```

编排真相源：`harness/workflows/` + `orchestrator-lib.mjs`  
**改 Skill 必查 workflow**：[`docs/harness/layer-sync-contract.md`](../docs/harness/layer-sync-contract.md)
