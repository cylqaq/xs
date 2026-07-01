---
name: hook-manager
description: >-
  Manages hooks and open threads in Novel Forge creation-chain step 8.
  Isolated session after foreshadow-engineer. Updates hooks.yaml and
  open-threads.yaml.
---

# Hook Manager

## 工作流位置

`creation-chain` 第 12 步 · 读 `@foreshadow-engineer` handoff · 交 `@batch-planner`

## 产出

- `registries/hooks.yaml` — 章末悬念、`must_resolve_by`（须服务 `story-engine` 对立升级，见 [`story-engine-protocol.md`](../../guides/story-engine-protocol.md)）
- `registries/open-threads.yaml` — 跨卷承诺（挂 `position_conflicts` / `character_tensions`）

## 状态机

`open` → `partially_addressed` → `closed` | `merged_into:{id}`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill hook-manager --chapter 1
```
