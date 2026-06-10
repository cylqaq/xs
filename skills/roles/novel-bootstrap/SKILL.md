---
name: novel-bootstrap
description: >-
  Bootstraps novel from seed in creation-chain step 3. Requires intake check
  PASS via handoff gate. Elevates premise to canon.
---

# Novel Bootstrap

## 工作流位置

`creation-chain` 第 3 步 · 读 `@seed-intake` handoff · `gate: intake_ready` · 交 `@world-architect`

## 流程

1. 读 `seed/` 全部层
2. 填写 `novel.yaml`
3. `canon/background/premise.md`
4. `state/phase.yaml` → `worldbuilding`
5. `state/checkpoints/bootstrap.yaml`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill novel-bootstrap
```

postflight：`validate --task bootstrap`
