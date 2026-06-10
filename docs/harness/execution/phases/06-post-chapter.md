# Phase 06 — 章后记忆维护（必读）

**防失忆核心阶段**。无 AFTER = 不允许开下一章。

```bash
pnpm forge manifest post-chapter stories/{id} --chapter N
```

## Checklist

```
- [ ] 1. 读完整 manuscripts/chapters/ch-{N}.md
- [ ] 2. 提取 chapter-summary（YAML 模板见仓库根 `harness/templates/chapter-summary.yaml`）
- [ ] 3. 更新 canon/characters/* 状态段
- [ ] 4. 追加 canon/timeline/master.yaml 事件
- [ ] 5. 扫描 registries：本章 planted/resolved 的伏笔与钩子
- [ ] 6. 写 registries/continuity-log.yaml
- [ ] 7. 再生 state/memory/summary-rolling.md
- [ ] 8. 交接 `@retention-analyst` 更新 plot-debt / retention
- [ ] 9. `pnpm forge compact` + `pnpm forge validate`
- [ ] 10. 交接 `@rule-reviewer` → `pnpm forge review --chapter N`
- [ ] 11. 通过后 `pnpm forge phase advance stories/{id} --chapter N`（同步 phase.yaml + novel.yaml）
```

## chapter-summary 必含字段

- `chapter`, `pov`, `time_in_story`, `locations[]`
- `characters_present[]` + 状态变化一句话
- `events[]` 按发生顺序
- `foreshadowing_touched[]` / `hooks_opened[]` / `hooks_closed[]`
- `new_entities[]` 待入库清单
- `continuity_flags[]` 疑似矛盾

## summary-rolling 结构

1. 全书前提（≤200 字，来自 premise）
2. 主线进展（≤500 字）
3. 各活跃弧一句话
4. 近 3 章逐章摘要（各 ≤150 字）
5. 开放钩子/伏笔 ID 列表（仅 id + 一句话）

禁止把 rolling summary 当作唯一事实源；与 canon 冲突时 **以 canon 为准** 并修正 summary。
