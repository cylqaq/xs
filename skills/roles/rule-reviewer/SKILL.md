---
name: rule-reviewer
description: >-
  Runs zero-LLM forge review in Novel Forge. Mandatory cli_postflight on
  handoff complete. Eleven dimensions with delegate_skill routing. Use in
  chapter-cycle and revision-volume re-review steps.
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

## 十一维

见 `harness/review/rules/README.md` · 阈值 `harness/review/config.json`

## 通过后

orchestrator 执行 `pnpm forge phase advance --chapter N`（须本章 handoff 齐全）。
