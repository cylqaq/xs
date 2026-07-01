# Phase 00b — Prose Style（叙述文笔契约）

**Skill**：`prose-style-architect`（creation-chain 第 4 步）

> 在 `novel-bootstrap` 之后、`world-architect` 之前。将 seed 文笔意图升格为可执行 Canon + 机械校验源。

## BEFORE

```bash
pnpm forge manifest prose-style stories/{id}
```

- `seed/layer2-customize.yaml`（`prose_reference`、`sentence_rhythm`、`emotional_temperature`、`hard_bans`）
- `novel.yaml`、`canon/background/premise.md`
- `harness/style-profiles/{genre}.yaml`（框架母版）

## DURING

1. 匹配类型母版（`resolveGenreProfileKey` 逻辑见 `forge-lib.mjs`）
2. 写 `canon/style/prose-profile.yaml` → `status: ready`
3. 写 `canon/style/voice.md`、`glossary.md`、exemplars
4. 按需更新 `state/writing-plan.json`
5. `state/checkpoints/prose-style.yaml` → `completed: true`

## AFTER

```bash
pnpm forge handoff complete stories/{id} --skill prose-style-architect
pnpm forge validate stories/{id} --task prose-style
```

- 交接 `@world-architect`（Phase 01）

## 旧书补齐

```bash
pnpm forge sync framework stories/{id}
# 再跑 @prose-style-architect 直至 validate prose-style PASS
```

契约：[`skills/guides/prose-style-protocol.md`](../../../../skills/guides/prose-style-protocol.md)
