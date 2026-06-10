# PRD — Novel Forge

## 目标

用户只提供想象力（设定 seed），框架稳定产出高质量长篇，**连续性不低于专业编辑流程**。

## 非功能需求（硬）

| ID | 需求 |
|----|------|
| NFR-1 | 记忆持久化在 `stories/` 文件，不依赖对话 |
| NFR-2 | 每章完成后必有 chapter-summary + 可选 validate 通过 |
| NFR-3 | 伏笔/钩子 100% 可追溯到 registry id |
| NFR-4 | Harness 读序可机器列出（manifest CLI） |
| NFR-5 | 同一数据模型可接 Web（Phase 3） |

## 不在范围（Phase 1）

- 全自动无人值守写完全书
- 平台一键发布（仅预留 publish/）
