---
name: persona-voice-binder
description: >-
  Binds speech patterns and personality baselines in creation-chain step 7.
  After cast-network-weaver, before plot-architect. Initializes persona-shifts.
---

# Persona Voice Binder（声线绑定）

## 工作流位置

`creation-chain` 第 8 步 · 读 `@cast-network-weaver` handoff · 交 `@plot-architect`

## 产出

- `canon/characters/voice-matrix.yaml` — 每人：register、verbal_tics、forbidden_ooc、sample_lines
- `registries/persona-shifts.yaml` — `planned` 性格转变（含 `voice_delta`、`trigger_chapter`）

## 必读

- 所有 `core` / `major` 角色 `{id}.md`
- `cast-roster.yaml`、`power-defects.yaml`（缺陷可驱动转变触发）
- **`canon/style/prose-profile.yaml`** — 对白 register 须对齐叙述 distance / emotional_temperature
- [`skills/guides/character-persona-chain.md`](../../guides/character-persona-chain.md)
- [`skills/guides/prose-style-protocol.md`](../../guides/prose-style-protocol.md)

## 规则

1. 每个 `core` 角色至少 2 条 `sample_lines`、≥3 条 `forbidden_ooc`
2. 重大性格转变须在 `persona-shifts` 预埋，禁止无登记突变
3. `voice_delta` 须可执行（如「句长变短、去掉语气词、改用敬称」）
4. 声线与年龄、学龄、`narrative_age_span` 一致

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill persona-voice-binder
```

postflight：`validate --task persona-voice`
