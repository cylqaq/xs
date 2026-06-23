# Agent 任务路由

| 你正在编辑的路径 | Phase | 主 Skill | workflow |
|------------------|-------|----------|----------|
| `stories/*/canon/INDEX.yaml` | 任意 | continuity-warden（写）/ navigator（读） | 任意 |
| `stories/*/registries/INDEX.yaml` | 任意 | continuity-warden + retention-analyst | 任意 |
| `stories/*/state/memory/INDEX.yaml` | 任意 | continuity-warden | 任意 |
| `stories/*/state/working/context-plan-ch-*.yaml` | 05 | navigator | chapter-cycle 第 0 步 |
| `stories/*/seed/` | 00 | seed-intake → novel-bootstrap | creation-chain |
| `stories/*/canon/style/` | 00b | prose-style-architect | creation-chain |
| `stories/*/canon/world/` | 01 | world-architect | creation-chain |
| `stories/*/canon/characters/` | 02 | character-forge → cast-network-weaver → persona-voice-binder | creation-chain |
| `stories/*/registries/persona-shifts.yaml` | 02 / 06 | persona-voice-binder / persona-evolution-warden | creation / chapter-cycle |
| `stories/*/registries/appearance-log.yaml` | 02 / 06 | cast-network-weaver / continuity-warden | creation / chapter-cycle |
| `stories/*/canon/plot/outline*` | 03 | plot-architect | creation-chain |
| `stories/*/canon/plot/story-engine.yaml` | 03 | conflict-architect | creation-chain |
| `stories/*/registries/emotional-beats.yaml` | 03 / 06 | conflict-architect / retention-analyst | creation / chapter-cycle |
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

**字数哲学**：故事合理性优先于字数达标。详见 [`skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md)

**根项目保护**：防止书籍生产污染根项目。详见 [`docs/ops/root-project-protection.md`](../ops/root-project-protection.md)
