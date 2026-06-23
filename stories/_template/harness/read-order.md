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
pnpm forge sync framework stories/{本书id}    # 框架升级后补缺（不覆盖已有 canon）
pnpm forge doctor stories/{本书id} --chapter N   # 第十轮 · 必跑：体检 + INDEX 鲜度
pnpm forge nav build stories/{本书id} --chapter N  # 生成 context-plan（防雪球）
pnpm forge context stories/{本书id} --chapter N
pnpm forge manifest chapter-draft stories/{本书id} --chapter N
```

读序（**navigator 先按 INDEX 命中，主笔再读**）：

1. **navigator 输出**：`state/working/context-plan-ch-{NNN}.yaml`
2. **L0 INDEX 三件套**：`canon/INDEX.yaml`、`registries/INDEX.yaml`、`state/memory/INDEX.yaml`
3. **canon/style/prose-profile.yaml** + **voice.md** + exemplars（须 `status: ready`）
4. state/memory/summary-rolling.md
5. state/working/session-collect.yaml（待作者答项）
6. registries/narrative-sparks.yaml（待分诊/已 deferred 高潜火花）
7. canon/plot/beats/ch-{NNN}.md
8. registries/foreshadowing.yaml、hooks.yaml（snapshot 仅 open + due_within_5ch）
9. canon/characters/voice-matrix.yaml + persona-shifts（生效项）
10. 出场角色灵魂卡 `canon/characters/{id}.md`（由 INDEX.characters[].file 命中）

**约束**：
- 单次会话 ≤ `writing-plan.json` 的 `maxChaptersPerSession`（默认 2）章正文
- 字数 band 2000–4500，故事合理性优先（详见 `skills/guides/word-count-philosophy.md`）
- production handoff 前须 `pnpm forge draft check` integrity ok
- `forge doctor` 须 `circuit_state: green` 或 `yellow`；`red` 必须 `forge nav rebuild` 后重试

写后：`manifest post-chapter` → phases/06-post-chapter.md → `forge relay refresh`
