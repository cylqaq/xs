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
