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
4. 确认 `canon/style/prose-profile.yaml` 为 `status: ready`（见 [`prose-style-protocol.md`](../../guides/prose-style-protocol.md)）

## DURING

- `manuscripts/chapters/ch-{NNN}.md`
- Frontmatter: chapter, title, pov, timeline_marker
- 埋伏笔/钩子 → 同步 `registries/` status
- **叙事火花**：写章中若涌现 beats 未覆盖的小情节/物件/关系微变 → 写入 `state/working/sparks/ch-{NNN}-draft.yaml`（≤5 条/章，见 [`narrative-spark-protocol.md`](../../guides/narrative-spark-protocol.md)）

## 字数与完整性（handoff 前 · CLI 硬门禁）

```bash
pnpm forge draft check stories/{id} --chapter N
```

**必须** `integrity: ok` 且 wordcount tier ≠ fail，否则 `handoff complete` **被 CLI 拒绝**。

- tier **ok/long** + integrity ok：可 handoff
- tier **warn**（1600–1999，未达目标 2000）：可 handoff；优先扩 **beats 中段**，禁止章末堆字
- tier **fail**（低于 `minWordsHardFail` 1600）：不得 handoff → `@chapter-expander`
- **integrity fail**：不得 handoff → 删 meta/重复章末后重跑 draft check

见 [`production-integrity-gates.md`](../../guides/production-integrity-gates.md)

## 禁止

- 自行宣布章完成
- 在同一对话执行 continuity / review
- **同一会话写超过 `maxChaptersPerSession` 章**（默认 **2**；见 [`session-production-limits.md`](../../guides/session-production-limits.md)）
- **因火花直接改** `outline.md` / `arcs.yaml`（须走 spark 分诊 → 晋升流程）
- **正文写登记册 id**（`hk-001`、`fs-005` 等）、**章编号 meta**（`ch5`、`ch72`）、**框架术语**（表世界、缺陷链、这本书、关键道具、同桌线起）——只写 `registries/`，review `meta_prose_leakage` 会 FAIL
- **为凑字数重复章末收束**（同场景/同意象连续多段「第 N 日尽」式摘要）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill chapter-production --chapter N
```

遵守 [`guides/golden-rules.md`](../../guides/golden-rules.md) · [`production-integrity-gates.md`](../../guides/production-integrity-gates.md)
