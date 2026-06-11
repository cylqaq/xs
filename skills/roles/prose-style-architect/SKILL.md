---
name: prose-style-architect
description: >-
  Establishes per-book narrative prose contract in creation-chain step 4. After
  novel-bootstrap, before world-architect. Writes canon/style and prose-profile.
---

# Prose Style Architect（叙述文笔契约）

## 工作流位置

`creation-chain` 第 4 步 · 读 `@novel-bootstrap` handoff · 交 `@world-architect`

## BEFORE

1. `seed/layer1-core.yaml`、`layer2-customize.yaml`（含 `prose_reference`、`sentence_rhythm`、`emotional_temperature`）
2. `novel.yaml`（`genre`、`pov`）
3. 可选 `workspace/user-preferences.json`（仅默认，本书 canon 为准）
4. [`skills/guides/prose-style-protocol.md`](../../guides/prose-style-protocol.md)
5. 匹配 `harness/style-profiles/` 母版（按 `novel.yaml` genre 或 seed genre 文本）

## DURING — 产出

1. **`canon/style/prose-profile.yaml`** — `status: ready`，合并类型母版 + seed 定制
2. **`canon/style/voice.md`** — POV、时态、距离感、对话风格、禁忌用语（与 profile 一致）
3. **`canon/style/glossary.md`** — 初版专有名词策略（可仅写规则段）
4. **`canon/style/exemplars/positive.md`** — ≥1 段示范腔调（可仿写 seed 参考）
5. **`canon/style/exemplars/negative.md`** — ≥1 段反例（对应 anti_patterns）
6. **`state/writing-plan.json`** — 按 `writing_plan_hints` 覆盖 `minWordsPerChapter` 等
7. **`state/checkpoints/prose-style.yaml`** — `completed: true`、`profile_version: 1`

## 规则

1. `signature_moves` ≥2、`anti_patterns` ≥1；`kill_list` 合并母版 `default_kill_list` + seed `hard_bans`
2. `use_framework_crutch_list: true` 除非作者明确要求关闭
3. `voice.md` 的 **POV 行须含 `novel.yaml` 的 `pov` 令牌**（例：`third-limited（第三人称限知）`），供 `forge review` `pov_consistency` 校验
4. 禁止把文笔约束只写在对话或临时 md；必须入库上述路径
5. 世界观描写粒度须与 `emotional_temperature` 一致（交给 world-architect 延续）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill prose-style-architect
```

postflight：`validate --task prose-style`
