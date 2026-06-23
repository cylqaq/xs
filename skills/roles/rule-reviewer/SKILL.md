---
name: rule-reviewer
description: >-
  Runs zero-LLM forge review in Novel Forge. Mandatory cli_postflight on
  handoff complete. Review dimensions in harness/review/rules/README.md. Use in
  chapter-cycle and revision-volume re-review steps. Dimensions listed in
  harness/review/rules/README.md.
---

# Rule Reviewer（评审阶段）

## 工作流位置

- `chapter-cycle` 评审步 · 读 `@retention-analyst` handoff
- `revision-volume` / `patch-cycle` 末步 re-review

## 执行（由 handoff 强制，勿跳过）

```bash
pnpm forge handoff complete stories/{id} --skill rule-reviewer --chapter N
```

内部跑 `forge review`；FAIL 时 handoff 拒绝，交 `patch-cycle`。

**禁止调用 LLM**。只解释 JSON 并按 `action_items[].delegate_skill` 委派。

## 十一维 + 完整性

见 `harness/review/rules/README.md` · 阈值 `harness/review/config.json`

**硬 FAIL（不可 handoff）**：

- `meta_prose_leakage` — 登记册/chN/框架术语
- `anti_padding` — 重复章末、弧光摘要凑字
- `wordcount` tier=fail

**字数哲学**：故事合理性优先于字数达标。字数是参考指标，不是硬性目标。详见 [`word-count-philosophy.md`](../../guides/word-count-philosophy.md)

## 通过后
