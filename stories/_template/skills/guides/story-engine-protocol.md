# 叙事引擎契约（Story Engine Protocol）

> **根因**：文笔链成熟后，连载易滑向「日记体」——有感官与程序细节，缺立场对立、人物摩擦、贯穿主线发动机与爽/哭节奏。  
> **性质**：开书 `creation-chain` 硬产出 + 连载 `chapter-draft` JIT 必读。  
> **新增**：角色共鸣点与叙事引擎的关联设计。

## 三层叙事（防日记）

| 层 | 回答 | 真相源 | 谁建 |
|----|------|--------|------|
| **发动机** | 全书为何一直读下去 | `canon/plot/story-engine.yaml` · `throughline` | conflict-architect |
| **对立** | 谁与谁因何撕扯 | `position_conflicts` + `character_tensions` | conflict-architect |
| **节奏** | 何时爽、何时哭 | `cool-points.yaml` + `emotional-beats.yaml` | conflict-architect 规划；batch-planner 绑定 beats；retention 章后兑现 |
| **共鸣** | 读者何时与角色共情 | `character-resonance.yaml` | persona-voice-binder 预埋；retention-analyst 章后兑现 |

**日记风险**：连续 ≥3 章仅「日常+登记」而无 `conflict_active` 升级 → batch-planner / retention 须在 `plot-debt` 标 `diary_drift`。

## story-engine.yaml 必含

```yaml
throughline:
  statement: 一句话发动机（须含赌注+倒计时或不可逆代价）
  recurrence_rule: 每章至少一处显性回扣（动作/对话/物件，非摘要）
  anti_diary: 禁止连续章只写「开心小事/备份/程序」而无对立升级

position_conflicts:   # 立场对立（社会/制度/阵营）
  - id: pc-001
    sides: [A, B]
    stakes: 短句
    escalation: [ch范围或阶段]
    linked_arc: arc-id

character_tensions:   # 人物对立/摩擦（可非敌人）
  - id: ct-001
    pair: [char-a, char-b]
    friction: 短句
    turn_chapters: [N, M]
    linked_arc: arc-id

# 新增：角色共鸣点关联
character_resonance_links:
  - id: crl-001
    character_id: char-protagonist
    resonance_type: empathy  # empathy | admiration | pity | fear | catharsis | recognition
    linked_conflict: ct-001  # 关联的对立或摩擦
    linked_arc: arc-id
    trigger_chapter: 5
    description: "角色面对童年创伤时的反应，唤起读者共情"
```

## beats 硬字段（batch-planner）

每章 `canon/plot/beats/ch-{NNN}.md` 须含：

```markdown
- **conflict_active**: [pc-001]  # 或 ct-001，至少一项
- **throughline_touch**: 本章如何推发动机（一句，给 production 看）
- **cool_points**: [cp-xxx]       # 与 emotional_beats 至少其一非空
- **emotional_beats**: [eb-xxx]
- **character_resonance**: [cr-xxx]  # 新增：本章的共鸣点
```

## 连载 JIT（context-router）

写章 context **必含**（免疫压缩）：

- `canon/plot/story-engine.yaml`
- 本章 beats 的 `conflict_active` / `throughline_touch`
- `registries/cool-points.yaml` + `registries/emotional-beats.yaml` 中 `planned_chapter == N` 且未 delivered 项
- **新增**：`registries/character-resonance.yaml` 中 `planned_chapter == N` 且未 delivered 项

## 章后（retention-analyst）

- `cool-points` · `delivered_chapter`
- `emotional-beats` · `delivered_chapter`
- **新增**：`character-resonance` · `delivered_chapter`
- 扫描 `diary_drift`：近 3 章无 conflict 升级 → session-collect 或 plot-debt alert
- **新增**：扫描 `resonance_drift`：近 3 章无共鸣点兑现 → session-collect 或 plot-debt alert

## 共鸣点与叙事引擎的关联

### 共鸣点如何增强叙事

1. **情感深度**：共鸣点让读者与角色建立情感连接，增强故事的情感深度
2. **记忆点**：共鸣点创造核心记忆点，让读者记住角色和故事
3. **节奏控制**：共鸣点与冲突、爽点、哭点配合，创造更丰富的节奏
4. **主题表达**：共鸣点是表达主题的重要手段

### 共鸣点设计原则

1. **与 The Wound 关联**：共鸣点通常与角色的核心创伤相关
2. **Show, Don't Tell**：共鸣点必须通过具体场景展示，而非讲述
3. **读者机制**：每个共鸣点必须说明为什么读者会共情
4. **节奏平衡**：共鸣点不能过于密集，需要与冲突和爽点平衡

### 共鸣点检查清单

- [ ] 共鸣点是否与角色的 The Wound 或 The Lie 相关？
- [ ] 共鸣点是否通过具体场景展示？
- [ ] 共鸣点是否说明了读者共鸣的机制？
- [ ] 共鸣点是否与冲突、爽点、哭点平衡？
- [ ] 共鸣点是否有计划兑现的章节？

## 与现有登记册关系

| 已有 | 关系 |
|------|------|
| `arcs.yaml` | story-engine 的 escalation 须引用 arc id |
| `open-threads` | 线程须挂到 `position_conflicts` 或 `character_tensions` |
| `hooks` | 章末悬念服务对立升级，非孤立日常 |
| `relationship-tracking` | conflict-architect 写初始张力；continuity 章后 delta |
| **`character-resonance`** | **新增**：共鸣点与对立、摩擦、弧的关联 |

## 旧书补齐

```bash
pnpm forge sync framework stories/{id}
# 缺 story-engine → @conflict-architect（不必重跑全书，只补引擎+登记+下一批 beats）
```

## 联动

- [`registry-field-extensions.md`](registry-field-extensions.md)
- [`layer-sync-contract.md`](../../docs/harness/layer-sync-contract.md)
- [`character-soul-card-schema.md`](character-soul-card-schema.md)
- Skill：`conflict-architect` · `batch-planner` · `context-router` · `retention-analyst` · `persona-voice-binder`
