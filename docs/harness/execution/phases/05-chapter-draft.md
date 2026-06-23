# Phase 05 — 章节写作

workflow：`chapter-cycle` · 步 0–3

## 顺序

0. **`@navigator`** —（第十轮新增 · 防雪球）读 L0 INDEX 输出 `state/working/context-plan-ch-{NNN}.yaml` → handoff
1. `@context-router` — 按 plan 决定 mode + `forge context` → handoff
2. `@chapter-production` — 手稿 → handoff
3. `@dialogue-craftsman` — **仅** beats 含对话时（`when_dialogue`）→ handoff
4. 交 `@continuity-warden`（Phase 06）

## BEFORE（navigator）

```bash
pnpm forge doctor stories/{id} --chapter N      # 体检：circuit_state
pnpm forge nav build stories/{id} --chapter N   # 生成 context-plan
```

新书：`forge sync framework` 已生成三份 INDEX 模板，可直接跑。  
旧书：navigator 自动调 `forge nav rebuild` fallback。

## BEFORE（production）

```bash
pnpm forge manifest chapter-draft stories/{id} --chapter N
```

读 beats、**story-engine**（throughline + 本章 conflict_active）、registries 中本章须 plant/回应/兑现的爽点与哭点。

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

**字数哲学**：故事合理性优先于字数达标。字数是参考指标，不是硬性目标。详见 `skills/guides/word-count-philosophy.md`

## 禁止

同一对话连续执行 continuity / review；须 `forge handoff complete` 逐步交接。
