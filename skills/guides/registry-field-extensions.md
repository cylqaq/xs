# 登记册字段扩展（可选 · Registry Field Extensions）

> 吸纳外部 schema 建议；**均为可选字段**，不破坏现有 validator。  
> 写者：`foreshadow-engineer`、`hook-manager`、`continuity-warden`、`retention-analyst`

## 与现有文件映射（避免重复）

| DeepSeek 建议 | 框架处置 |
|---------------|----------|
| timeline.yaml | 已有 `canon/timeline/master.yaml`，不新建 |
| world-building-log | 已有 `canon/world/rules.md`；章后规则增量写 continuity-log + world-state-log |
| character-arc.yaml | 已有 `canon/plot/arcs.yaml` + `persona-shifts.yaml` |
| character-state-log | **新增** `registries/character-state-log.yaml`（伤痕/能力/装备，见 state-evolution-chain） |
| world-state-log | **新增** `registries/world-state-log.yaml`（地点破坏/修复，见 state-evolution-chain） |
| relationship-tracking | **新增** `registries/relationship-tracking.yaml`（信任度 delta，补 graph 边） |
| scene-registry | 可选；长篇启用，beats 已含场景时不必重复 |
| pacing-metrics | 归入 `state/retention/ch-NNN.yaml`，不单独文件 |
| emotional-beat | 归入 chapter-summary + retention，不单独文件 |

## 可扩展字段（在对应 registry item 上追加）

### foreshadowing.yaml

`importance`, `type`, `expected_payoff_range`, `misdirection`, `planted_scene_desc`, `hint_level`

### hooks.yaml

`priority`, `resolved_in_chapter`, `resolution_quality`, `related_threads`

### chekhov-guns.yaml

`last_mentioned_chapter`, `expected_payoff_chapter`, `importance`, `category`, `related_characters`, `payoff_scene_desc`

### micro-payoffs.yaml

`promise_text`, `character_making_promise`, `recipient`, `consequence_if_overdue`, `is_exact`

### open-threads.yaml

完整结构见 `_template/registries/open-threads.yaml`

### plot-debt.yaml items

`debt_id`, `type`, `ref_id`, `due_chapter`, `current_status`, `resolution_chapter`  
summary 可增加：`total_planted`, `total_resolved`, `critical_debt_items`, `recommended_actions`

### persona-shifts.yaml

`progression`, `reverse_possible`, `shift_verified_chapter`, `related_events`

### appearance-log.yaml

`scene_id`, `location`, `emotional_state`, `interaction_with`, `important_action`

### character-state-log.yaml

`category`, `state_key`, `permanence`, `visibility`, `callback_potential`, `linked_refs`, `superseded_by`

### world-state-log.yaml

`entity_type`, `entity_id`, `reversible`, `callback_potential`, `linked_refs`

### narrative-sparks.yaml

`narrative_potential`, `impact_tier`, `promotion_target`, `linked_registry_id`, `target_chapter`, `manuscript_anchor`, `triage_notes`

## 新增登记册（模板已含）

| 文件 | 职责 | 维护 Skill |
|------|------|------------|
| `relationship-tracking.yaml` | 信任/情感 delta | cast-network 初始化；continuity 章后 |
| `dialogue-promises.yaml` | 无截止日对话承诺 | hook-manager 埋；continuity 章后 |
| `motifs.yaml` | 母题/意象重复 | foreshadow-engineer；continuity |
| `callbacks.yaml` | 前后呼应 | foreshadow-engineer；continuity |

## 逾期聚合

`retention-analyst` 扫描 `due_chapter` / `must_resolve_by` < 当前章且 open → 写入 `plot-debt.summary.recommended_actions`
