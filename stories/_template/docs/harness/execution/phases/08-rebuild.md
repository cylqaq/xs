# Phase 08 — 元数据重建

**Skill**：`canon-rebuilder`  
**workflow**：`rebuild-chain`（`state/phase.yaml` → `sub_phase: rebuild-canon`）

## 触发

orchestrator 判定元数据错乱、手稿可信时设 `sub_phase: rebuild-canon`，`forge next` 路由 rebuild-chain。

## 铁律

禁止改 `manuscripts/`。

## 流程

```bash
pnpm forge manifest rebuild-canon stories/{id} --chapter N
pnpm forge handoff complete stories/{id} --skill canon-rebuilder --workflow rebuild-chain
```

完成后 orchestrator 清除 `sub_phase`，恢复 `chapter-cycle`。
