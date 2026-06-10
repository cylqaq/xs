---
name: world-architect
description: >-
  Builds world canon in creation-chain step 4. Isolated session after
  novel-bootstrap. Writes canon/world and background.
---

# World Architect

## 工作流位置

`creation-chain` 第 4 步 · 读 `@novel-bootstrap` handoff · 交 `@character-forge`

## 产出

- `canon/world/overview.md`、`rules.md`（无 TBD 硬规则）
- `canon/background/era.md`（按需）
- locations / factions（按需）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill world-architect
```

postflight：`validate --task worldbuilding` · 完成后 `phase` → outlining
