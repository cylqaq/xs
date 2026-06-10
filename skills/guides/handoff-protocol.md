# 多智能体 Handoff 协议（全 Skill 必遵）

## 每轮铁律

1. **先** `pnpm forge next stories/{id} [--chapter N]` — 只激活输出里的 **一个** `@skill`
2. **只**在本会话扮演该 Skill；不读其他 Skill 的对话历史
3. **后** `pnpm forge handoff complete stories/{id} --skill <本角色名> [--chapter N] [--workflow NAME]`
4. 下一会话再 `forge next`

## handoff complete 会强制

- 上游 handoff 已 `complete`
- `requires_files` 产物存在
- `cli_postflight` 全部成功（如 `intake check`、`validate`、`review`）
- 结果写入交接单 `cli_postflight_passed`

## 章完成（drafting）

`rule-reviewer` handoff（内置 `forge review`）PASS 后：

```bash
pnpm forge phase advance stories/{id} --chapter N
```

缺任一本章 handoff → advance 拒绝。

## 工作流真相源

`harness/workflows/*.yaml` + `harness/scripts/orchestrator-lib.mjs`

校验：`pnpm forge workflow validate`

## 与 Skill / 文档联动

改 handoff 规则或 Skill 职责时，同步 workflow YAML 与 `docs/harness/layer-sync-contract.md` 检查表。
