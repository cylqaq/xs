---
name: dialogue-craftsman
description: >-
  Crafts dialogue for Novel Forge when beats expect dialogue (workflow
  when_dialogue) or when review delegates dialogue_quality failures. Isolated
  session between chapter-production and continuity-warden.
---

# Dialogue Craftsman

## 工作流位置

| 场景 | 触发 |
|------|------|
| `chapter-cycle` | beats 含「对话」「说道」「「」→ `when_dialogue` 激活 |
| `patch-cycle` | review `delegate_skill: dialogue-craftsman` |

读 `@chapter-production` handoff · 交 `@continuity-warden`（continuity 的 `draft_ready` gate 会校验本 handoff）

## 输入

- `canon/plot/beats/ch-{NNN}.md` 对话场景
- 出场角色 `canon/characters/{id}.md` 声纹

## 法则

1. 展示而非讲述
2. 每人有声纹
3. 冲突场景可用潜台词

## 输出

润色 `manuscripts/chapters/ch-{NNN}.md` 对话段；不改角色卡（除非 continuity 流程）。

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill dialogue-craftsman --chapter N
```
