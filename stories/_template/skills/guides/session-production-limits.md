# 会话生产约束（Session Production Limits）

> **性质**：框架硬/软约束，写入 `state/writing-plan.json`，全 Skill 须遵守。  
> **完整性门禁**：见 [`production-integrity-gates.md`](production-integrity-gates.md)  
> **字数哲学**：见 [`word-count-philosophy.md`](word-count-philosophy.md) — 故事合理性优先于字数达标

## 字数

| 项 | 默认 | 配置键 | 校验 |
|----|------|--------|------|
| 单章目标 band | **2000–4500** 汉字 | `minWordsPerChapter` / `maxWordsPerChapter` | production 自律 + `forge draft check` |
| 硬下限（review FAIL） | **1600** 汉字 | `minWordsHardFail` | `rule-reviewer` wordcount tier=fail → `chapter-expander` |
| 未达目标 | 1600–1999 | — | review **PASS** + wordcount tier=warn（禁止凑单行/章末） |
| 体裁阈值 | `harness/review/config.json` | — | 可被 writing-plan 覆盖 |

## 完整性（硬门禁）

| 项 | 校验 | 失败 |
|----|------|------|
| meta 泄漏 | `forge draft check` · `review` · `meta_prose_leakage` | handoff **拒绝** |
| 章末凑字 | `anti_padding` | handoff **拒绝** → `@patch-refiner` |

## 章数

| 项 | 默认 | 配置键 | 强制方 |
|----|------|--------|--------|
| **单次对话最多正文章数** | **2** | `maxChaptersPerSession` | novel-orchestrator / chapter-production |
| 单批 beats 上限 | **2** | `maxChaptersPerBatch` | batch-planner（硬） |
| 两章间 | 必须完整 chapter-cycle | — | handoff + review |

## 铁律

1. **禁止**同一会话连续写超过 `maxChaptersPerSession` 章而不新开对话
2. **禁止**同一会话扮演 production + continuity + reviewer
3. **禁止** integrity 失败时 `handoff complete @chapter-production`
4. 每章结束：`continuity` → `persona-evolution` → `retention` → `review` →（可选）`phase advance` → `forge relay refresh`
5. beats 未就绪时禁止 production（先 batch-planner）

## 反 lazy（字数 + 完整性）

1. handoff 前：`pnpm forge draft check stories/{id} --chapter N` — 字数 + **integrity 均须 ok**
2. tier=warn：可 handoff；优先按 beats **中段整段**扩写，**禁止**章末堆「第 N 日尽」/弧光摘要
3. tier=fail（字数）：交 `patch-cycle` / `@chapter-expander`，每章 ≤2 轮
4. integrity fail：交 `@patch-refiner`，删 meta/重复段，**禁止**用登记册语言替换
5. **禁止**「数汉字 → 改一行 → 再数」超过 2 循环

## 相关

- [`production-integrity-gates.md`](production-integrity-gates.md)
- [`session-relay-protocol.md`](session-relay-protocol.md)
- [`../roles/batch-planner/SKILL.md`](../roles/batch-planner/SKILL.md)
- [`../roles/chapter-production/SKILL.md`](../roles/chapter-production/SKILL.md)
