# Agent 任务路由

| 你正在编辑的路径 | Phase | 主 Skill | workflow |
|------------------|-------|----------|----------|
| `stories/*/seed/` | 00 | seed-intake → novel-bootstrap | creation-chain |
| `stories/*/canon/world/` | 01 | world-architect | creation-chain |
| `stories/*/canon/characters/` | 02 | character-forge | creation-chain |
| `stories/*/canon/plot/outline*` | 03 | plot-architect | creation-chain |
| `stories/*/registries/foreshadow*` | 03 | foreshadow-engineer | creation-chain |
| `stories/*/registries/hooks*` | 03 | hook-manager | creation-chain |
| `stories/*/canon/plot/beats/` | 03 | batch-planner | creation-chain |
| `stories/*/manuscripts/` | 05 | context-router → chapter-production | chapter-cycle |
| 对话润色 | 05 | dialogue-craftsman | chapter-cycle（条件） |
| `stories/*/state/memory/` | 06 | continuity-warden | chapter-cycle |
| `stories/*/state/retention/` | 06 | retention-analyst | chapter-cycle / creation |
| `stories/*/state/reviews/` | 07 | rule-reviewer | chapter-cycle |
| `stories/*/state/revisions/` | 07 | patch-refiner / chapter-expander | patch-cycle |
| revision 全书 | 07 | chief-editor → style-guardian | revision-volume |
| 元数据乱 | 08 | canon-rebuilder | rebuild-chain |
| 全流程 | — | novel-orchestrator | `forge next` |

每步：`pnpm forge next` → 工作 → `pnpm forge handoff complete`  
细则：[`skills/guides/handoff-protocol.md`](../../skills/guides/handoff-protocol.md)
