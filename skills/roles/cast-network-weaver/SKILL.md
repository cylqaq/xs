---
name: cast-network-weaver
description: >-
  Weaves cast roster, family, and social relation graph in creation-chain step 6.
  After character-forge, before persona-voice-binder. Parents, schools, factions.
---

# Cast Network Weaver（关系网编织）

## 工作流位置

`creation-chain` 第 7 步 · 读 `@character-forge` handoff · 交 `@persona-voice-binder`

## 产出

- `canon/characters/cast-roster.yaml` — 全员名册（tier、社会身份、与主线关系）
- `canon/entities/graph.yaml` — 节点 + `relation` 边（父母、同学、同事、对立）
- `registries/appearance-log.yaml` — 初始化；`planned_first_ch` 预埋出场章

## 必读

- `canon/characters/index.yaml` 与已写 `{id}.md`
- `canon/world/overview.md`、`premise.md`
- [`skills/guides/character-persona-chain.md`](../../guides/character-persona-chain.md)

## 规则

1. **核心角色父母 / 监护人** 必须有节点与边（除非 seed 明确「无」）
2. 每个 `major` 级角色至少 1 条入边 + 1 条出边
3. `cast-roster` 的 `id` 须与 `index.yaml` 一致；新增配角须同步 `index.yaml`
4. 关系边 `label` 用中文可读（如「母子」「暗恋」「拆迁对立」）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill cast-network-weaver
```

postflight：`validate --task cast-network`
