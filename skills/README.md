# 项目级 Skills（AI 团队 · 20 角色）

通过 **`pnpm forge next`** + **workflow 五步/章链** 编排，**禁止孤岛**（见 `unified-pipeline.md`、`harness/workflows/README.md`）。

**多智能体**：一次会话一个 Skill → `forge handoff complete` → 下一会话 `forge next`。细则：[`guides/handoff-protocol.md`](guides/handoff-protocol.md)

## 编排层

| Skill | 职责 |
|-------|------|
| novel-orchestrator | 总控、advance、blocked、rebuild 恢复 |

## 创建链（`creation-chain` · 每步隔离会话）

| 顺序 | Skill | 产出要点 |
|------|-------|----------|
| 1 | novel-orchestrator | manifest bootstrap |
| 2 | seed-intake | seed 三层 + `intake check` |
| 3 | novel-bootstrap | premise、phase→worldbuilding |
| 4 | world-architect | canon/world |
| 5 | character-forge | canon/characters |
| 6 | plot-architect | outline.md、arcs.yaml |
| 7 | foreshadow-engineer | foreshadowing、chekhov-guns |
| 8 | hook-manager | hooks、open-threads |
| 9 | batch-planner | beats（≤2章/batch）、batches |
| 10 | retention-analyst | plot-debt 汇总（outline 末步） |

## 连载链（`chapter-cycle` · 每章）

| 顺序 | Skill | 备注 |
|------|-------|------|
| 1 | context-router | manifest + context |
| 2 | chapter-production | 手稿 |
| 3 | dialogue-craftsman | **条件**：beats 含对话 |
| 4 | continuity-warden | memory + registries |
| 5 | retention-analyst | retention/ch-NNN.yaml |
| 6 | rule-reviewer | **强制** review postflight |
| 7 | novel-orchestrator | phase advance |

## 补丁链（`patch-cycle` · review FAIL）

novel-orchestrator 读 `delegate_skill` → patch-refiner | chapter-expander | dialogue-craftsman | continuity-warden → rule-reviewer

## 卷精修（`revision-volume`）

chief-editor → style-guardian → patch-refiner → rule-reviewer

## 维护（`rebuild-chain` · `sub_phase: rebuild-canon`）

canon-rebuilder → novel-orchestrator 恢复 drafting

## CLI 速查

```bash
pnpm forge next|run|handoff|workflow validate stories/{id}
pnpm forge intake|manifest|context|validate|review|compact|phase advance
pnpm smoke:all
```

编排真相源：`harness/workflows/` + `orchestrator-lib.mjs`  
**改 Skill 必查 workflow**：[`docs/harness/layer-sync-contract.md`](../docs/harness/layer-sync-contract.md)
