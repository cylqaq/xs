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
- 目标字数：`writing-plan.json` 的 **target band**（默认 2000–4500）；硬下限 `minWordsHardFail`（默认 1600）以下才强制介入
- **禁止**用 meta、重复章末、弧光摘要扩写 — integrity 维 fail 须交 `@patch-refiner`
- **禁止**为凑字数追加无叙事功能的短句/单字

## 流水线

expander handoff → continuity-warden → rule-reviewer（计入 review_round）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill chapter-expander --chapter N
```
