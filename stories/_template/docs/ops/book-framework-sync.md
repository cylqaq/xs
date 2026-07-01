# 单书与根框架同步（Book ↔ Framework Sync）

> **原则**：根框架只迭代框架能力；**具体书籍的进度与产物不在 `framework-status.md` 追踪**。  
> 框架升级后，由作者在目标书目录执行同步，补齐缺失脚手架，再跑对应 Skill 填满 Canon。

## 何时需要同步

- 复制 `_template` 开新书 → 自动含最新脚手架
- **旧书**在框架大版本升级后（如新 manifest 路径、新登记册、prose-style 链、**第十轮 L0 INDEX 三件套**）
- `forge context` / `validate` / `forge doctor` 提示缺少 `canon/style/prose-profile.yaml` 或 `INDEX.yaml`

## CLI

```bash
pnpm forge sync framework stories/{novel-id}    # 复制缺失脚手架（含 INDEX 模板）
pnpm forge nav rebuild stories/{novel-id}       # 第十轮 · 重建 INDEX 头部
pnpm forge doctor stories/{novel-id} --chapter N  # 验证就绪
```

行为：

1. 从 `stories/_template` **仅复制缺失**的框架脚手架文件（不覆盖已有 Canon 内容）
2. 输出 `prose style ready` 与 `story engine ready` 缺口列表
3. 退出码 `0` = 文笔 + 叙事引擎就绪；`2` = 仍须 Agent 完成

## 典型跟进（人工 + Agent）

| 缺口 | 负责 Skill |
|------|------------|
| `prose-profile status: pending` | `@prose-style-architect` |
| `story-engine` 占位/缺失 | `@conflict-architect`（旧书可跳过重建 outline，只补引擎+下一批 beats） |
| `emotional-beats` 缺失 | `@conflict-architect` |
| beats 缺 `conflict_active` | `@batch-planner` 续批时补齐 |
| 新登记册 yaml 缺失 | `@continuity-warden` / 对应 creation Skill |
| **INDEX 三件套缺失或过期** | `@continuity-warden`（章后自动维护）/ `forge nav rebuild` 强制再生 |
| `read-order.md` 过旧 | 对照 `_template/harness/read-order.md` 合并 |

## 禁止

- 不要用 `framework-status.md` 记录某书写到第几章
- 不要为单书进度改根框架 smoke 阈值
- 不要 `forge sync` 覆盖已有 `canon/` 正文与 `manuscripts/`

## 相关

- [`framework-status.md`](framework-status.md) — 仅框架能力矩阵
- [`prose-style-protocol.md`](../../skills/guides/prose-style-protocol.md)
- [`first-run-checklist.md`](first-run-checklist.md) — 用书操作清单（非框架状态）
- **字数哲学**：[`../../skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md) — 故事合理性优先于字数达标
- **根项目保护**：[`root-project-protection.md`](root-project-protection.md) — 防止书籍生产污染根项目
- **错误恢复指南**：[`error-recovery-guide.md`](error-recovery-guide.md) — 流程卡住/手稿写坏时的恢复路径
- **单书生命周期**：[`book-lifecycle.md`](book-lifecycle.md) — 从创建到归档的完整管理
- **质量门禁检查清单**：[`quality-gates-checklist.md`](quality-gates-checklist.md) — 每章/每卷/每书的质量检查
