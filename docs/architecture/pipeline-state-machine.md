# 流水线状态机（唯一真相源）

其他文档（`production-pipeline.md`、`unified-pipeline.md`、`lifecycle.md`）的**状态迁移以此为准**。

## 全书阶段

```
ideation → worldbuilding → outlining → drafting ⇄ revision → publish
```

| 阶段 | phase.yaml `phase` | 主 manifest | 主 Skill 链 |
|------|-------------------|-------------|-------------|
| 创建 | ideation | `bootstrap` / `prose-style` | orchestrator → seed-intake → intake check → novel-bootstrap → **prose-style-architect** |
| 世界观 | worldbuilding | `worldbuilding` | world-architect |
| 人物 | outlining · `sub_phase: characters` | `characters` | character-forge → cast-network-weaver → persona-voice-binder |
| 大纲/批次 | outlining | `outline-batch` | plot-architect → foreshadow-engineer → hook-manager → batch-planner → retention-analyst |
| 连载 | drafting | `chapter-draft` / `post-chapter` | context-router → chapter-production → [dialogue-craftsman] → continuity-warden → persona-evolution-warden → retention-analyst → rule-reviewer → advance |
| 卷级精修 | revision | `revision-volume` | chief-editor → style-guardian → patch-refiner → rule-reviewer |
| 元数据重建 | drafting · `sub_phase: rebuild-canon` | `rebuild-canon` | canon-rebuilder → novel-orchestrator（`rebuild-chain`） |
| 发布 | publish | — | 导出脚本（待建） |

**五层联动**（改本文必查 workflow / Skill）：[`../harness/layer-sync-contract.md`](../harness/layer-sync-contract.md)

## 章号权威源

**`state/phase.yaml` 为权威**；`novel.yaml` 的 `last_completed_chapter` / `current_chapter` / `status` 由 `forge phase sync` 或 `forge phase advance` 镜像。

## 单章微生命周期（drafting）

```
BEFORE  manifest chapter-draft + forge context
DURING  chapter-production → [dialogue-craftsman 当 beats 含对话]（workflow `when_dialogue`）
        GATE-PROD  draft check：wordcount 非 fail + integrity ok（handoff 硬拒）
AFTER   manifest post-chapter → continuity-warden → persona-evolution-warden → retention-analyst
GATE    rule-reviewer handoff（cli_postflight: review；含 meta_prose_leakage + anti_padding；FAIL 拒绝 handoff）
        ├─ PASS → 全章 handoff 齐全 → forge phase advance --chapter N
        │         → 写 novel-orchestrator handoff · sync read-order · session-collect 高优门禁
        └─ FAIL → patch-cycle（review 自动脚手架 revisions/；forge next 路由 delegate_skill）
              → re-review（review_round++，>3 → blocked）
```

## review 失败路由

| action_items.delegate_skill | 场景 |
|----------------------------|------|
| patch-refiner | meta_prose_leakage、anti_padding、钩子、POV、爽点、禁忌词、AI 套话、微兑现 |
| chapter-expander | wordcount tier=**fail**（低于 minWordsHardFail，默认 1600） |
| dialogue-craftsman | dialogue_quality |
| continuity-warden | character_consistency、timeline_order |
| dialogue-craftsman | persona_voice、dialogue_quality |
| persona-evolution-warden | persona_shifts 登记遗漏 |
| chapter-production | 手稿缺失、伏笔 debt |

## CLI 与阶段绑定

```bash
pnpm forge manifest bootstrap|prose-style stories/{id}
pnpm forge manifest outline-batch stories/{id} --chapter 1
pnpm forge manifest chapter-draft stories/{id} --chapter N
pnpm forge manifest post-chapter stories/{id} --chapter N
pnpm forge review stories/{id} --chapter N
pnpm forge phase advance stories/{id} --chapter N
pnpm forge workflow validate
pnpm smoke:all
pnpm forge handoff complete|status ...
forge validate stories/{id} --task bootstrap|outline-batch|rebuild-canon|...
forge phase advance ... # --force 须 --reason "审计说明"
```
