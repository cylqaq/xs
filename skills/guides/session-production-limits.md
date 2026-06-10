# 会话生产约束（Session Production Limits）

> **性质**：框架硬/软约束，写入 `state/writing-plan.json`，全 Skill 须遵守。

## 字数

| 项 | 默认 | 配置键 | 校验 |
|----|------|--------|------|
| 单章下限 | 3000 汉字 | `minWordsPerChapter` | `rule-reviewer` wordcount |
| 单章上限（软） | 6000 汉字 | `maxWordsPerChapter` | 人工/Agent 自律 |
| 体裁阈值 | `harness/review/config.json` | — | 可被 writing-plan 覆盖 |

## 章数

| 项 | 默认 | 配置键 | 强制方 |
|----|------|--------|--------|
| **单次对话最多正文章数** | **4** | `maxChaptersPerSession` | novel-orchestrator / chapter-production |
| 单批 beats 上限 | **2** | `maxChaptersPerBatch` | batch-planner（硬） |
| 两章间 | 必须完整 chapter-cycle | — | handoff + review |

## 铁律

1. **禁止**同一会话连续写超过 `maxChaptersPerSession` 章而不新开对话
2. **禁止**同一会话扮演 production + continuity + reviewer
3. 每章结束：`continuity` → `persona-evolution` → `retention` → `review` →（可选）`phase advance` → `forge relay refresh`
4. beats 未就绪时禁止 production（先 batch-planner）

## 相关

- [`session-relay-protocol.md`](session-relay-protocol.md)
- [`../roles/batch-planner/SKILL.md`](../roles/batch-planner/SKILL.md)
- [`../roles/chapter-production/SKILL.md`](../roles/chapter-production/SKILL.md)
