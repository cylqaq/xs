---
name: persona-evolution-warden
description: >-
  Activates and logs personality shifts after each chapter. chapter-cycle step
  between continuity-warden and retention-analyst. Keeps voice consistent with
  evolution state. Enhanced with character arc stage confirmation.
---

# Persona Evolution Warden（人格演化守卫）

## 工作流位置

| 场景 | 位置 |
|------|------|
| `chapter-cycle` | 第 5 步 · 读 `@continuity-warden` handoff · 交 `@retention-analyst` |
| `patch-cycle` | `when_delegate: persona-evolution-warden` |

## 产出

- 更新 `registries/persona-shifts.yaml`：`planned` → `active`（当章触发）
- 必要时回写 `voice-matrix.yaml` 的 `active_overlay`（仅追加，不删基线）
- 若转变含能力档变化 → 交叉核对/回写 `registries/character-state-log.yaml`（`category: ability`）
- **新增**：更新 `registries/character-arcs.yaml` 中的角色弧阶段状态

## 流程

1. 读 `manuscripts/chapters/ch-{NNN}.md` + `chapter-summaries`
2. 对照 `persona-shifts` 中 `trigger_chapter == N` 的项
3. **若无触发项**：`forge next` / `handoff complete` 可 **auto-skip**（workflow `skip_when: no_persona_shift_triggers`）
4. 若手稿已体现转变 → 标 `active`，写 `active_from_ch: N`
5. 若 beats 要求转变但手稿未体现 → handoff 标 `blocked` 或退回 production
6. 更新 `cast-roster` 中角色的 `persona_state` 字段（可选摘要）
7. **新增**：检查角色弧阶段是否需要转换，更新 `character-arcs.yaml`

## 角色弧阶段确认

### 阶段转换条件

1. **unaware_self → reactive_self**
   - The Lie 第一次被明确挑战
   - 角色开始意识到自己的行为模式
   - 关键场景：角色被迫面对自己的矛盾

2. **reactive_self → integrated_self**
   - 角色接受 The Truth
   - 角色的行为模式发生根本改变
   - 关键场景：角色做出与过去完全不同的选择

### 阶段确认检查清单

- [ ] 手稿中是否有角色弧阶段转换的关键场景？
- [ ] 转换是否与 `character-arcs.yaml` 中的计划一致？
- [ ] 转换是否有足够的铺垫和触发事件？
- [ ] 转换后角色的行为是否与新阶段一致？

### 阶段转换记录

在 `character-arcs.yaml` 中更新：

```yaml
stages:
  - stage: reactive_self
    status: active  # 从 planned 改为 active
    key_scene: "具体场景描述"
    actual_chapter: 10  # 实际发生的章节
    notes: "角色第一次意识到自己的行为模式"
```

## 规则

- **禁止** 在手稿中性格突变而无 `persona-shifts` 记录
- 转变后章，`dialogue-craftsman` / `rule-reviewer` 以 `voice_delta` 为准
- 不修改 `canon/characters/{id}.md` 基线人格（基线只由 character-forge 改）
- **新增**：角色弧阶段转换须有明确的触发事件，不可无理由跳变
- **新增**：阶段转换后，`voice_delta` 须与新阶段一致

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill persona-evolution-warden --chapter N
```

## 联动

- [`skills/guides/character-persona-chain.md`](../../guides/character-persona-chain.md)
- [`skills/guides/state-evolution-chain.md`](../../guides/state-evolution-chain.md)
- [`skills/guides/character-soul-card-schema.md`](../../guides/character-soul-card-schema.md)
