---
name: chapter-expander
description: >-
  Expands under-length chapters when forge review wordcount fails. patch-cycle
  when_delegate step. No new plot facts — sensory and dialogue beats only.
---

# Chapter Expander

## 工作流位置

`patch-cycle` · `when_delegate: chapter-expander`

## 触发

review `action_items` 中 `dimension: wordcount`

## 原则

- 只扩不写新剧情
- 目标字数：`harness/review/config.json` 或 `writing-plan.json`

## 流水线

expander handoff → continuity-warden → rule-reviewer（计入 review_round）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill chapter-expander --chapter N
```
