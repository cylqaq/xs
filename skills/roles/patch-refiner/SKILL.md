---
name: patch-refiner
description: >-
  Patch-based refinement after review failures in patch-cycle or revision-volume.
  Produces revision triples in state/revisions/. Max 3 review rounds per chapter.
---

# Patch Refiner

## 工作流位置

- `patch-cycle` · `when_delegate: patch-refiner`
- `revision-volume` 第 3 步 · 读 `@style-guardian` handoff

## 输入

仅 `state/reviews/ch-{NNN}.json` 的 `action_items[]`（`dimension`、`message`、`hint`）

**integrity 维**（`meta_prose_leakage`、`anti_padding`）：

- 删除正文中的登记册 id、chN、框架术语
- 删除重复「第 N 日尽」与弧光摘要段；**禁止**用 meta 替换 meta
- 若需增字数 → 仅扩 beats **中段**（ `@chapter-expander` 仅处理 wordcount fail）

文笔维（`pov_consistency`、`forbidden_terms`、`ai_crutch_words`）对照 `canon/style/prose-profile.yaml` 修补，不另造标准。

## 产出（三元组）

```
state/revisions/ch-{NNN}-r{round}/
  original.md
  patch.md
  diff.md
```

确认后 `patch.md` 覆盖手稿 → `@continuity-warden` → `@rule-reviewer`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill patch-refiner --chapter N
```

revision-volume postflight：`validate --task revision-volume`
