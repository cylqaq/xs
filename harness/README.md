# 执行 Harness（可运行层）

| 路径 | 职责 |
|------|------|
| `manifests/` | 任务 → 文件读序契约（`chapter-draft`、`post-chapter`） |
| `templates/` | chapter-summary 等 schema（仓库级，非单书目录） |
| `context-modes/` | RAG 三模式说明 |
| `review/config.json` | 体裁 review 阈值（可被 writing-plan 覆盖） |
| `workflows/` | 五工作流多智能体契约 |
| `review/rules/` | `forge review` 维度与实现状态 |
| `scripts/forge.mjs` | CLI 入口 |

```bash
pnpm forge manifest chapter-draft stories/my-novel --chapter 1
pnpm forge manifest post-chapter stories/my-novel --chapter 1
pnpm forge context stories/my-novel --chapter 1
pnpm forge validate stories/my-novel
pnpm forge review stories/my-novel --chapter 1
pnpm forge compact stories/my-novel
pnpm forge context-index stories/my-novel
```

```bash
pnpm forge next|handoff|workflow validate stories/{id}
pnpm smoke:all
```

文档：[`docs/harness/execution/README.md`](../docs/harness/execution/README.md) · 联动契约：[`docs/harness/layer-sync-contract.md`](../docs/harness/layer-sync-contract.md)
