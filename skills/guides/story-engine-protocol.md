# 叙事引擎契约（Story Engine Protocol）

> **根因**：文笔链成熟后，连载易滑向「日记体」——有感官与程序细节，缺立场对立、人物摩擦、贯穿主线发动机与爽/哭节奏。  
> **性质**：开书 `creation-chain` 硬产出 + 连载 `chapter-draft` JIT 必读。

## 三层叙事（防日记）

| 层 | 回答 | 真相源 | 谁建 |
|----|------|--------|------|
| **发动机** | 全书为何一直读下去 | `canon/plot/story-engine.yaml` · `throughline` | conflict-architect |
| **对立** | 谁与谁因何撕扯 | `position_conflicts` + `character_tensions` | conflict-architect |
| **节奏** | 何时爽、何时哭 | `cool-points.yaml` + `emotional-beats.yaml` | conflict-architect 规划；batch-planner 绑定 beats；retention 章后兑现 |

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
```

## beats 硬字段（batch-planner）

每章 `canon/plot/beats/ch-{NNN}.md` 须含：

```markdown
- **conflict_active**: [pc-001]  # 或 ct-001，至少一项
- **throughline_touch**: 本章如何推发动机（一句，给 production 看）
- **cool_points**: [cp-xxx]       # 与 emotional_beats 至少其一非空
- **emotional_beats**: [eb-xxx]
```

## 连载 JIT（context-router）

写章 context **必含**（免疫压缩）：

- `canon/plot/story-engine.yaml`
- 本章 beats 的 `conflict_active` / `throughline_touch`
- `registries/cool-points.yaml` + `registries/emotional-beats.yaml` 中 `planned_chapter == N` 且未 delivered 项

## 章后（retention-analyst）

- `cool-points` · `delivered_chapter`
- `emotional-beats` · `delivered_chapter`
- 扫描 `diary_drift`：近 3 章无 conflict 升级 → session-collect 或 plot-debt alert

## 与现有登记册关系

| 已有 | 关系 |
|------|------|
| `arcs.yaml` | story-engine 的 escalation 须引用 arc id |
| `open-threads` | 线程须挂到 `position_conflicts` 或 `character_tensions` |
| `hooks` | 章末悬念服务对立升级，非孤立日常 |
| `relationship-tracking` | conflict-architect 写初始张力；continuity 章后 delta |

## 旧书补齐

```bash
pnpm forge sync framework stories/{id}
# 缺 story-engine → @conflict-architect（不必重跑全书，只补引擎+登记+下一批 beats）
```

## 联动

- [`registry-field-extensions.md`](registry-field-extensions.md)
- [`layer-sync-contract.md`](../../docs/harness/layer-sync-contract.md)
- Skill：`conflict-architect` · `batch-planner` · `context-router` · `retention-analyst`
