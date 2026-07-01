# Phase 02 — Characters（三阶人物链）

**Skill 链**：`character-forge`（5）→ `cast-network-weaver`（6）→ `persona-voice-binder`（7）

契约：[`skills/guides/character-persona-chain.md`](../../../../skills/guides/character-persona-chain.md)

## BEFORE

```bash
pnpm forge manifest characters stories/{id}
```

- `canon/world/rules.md`、`power-defects.yaml`
- `canon/background/premise.md`

## 阶 1 — character-forge（灵魂卡）

1. `canon/characters/index.yaml`
2. `canon/characters/{id}.md` — 年龄学龄、外貌锚点、能力缺陷、欲望恐惧秘密
3. 更新 `power-defects.yaml` 的 `character_bindings`

```bash
pnpm forge handoff complete stories/{id} --skill character-forge
pnpm forge validate stories/{id} --task characters
```

## 阶 2 — cast-network-weaver（关系网）

1. `canon/characters/cast-roster.yaml` — 含父母、师长、同学、组织
2. `canon/entities/graph.yaml` — relation 边
3. `registries/appearance-log.yaml` — `planned_first_ch`

```bash
pnpm forge handoff complete stories/{id} --skill cast-network-weaver
pnpm forge validate stories/{id} --task cast-network
```

## 阶 3 — persona-voice-binder（声线 + 转变预埋）

1. `canon/characters/voice-matrix.yaml`
2. `registries/persona-shifts.yaml` — planned 项

```bash
pnpm forge handoff complete stories/{id} --skill persona-voice-binder
pnpm forge validate stories/{id} --task persona-voice
```

## AFTER（全三阶完成）

- 人物秘密 → `foreshadowing.yaml` planned（可 foreshadow-engineer 步）
- `phase` → outlining · `sub_phase: outline`
- continuity-log

## 连载期维护

- `continuity-warden`：出场 log、`last_seen_chapter`
- `persona-evolution-warden`：每章激活 `persona-shifts`（见 [`06-post-chapter.md`](06-post-chapter.md)）
