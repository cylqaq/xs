# Phase 04 — 伏笔、钩子、情节债务

**编排**：已并入 `creation-chain` 独立步（非合并会话）：

`foreshadow-engineer`（步 7）→ `hook-manager`（步 8）→ … → `retention-analyst`（outline 末步，plot-debt）

manifest：`outline-batch` · workflow：[`creation-chain.yaml`](../../../../harness/workflows/creation-chain.yaml)

## 登记册分工

| 文件 | 谁写（隔离会话） |
|------|------------------|
| foreshadowing.yaml、chekhov-guns.yaml | foreshadow-engineer |
| hooks.yaml、open-threads.yaml | hook-manager |
| plot-debt.yaml（聚合） | retention-analyst（outline 收尾） |
| micro-payoffs.yaml、cool-points.yaml planned | 与 outline 协作 |

## 交叉引用

- beats 中 `foreshadowing: [fs-001]` 须存在于 registry
- 每步结束：`forge handoff complete --skill <name>`
