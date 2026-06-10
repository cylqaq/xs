# Novel Forge

[![smoke](https://github.com/cylqaq/xs/actions/workflows/smoke.yml/badge.svg)](https://github.com/cylqaq/xs/actions/workflows/smoke.yml)

面向 AI Agent 与创作者的长篇小说生产框架。**记忆不依赖对话上下文**，而依赖结构化 Canon 文件系统 + 双 Harness 编排 + 校验闭环。

## 推荐形态（架构决策）

| 阶段 | 形态 | 说明 |
|------|------|------|
| **现在（Phase 1）** | Canon 文件系统 + Cursor Skills + 校验脚本 | 用户只需提供设定；Agent 按 Harness 读/写/更新目录 |
| **近期（Phase 2）** | CLI 编排器（`pnpm forge`） | 自动加载读序、跑门禁、压缩记忆，不依赖 IDE |
| **远期（Phase 3）** | Web 控制台 | **只读写同一套 `stories/` 目录**，不做第二套数据模型 |

**不推荐**先做全栈 Web：记忆与连续性应落在可版本化的文件上；Web 应是「壳」，不是「脑」。

## 快速开始

1. 复制模板：`cp -r stories/_template stories/my-novel`（Windows 用 `xcopy /E /I`）
2. 填写 `stories/my-novel/seed/author-intent.md`（你的想象力与设定）
3. 在 Cursor 中打开本仓库，对话引用 `@novel-orchestrator` 或 `@chapter-production`
4. 正式生成：见 [`docs/ops/first-run-checklist.md`](docs/ops/first-run-checklist.md)
5. 迭代时五层同步：见 [`docs/harness/layer-sync-contract.md`](docs/harness/layer-sync-contract.md)

## 核心目录

```
novel-forge/
├── AGENTS.md              # L0 入口
├── docs/                  # 文档 Harness（L1→L3）
├── skills/                # 项目级 AI 团队 Skills
├── harness/               # 执行 Harness（脚本、门禁、读序清单）
└── stories/               # 每部小说的 Canon + 手稿 + 登记册
    └── _template/         # 可复制骨架
```

## 记忆哲学（防失忆）

1. **单一事实源**：`stories/{id}/canon/` — 聊天窗口可清空，Canon 不可丢。
2. **JIT 加载**：通过 `harness/manifests/` 只读当前任务需要的切片，不整本粘贴。
3. **写后必提取**：每章完成后 `continuity-warden` 更新 Canon + `registries/` + `state/memory/`。
4. **登记册驱动**：伏笔、钩子、开放线程有 ID 与状态机，写完必勾销或延期。
5. **压缩层**：`state/memory/summary-rolling.md` 滚动摘要，替代「复述前文」。

详见 [`docs/architecture/memory-system.md`](docs/architecture/memory-system.md)。
