# Phase 02 — Characters

**Skill 链**：`character-forge` → `foreshadow-engineer`（可选预埋人物秘密）

## BEFORE

```bash
pnpm forge manifest characters stories/{id}
```

- `canon/world/rules.md`
- `canon/background/premise.md`

## DURING

1. 更新 `canon/characters/index.yaml`
2. 每主角/反派 `canon/characters/{id}.md`（外貌锚点、欲望恐惧、关系）
3. 在 `canon/entities/graph.yaml` 添加 `character` 节点与 `relation` 边

## AFTER

- 人物秘密若影响长线 → `registries/foreshadowing.yaml` 项 `planned`
- continuity-log

## graph_hybrid 预置

关系复杂书（≥5 核心人物）在 `state/context-mode.yaml` 设：

```yaml
default: auto
overrides:
  - when: multi_character_scene
    mode: graph_hybrid
```
