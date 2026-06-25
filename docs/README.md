# Novel Forge 文档门户

约 1 屏索引。复杂任务进 [`harness/README.md`](harness/README.md)。

## 正式生成（优先）

- **开书快速指南**：[`ops/quickstart-new-book.md`](ops/quickstart-new-book.md) — 一页纸开书流程
- **首跑清单**：[`ops/first-run-checklist.md`](ops/first-run-checklist.md) — 详细步骤和验收清单
- **五层联动契约**：[`harness/layer-sync-contract.md`](harness/layer-sync-contract.md) — 改 Skill/workflow/文档必查
- **框架现状**：[`ops/framework-status.md`](ops/framework-status.md)
- **Skill 团队**：[`../skills/README.md`](../skills/README.md)

## 架构

- [`architecture/pipeline-state-machine.md`](architecture/pipeline-state-machine.md) — 状态机唯一真相源
- [`architecture/context-budget-system.md`](architecture/context-budget-system.md) — **防雪球：L0 INDEX + 熔断器（第十轮）**
- [`architecture/unified-pipeline.md`](architecture/unified-pipeline.md) — Skill 编排
- [`architecture/memory-system.md`](architecture/memory-system.md)
- [`architecture/story-directory-schema.md`](architecture/story-directory-schema.md)

## 运维

- [`ops/roadmap.md`](ops/roadmap.md)
- **上下文预算迭代（第十轮）**：[`ops/context-budget-iteration.md`](ops/context-budget-iteration.md)
- **生产完整性迭代**：[`ops/harness-integrity-iteration.md`](ops/harness-integrity-iteration.md)
- **叙事引擎迭代**：[`ops/story-engine-iteration.md`](ops/story-engine-iteration.md)
- **字数哲学**：[`../skills/guides/word-count-philosophy.md`](../skills/guides/word-count-philosophy.md) — 故事合理性优先于字数达标
- **根项目保护**：[`ops/root-project-protection.md`](ops/root-project-protection.md) — 防止书籍生产污染根项目
- **错误恢复指南**：[`ops/error-recovery-guide.md`](ops/error-recovery-guide.md) — 流程卡住/手稿写坏时的恢复路径
- **单书生命周期**：[`ops/book-lifecycle.md`](ops/book-lifecycle.md) — 从创建到归档的完整管理
- **质量门禁检查清单**：[`ops/quality-gates-checklist.md`](ops/quality-gates-checklist.md) — 每章/每卷/每书的质量检查

## 每章 Skill 链（drafting）

**navigator** → `context-router` → `chapter-production` → [`dialogue-craftsman` 条件] → `continuity-warden` → `persona-evolution-warden` → `retention-analyst` → `rule-reviewer` → `phase advance`

开书：`creation-chain` 14 步（见 `skills/README.md`）

## 创作任务速查

| 我想… | Skill |
|-------|-------|
| 总控 | `@novel-orchestrator` |
| **写章前体检/防雪球** | `@navigator`（必跑） |
| seed 问答 | `@seed-intake` |
| 世界观 | `@world-architect` |
| 人物 | `@character-forge` |
| 宏观大纲 | `@plot-architect` |
| 叙事引擎/对立/爽哭规划 | `@conflict-architect` |
| 伏笔/钩子 | `@foreshadow-engineer` `@hook-manager` |
| 分批 beats | `@batch-planner` |
| 写章 | `@context-router` → `@chapter-production` |
| 章后 | `@continuity-warden` → `@persona-evolution-warden` → `@retention-analyst` |
| 评审 | `@rule-reviewer` |
| 修补 | `@patch-refiner` 等（patch-cycle） |

写作门禁：[`skills/guides/golden-rules.md`](../skills/guides/golden-rules.md)
