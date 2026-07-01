---
name: seed-intake
description: >-
  Three-layer seed Q&A for Novel Forge creation-chain step 2. Runs forge intake
  until check PASS. Isolated session after novel-orchestrator handoff.
---

# Seed Intake（三层递进问答 · 硬门禁）

**铁律**：`forge intake check` PASS 前禁止 novel-bootstrap / 写 canon。

## 工作流位置

`creation-chain` 第 2 步 · 读 `@novel-orchestrator` handoff · 交 `@novel-bootstrap`

## 每轮（≤3 问）

1. `pnpm forge intake status stories/{id}`
2. `pnpm forge intake questions stories/{id}`
3. 向用户提问，写入 seed 文件
4. 重复至 `pnpm forge intake check` 退出码 0

## 产出

- `seed/layer1-core.yaml`、`layer2-customize.yaml`、`layer3-title.md`
- `seed/intake-status.yaml` → `readiness: ready`
- Layer 2 **文笔必填**：`prose_reference`、`sentence_rhythm`、`emotional_temperature`
- Layer 2 **可选**：`narrative_age_span`、`protagonist_age_gap`、`ability_cost_tone`、`hard_bans` — 见 `harness/templates/intake-questions.yaml`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill seed-intake
```

postflight 强制 `intake check`。
