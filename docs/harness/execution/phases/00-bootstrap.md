# Phase 00 — Bootstrap（创建阶段入口）

**Skill 链**：`novel-orchestrator` → **`seed-intake`**（多轮问答，≤3 问/轮）→ **`forge intake check` PASS** → `novel-bootstrap`

> **设计原则**：用户想象力入口在 `seed/author-intent.md`，但**一句话不开写**。收齐 L1–L3 前 CLI 拒绝离开 `ideation`，拒绝 `forge context` / `forge review`。不依赖 Cursor OS，靠 `seed/*.yaml` + `forge intake`。

## Intake 门禁（硬）

```bash
pnpm forge intake status stories/{id}      # 同步 intake-status.yaml + 列缺口
pnpm forge intake questions stories/{id}   # 本轮最多 3 题（题库 harness/templates/intake-questions.yaml）
pnpm forge intake check stories/{id}       # 唯一放行 novel-bootstrap 的 CLI 信号（exit 0）
```

| 动作 | intake 未 ready | intake ready |
|------|-----------------|--------------|
| `forge phase set phase worldbuilding` | **拒绝** | 允许 |
| `forge context` / `forge review` | ideation/worldbuilding **拒绝** | outlining+ 按阶段 |
| `@novel-bootstrap` | Skill 禁止 | 允许 |

## BEFORE

```bash
pnpm forge manifest bootstrap stories/{id}
```

1. 确认 `stories/{id}/` 不存在或是合法复制自 `_template`
2. 读 `seed/author-intent.md`
3. `@seed-intake` 按层写入 `seed/layer1-core.yaml` → `layer2-customize.yaml` → `layer3-title.md`（见 `skills/roles/seed-intake/SKILL.md`）
4. 跨书偏好写入 `workspace/user-preferences.json`（可复制 `workspace/user-preferences.json.example`）

## DURING

1. 复制 `_template` → `stories/{novel-id}`
2. 写 `novel.yaml`（唯一 id、体裁、target_chapters）
3. 追问 seed 缺失项（≤3 问/轮）
4. 升格 `canon/background/premise.md`
5. `state/phase.yaml` → `worldbuilding`
6. 初始化 `registries/plot-debt.yaml` 空债务表
7. `state/context-mode.yaml` → `mode: auto`

## AFTER

- 交接 `world-architect`（Phase 01）
- orchestrator 记录 `state/checkpoints/bootstrap.yaml`

## 禁止

一次性要求生成全书大纲或超过 2 章 beats（交给 batch-planner）
