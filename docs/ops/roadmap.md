# 路线图

**更新**：2026-06-10（第四轮末）· 框架**可进入正式生成验证**

## 当前阶段

编排硬化与 Skill 对齐已完成。下一步：**人类监督的真实 seed 首章**（见 [`first-run-checklist.md`](first-run-checklist.md)）。

## 进行中

| # | 任务 | 完成标志 |
|---|------|----------|
| 1 | **正式生成验证** | 真实 seed → creation-chain 全 handoff → 首章 chapter-cycle PASS → phase advance |

## 待办

| # | 任务 |
|---|------|
| 2 | 卷级 revision 实机 |
| 3 | publish 导出 `publish/exports/` |
| 4 | `forge diff-canon`、`forge graph` |
| 5 | Cursor/SDK 多 Agent 自动会话（可选） |

## 已完成（第四轮）

- outline 五步独立 workflow + Skill 更新
- handoff 硬化、review 外置、`rebuild-chain`
- `skills/guides/handoff-protocol.md`
- 清理开发接力文档（`handoff-fresh-model`、`derived-designs`）
- 六路 smoke + `forge workflow validate`

## 迭代纪律

改 Skill / workflow / manifest / 执行文档 / 状态机任一 → [`layer-sync-contract.md`](../harness/layer-sync-contract.md) 检查表 + `forge workflow validate`

## 新会话入口

1. [`framework-status.md`](framework-status.md)
2. [`layer-sync-contract.md`](../harness/layer-sync-contract.md)
3. `pnpm smoke:all`
4. 正式生成 → [`first-run-checklist.md`](first-run-checklist.md)
