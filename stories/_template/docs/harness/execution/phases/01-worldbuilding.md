# Phase 01 — Worldbuilding

**Skill 链**：`world-architect` →（可选）`character-forge` 仅读 world

## BEFORE

```bash
pnpm forge manifest worldbuilding stories/{id}
```

- `seed/author-intent.md`
- `canon/background/premise.md`

## DURING

产出并填满（无 TBD 硬规则）：

- `canon/world/overview.md`
- `canon/world/rules.md`
- `canon/world/power-defects.yaml`（能力缺陷矩阵，见 `skills/guides/ability-defect-matrix.md`）
- `canon/background/era.md`
- 按需 `canon/world/locations/*.md`、`factions/*.md`
- 种子 `canon/entities/graph.yaml` 节点（world/location/faction）

## AFTER

- `continuity-log` 追加
- `state/phase.yaml` → `outlining`（rules 无 TBD 时）
- orchestrator 验证 DoD：见 `production-pipeline.md`

## 上下文模式

世界观阶段可用强模型档；不启用 graph_hybrid（尚无人物边）。
