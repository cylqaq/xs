---
name: persona-evolution-warden
description: >-
  Activates and logs personality shifts after each chapter. chapter-cycle step
  between continuity-warden and retention-analyst. Keeps voice consistent with
  evolution state.
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

## 流程

1. 读 `manuscripts/chapters/ch-{NNN}.md` + `chapter-summaries`
2. 对照 `persona-shifts` 中 `trigger_chapter == N` 的项
3. **若无触发项**：`forge next` / `handoff complete` 可 **auto-skip**（workflow `skip_when: no_persona_shift_triggers`）
4. 若手稿已体现转变 → 标 `active`，写 `active_from_ch: N`
5. 若 beats 要求转变但手稿未体现 → handoff 标 `blocked` 或退回 production
6. 更新 `cast-roster` 中角色的 `persona_state` 字段（可选摘要）

## 规则

- **禁止** 在手稿中性格突变而无 `persona-shifts` 记录
- 转变后章，`dialogue-craftsman` / `rule-reviewer` 以 `voice_delta` 为准
- 不修改 `canon/characters/{id}.md` 基线人格（基线只由 character-forge 改）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill persona-evolution-warden --chapter N
```

## 联动

- [`skills/guides/character-persona-chain.md`](../../guides/character-persona-chain.md)
