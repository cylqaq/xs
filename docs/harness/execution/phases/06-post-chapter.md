# Phase 06 — 章后记忆维护（必读）

**防失忆核心阶段**。无 AFTER = 不允许开下一章。

```bash
pnpm forge manifest post-chapter stories/{id} --chapter N
```

## Checklist（按 workflow 三步）

```
- [ ] 1. 读完整 manuscripts/chapters/ch-{N}.md
- [ ] 2. @continuity-warden：chapter-summary、timeline、registries、appearance-log、**character-state-log、world-state-log**、summary-rolling
- [ ] 3. @persona-evolution-warden：激活 trigger_chapter==N 的 persona-shifts（无则 auto-skip）
- [ ] 4. @retention-analyst：cool-points delivered、retention/ch、session-collect、**narrative-sparks 分诊**、plot-debt 检测
- [ ] 5. continuity handoff postflight：`compact --chapter N` + `validate`
- [ ] 6. @rule-reviewer → `pnpm forge review --chapter N`（含 persona_voice 维）
- [ ] 7. 通过后 `pnpm forge phase advance stories/{id} --chapter N`（写 novel-orchestrator handoff；高优 session-collect 须 author_ack）
- [ ] 8. 可选审计 `validateChapterFullyClosed`（含 advance handoff）
```

## chapter-summary 必含字段

- `chapter`, `pov`, `time_in_story`, `locations[]`
- `characters_present[]` + 状态变化一句话
- `events[]` 按发生顺序
- `foreshadowing_touched[]` / `hooks_opened[]` / `hooks_closed[]`
- `new_entities[]` 待入库清单
- `continuity_flags[]` 疑似矛盾（含 graph 节点缺失）

## summary-rolling 结构

1. 全书前提（≤200 字，来自 premise）
2. 主线进展（≤500 字）
3. 各活跃弧一句话
4. 近 3 章逐章摘要（各 ≤150 字）
5. 开放钩子/伏笔 ID 列表（仅 id + 一句话）

`forge compact --chapter N` 会 **merge** 已填写的「主线进展 / 活跃故事弧 / 近章摘要」，不覆盖 continuity 人工段。

禁止把 rolling summary 当作唯一事实源；与 canon 冲突时 **以 canon 为准** 并修正 summary。

## manifest 分责（post-chapter · during_write_by_skill）

| Skill | 主要写入 |
|-------|----------|
| continuity-warden | chapter-summaries、summary-rolling、continuity-log、appearance-log、**character/world-state-log**、timeline、index、伏笔/钩子登记 |
| persona-evolution-warden | persona-shifts active、voice-matrix overlay |
| retention-analyst | retention/ch、session-collect、**narrative-sparks 分诊/晋升**、cool-points delivered、micro-payoffs、plot-debt |
