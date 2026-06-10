# 能力缺陷矩阵协议（Ability Defect Matrix）

> **性质**：跨 Skill 的**创作契约**，不是独立 workflow 步。  
> **链式归属**：seed（意图）→ world（规则）→ character（实例）→ foreshadow（埋设）→ hook（章末）→ plot（里程碑）

## 五层分工

| 阶段 | Skill | 产出 | 职责 |
|------|-------|------|------|
| 意图 | seed-intake | `seed/layer2` 可选字段 `ability_cost_tone`、`narrative_age_span` | 作者声明代价强度与叙事年龄段 |
| 规则 | world-architect | `canon/world/rules.md` + **`canon/world/power-defects.yaml`** | 缺陷类型、升级、灾变等级；**无 TBD** |
| 实例 | character-forge | `canon/characters/{id}.md` 能力/缺陷节 + `power-defects.yaml` 的 `character_bindings` | 外貌锚点、年龄、与缺陷绑定 |
| 埋设 | foreshadow-engineer | `registries/foreshadowing.yaml` 引用 `tragedy_ignition` 的 T 编号 | 每项缺陷至少 1 个 `planned` 伏笔 |
| 章末 | hook-manager | `registries/hooks.yaml` | 缺陷触发后的读者悬念 |
| 结构 | plot-architect | `arcs.yaml` 里程碑对齐 `planned_chapter` | 学龄段/缺陷升级节奏 |

## power-defects.yaml 最小 schema

```yaml
defect_types:
  - id: DEF-XXX
    name: 显示名
    owner: 角色 id
    rule: 硬规则一句
    escalation: 升级条件
    tragedy_hooks: [T1]

tragedy_ignition:
  - id: T1
    title: 事件名
    planned_chapter: 8
    defect: DEF-XXX
    summary: 一句话

character_bindings:
  char_id:
    ability: ...
    defects: [DEF-XXX]
    appearance_anchor: ...
```

## 联动铁律

1. **禁止** character-forge 发明与 `rules.md` 矛盾的缺陷
2. **禁止** foreshadow-engineer 埋设无 `defect_types` 来源的伏笔
3. **禁止** chapter-production 让角色免代价使用能力（除非 continuity-warden 登记例外道具）
4. 学龄叙事须遵守 `narrative_age_span`；年龄差写入 `protagonist_age_gap`

## 何时需要新 Skill？

**不需要**新增 workflow 步；现有链已覆盖。若缺陷系统复杂到独立世界观（如完整修炼体系），再考虑拆分 `power-system-engineer` 并改 `creation-chain.yaml`（须跑 layer-sync 检查表）。

## 相关

- [`../roles/world-architect/SKILL.md`](../roles/world-architect/SKILL.md)
- [`../roles/character-forge/SKILL.md`](../roles/character-forge/SKILL.md)
- [`../roles/foreshadow-engineer/SKILL.md`](../roles/foreshadow-engineer/SKILL.md)
- [`../../docs/harness/layer-sync-contract.md`](../../docs/harness/layer-sync-contract.md)
