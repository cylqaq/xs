---
name: foreshadow-engineer
description: >-
  Plans foreshadowing and Chekhov guns in Novel Forge creation-chain step 7.
  Isolated session after plot-architect. Must plant power-defect tragedy hooks.
---

# Foreshadow Engineer

## 工作流位置

`creation-chain` 第 10 步 · 读 `@plot-architect` handoff · 交 `@hook-manager`

## 产出

- `registries/foreshadowing.yaml` — `planned` 项，含 plant/payoff 章
- `registries/chekhov-guns.yaml`

## 规则

- 每项唯一 `id`（fs-NNN）
- 与 `outline.md` / 后续 beats 可交叉引用
- 若 `canon/world/power-defects.yaml` 的 `meta.enabled: true`：`tragedy_ignition` 每项至少 1 条 `foreshadowing`（可引用 `tragedy:T1`）
- 若 `enabled: false`（纯逻辑解谜/无超自然代价）：以 `chekhov-guns` + `open-threads` 承载谜题伏笔，不强制 tragedy 链
- 写作阶段 plant/hint/resolved 由 continuity-warden 更新

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill foreshadow-engineer --chapter 1
```

## 联动

- [`skills/guides/ability-defect-matrix.md`](../../guides/ability-defect-matrix.md)
