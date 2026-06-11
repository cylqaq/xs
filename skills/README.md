# 项目级 Skills（AI 团队 · 24 角色）

通过 **`pnpm forge next`** + **workflow 五步/章链** 编排，**禁止孤岛**（见 `unified-pipeline.md`、`harness/workflows/README.md`）。

**多智能体**：一次会话一个 Skill → `forge handoff complete` → 下一会话 `forge next`。细则：[`guides/handoff-protocol.md`](guides/handoff-protocol.md)

## 跨 Skill 契约（非独立 workflow 步）

| 契约 | 路径 | 链式负责 |
|------|------|----------|
| **叙述文笔** | `skills/guides/prose-style-protocol.md` | prose-style → world/character → context/production/review |
| 能力缺陷矩阵 | `skills/guides/ability-defect-matrix.md` | world → character → foreshadow → hook → plot |
| 人物人格链 | `skills/guides/character-persona-chain.md` | character-forge → cast-network → persona-voice → 连载 evolution |
| 状态演化链 | `skills/guides/state-evolution-chain.md` | world/character 基线 → continuity 章后 delta → context JIT |
| 叙事火花 | `skills/guides/narrative-spark-protocol.md` | production 捕获 → retention 分诊 → 登记册/beats 晋升 |
| 灵魂卡字段 | `skills/guides/character-soul-card-schema.md` | character-forge |
| 会话生产约束 | `skills/guides/session-production-limits.md` | production / batch / orchestrator |
| **生产完整性门禁** | `skills/guides/production-integrity-gates.md` | draft check + review meta/anti_padding |
| 会话接力 | `skills/guides/session-relay-protocol.md` | relay refresh · retention session-collect |
| 新会话接入 | `skills/guides/new-session-onboarding.md` | 人类 + 新 LLM 必读 |
| 登记册扩展字段 | `skills/guides/registry-field-extensions.md` | foreshadow / hook / continuity |

## 编排层

| Skill | 职责 |
|-------|------|
| novel-orchestrator | 总控、advance、blocked、rebuild 恢复 |

## 创建链（`creation-chain` · 每步隔离会话 · 13 步）

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
| 10 | foreshadow-engineer | foreshadowing、chekhov-guns |
| 11 | hook-manager | hooks、open-threads |
| 12 | batch-planner | beats（≤2章/batch）、batches |
| 13 | retention-analyst | plot-debt 汇总（outline 末步） |

## 连载链（`chapter-cycle` · 每章）

| 顺序 | Skill | 备注 |
|------|-------|------|
| 1 | context-router | manifest + context + **prose JIT** |
| 2 | chapter-production | 手稿 + **sparks draft** |
| 3 | dialogue-craftsman | **条件**：beats 含对话 |
| 4 | continuity-warden | memory + registries + appearance-log + **state logs** |
| 5 | persona-evolution-warden | persona-shifts active |
| 6 | retention-analyst | retention/ch-NNN.yaml + **spark 分诊** + session-collect |
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
pnpm smoke:all
```

编排真相源：`harness/workflows/` + `orchestrator-lib.mjs`  
**改 Skill 必查 workflow**：[`docs/harness/layer-sync-contract.md`](../docs/harness/layer-sync-contract.md)
