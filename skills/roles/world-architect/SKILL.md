---
name: world-architect
description: >-
  Builds world canon in creation-chain step 4. Isolated session after
  novel-bootstrap. Writes canon/world and background. Supports modern-real
  overlay + power-defect matrix.
---

# World Architect

## 工作流位置

`creation-chain` 第 4 步 · 读 `@novel-bootstrap` handoff · 交 `@character-forge`

## 产出

- `canon/world/overview.md`、`rules.md`（无 TBD 硬规则）
- **`canon/world/power-defects.yaml`** — 能力缺陷类型、悲剧启动 T 编号、角色绑定（见 `@skills/guides/ability-defect-matrix.md`）
- `canon/background/era.md`（按需）
- locations / factions（按需）

## 现代真实世界叠加层

若 seed 声明表世界 = 现实地理：

- overview **先写表世界**（真实城市、学制、社会规则）
- 里世界（神话/异能）仅作**隐藏层**，不得推翻现实物理与法律
- 禁止第二地图、修炼境界，除非 seed 明确要求

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill world-architect
```

postflight：`validate --task worldbuilding` · 完成后 `phase` → outlining
