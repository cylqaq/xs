---
name: chapter-production
description: >-
  Drafts a novel chapter in Novel Forge chapter-cycle step 2. Reads context-router
  handoff and manifest. Writes manuscripts/chapters/ch-NNN.md only — does not
  run continuity or review.
---

# Chapter Production

## 工作流位置

`chapter-cycle` 第 2 步 · 读 `@context-router` handoff · 交 `@dialogue-craftsman`（条件）或 `@continuity-warden`

## BEFORE

1. `docs/harness/execution/phases/05-chapter-draft.md`
2. `pnpm forge manifest chapter-draft stories/{id} --chapter N`
3. 确认 `canon/plot/beats/ch-{NNN}.md` 存在

## DURING

- `manuscripts/chapters/ch-{NNN}.md`
- Frontmatter: chapter, title, pov, timeline_marker
- 埋伏笔/钩子 → 同步 `registries/` status

## 禁止

- 自行宣布章完成
- 在同一对话执行 continuity / review
- **同一会话写超过 `writing-plan.json` 的 `maxChaptersPerSession` 章**（默认 4；见 [`session-production-limits.md`](../../guides/session-production-limits.md)）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill chapter-production --chapter N
```

遵守 [`guides/golden-rules.md`](../../guides/golden-rules.md)
