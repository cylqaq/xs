# 路线图（框架待办）

**更新**：2026-06-11（第八轮 · prose-style 链）

> 本文只列**根框架**能力待办，不追踪任何具体书籍的写作进度。用书操作见 [`first-run-checklist.md`](first-run-checklist.md)、[`book-framework-sync.md`](book-framework-sync.md)。

## 进行中

| # | 任务 | 完成标志 |
|---|------|----------|
| — | （当前无阻塞性框架项） | — |

## 待办

| # | 任务 |
|---|------|
| 1 | 卷级 `revision-volume` smoke 扩展（与 prose-profile 联动） |
| 2 | publish 导出 `publish/exports/` |
| 3 | `forge diff-canon`、`forge graph` |
| 4 | `sentence_variance` review 维（可选，借鉴 Word Compiler） |
| 5 | Cursor/SDK 多 Agent 自动会话（可选） |

## 已完成（第八轮）

- `prose-style-architect` + creation-chain 第 4 步
- `harness/style-profiles/` 类型母版 + AI 套话表
- `forge sync framework` · `validate --task prose-style`
- review 维 `ai_crutch_words`
- `book-framework-sync.md` · `framework-status` 与单书进度解耦

## 已完成（第四～七轮）

- outline 五步独立 workflow + handoff 硬化
- 叙事火花链 · state logs · session-relay
- 六→七路 smoke + `forge workflow validate`

## 迭代纪律

改 Skill / workflow / manifest / 执行文档 / 状态机任一 → [`layer-sync-contract.md`](../harness/layer-sync-contract.md) + `pnpm forge workflow validate` + `pnpm smoke:all`

## 新会话入口

1. [`framework-status.md`](framework-status.md)
2. [`layer-sync-contract.md`](../harness/layer-sync-contract.md)
3. `pnpm smoke:all`
