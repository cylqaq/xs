# 单书与根框架同步（Book ↔ Framework Sync）

> **原则**：根框架只迭代框架能力；**具体书籍的进度与产物不在 `framework-status.md` 追踪**。  
> 框架升级后，由作者在目标书目录执行同步，补齐缺失脚手架，再跑对应 Skill 填满 Canon。

## 何时需要同步

- 复制 `_template` 开新书 → 自动含最新脚手架
- **旧书**在框架大版本升级后（如新 manifest 路径、新登记册、**prose-style 链**）
- `forge context` / `validate` 提示缺少 `canon/style/prose-profile.yaml` 等

## CLI

```bash
pnpm forge sync framework stories/{novel-id}
```

行为：

1. 从 `stories/_template` **仅复制缺失**的框架脚手架文件（不覆盖已有 Canon 内容）
2. 输出 `prose style ready: YES/NO` 与缺口列表
3. 退出码 `0` = 文笔契约就绪；`2` = 仍须 Agent 完成

## 典型跟进（人工 + Agent）

| 缺口 | 负责 Skill |
|------|------------|
| `prose-profile status: pending` | `@prose-style-architect` |
| 新登记册 yaml 缺失 | `@continuity-warden` / 对应 creation Skill |
| `read-order.md` 过旧 | 对照 `_template/harness/read-order.md` 合并 |

## 禁止

- 不要用 `framework-status.md` 记录某书写到第几章
- 不要为单书进度改根框架 smoke 阈值
- 不要 `forge sync` 覆盖已有 `canon/` 正文与 `manuscripts/`

## 相关

- [`framework-status.md`](framework-status.md) — 仅框架能力矩阵
- [`prose-style-protocol.md`](../../skills/guides/prose-style-protocol.md)
- [`first-run-checklist.md`](first-run-checklist.md) — 用书操作清单（非框架状态）
