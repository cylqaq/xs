---
name: character-forge
description: >-
  Creates character bibles in creation-chain step 5. Isolated session after
  world-architect. Writes canon/characters before plot-architect. Binds
  appearance, age, and power-defect instances.
---

# Character Forge

## 工作流位置

`creation-chain` 第 5 步 · 读 `@world-architect` handoff · 交 `@cast-network-weaver`

## 产出

- `canon/characters/index.yaml`
- `canon/characters/{id}.md` — 字段见 [`character-soul-card-schema.md`](../../guides/character-soul-card-schema.md)
- 更新 `canon/world/power-defects.yaml` 的 `character_bindings`（与 world 规则一致）

## 人物卡必填节

1. **年龄与学龄** — 与 `seed/layer2` 的 `narrative_age_span`、`protagonist_age_gap` 一致
2. **外貌锚点** — 可复述的视觉特征（写作时禁止漂移）
3. **能力** — 引用 `rules.md` / `power-defects.yaml`，不得超上限
4. **缺陷实例** — 每人至少 2 项缺陷及**首次触发场景草案**
5. **欲望 / 恐惧 / 秘密** — 与缺陷链咬合
6. **关系网与说话风格**

## 规则

- 新人名须先建卡或 `new_pending` 入 summary
- 缺陷必须来自 `power-defects.yaml` 的 `defect_types`，不可即兴发明

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill character-forge
```

postflight：`validate --task characters`

## 联动

- 读 [`skills/guides/ability-defect-matrix.md`](../../guides/ability-defect-matrix.md)
- 读 [`skills/guides/character-persona-chain.md`](../../guides/character-persona-chain.md)
- 父母/社会关系由 `@cast-network-weaver` 扩展，本步只写 **灵魂卡**（core/major 主角与关键对手）
- handoff 注明 T1–Tn 是否已分配配角
