# 本书读序（覆盖全局默认）

## 新会话入口（必读顺序）

1. **`state/working/session-relay.md`** — 接力包（`pnpm forge relay refresh`）
2. 本文 `harness/read-order.md`
3. `AGENTS.md` 铁律
4. `state/phase.yaml`

## ideation

1. seed/author-intent.md
2. `@seed-intake` → seed/layer1-core.yaml 等
3. docs/harness/execution/phases/00-bootstrap.md

## outlining

1. `canon/plot/outline.md`、`arcs.yaml`
2. `pnpm forge next` → 当前 creation-chain Skill

## drafting 第 N 章

```bash
pnpm forge relay refresh stories/{本书id}
pnpm forge context stories/{本书id} --chapter N
pnpm forge manifest chapter-draft stories/{本书id} --chapter N
```

1. state/memory/summary-rolling.md
2. state/working/session-collect.yaml（待作者答项）
3. canon/plot/beats/ch-{NNN}.md
4. registries/foreshadowing.yaml、hooks.yaml（本章相关）
5. canon/characters/voice-matrix.yaml + persona-shifts（生效项）
6. 出场角色灵魂卡 `canon/characters/{id}.md`

**约束**：单次会话 ≤ `writing-plan.json` 的 `maxChaptersPerSession`（默认 4）章正文。

写后：`manifest post-chapter` → phases/06-post-chapter.md → `forge relay refresh`
