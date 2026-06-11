# Phase 05 — 章节写作

workflow：`chapter-cycle` · 步 1–3

## 顺序

1. `@context-router` — `forge context` → handoff
2. `@chapter-production` — 手稿 → handoff
3. `@dialogue-craftsman` — **仅** beats 含对话时（`when_dialogue`）→ handoff
4. 交 `@continuity-warden`（Phase 06）

## BEFORE（production）

```bash
pnpm forge manifest chapter-draft stories/{id} --chapter N
```

读 beats、registries 中本章须 plant/回应项。

## DURING

- `manuscripts/chapters/ch-{NNN}.md`
- frontmatter：`chapter`, `title`, `pov`, `timeline_marker`
- 遵守 `skills/guides/golden-rules.md`
- 涌现灵感 → `state/working/sparks/ch-{NNN}-draft.yaml`（见 `narrative-spark-protocol.md`）；**禁止**直接改 `outline.md`

## 字数与完整性预检（production handoff 前 · 硬门禁）

```bash
pnpm forge draft check stories/{id} --chapter N
```

须 **integrity: ok** 且 wordcount tier ≠ fail。见 `skills/guides/production-integrity-gates.md` · `session-production-limits.md`。

## 禁止

同一对话连续执行 continuity / review；须 `forge handoff complete` 逐步交接。
