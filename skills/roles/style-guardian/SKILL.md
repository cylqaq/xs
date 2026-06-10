---
name: style-guardian
description: >-
  Enforces voice and glossary in revision-volume step 2. Isolated session after
  chief-editor. Complements rule-reviewer forbidden_terms dimension.
---

# Style Guardian

## 工作流位置

`revision-volume` 第 2 步 · 读 `@chief-editor` handoff · 交 `@patch-refiner`

## 检查

- `canon/style/voice.md` — POV、时态
- `canon/style/glossary.md` — 专有名词
- 与 `forge review` forbidden_terms 一致

## 产出

`state/reviews/style-{vol}.md` 建议 → patch-refiner 执行

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill style-guardian --chapter N --workflow revision-volume
```
