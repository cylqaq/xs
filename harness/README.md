# 执行 Harness（可运行层）

| 路径 | 职责 |
|------|------|
| `manifests/` | 任务 → 文件读序契约（`chapter-draft`、`post-chapter`、…）· 含 `source: from_index` 防雪球标记 |
| `templates/` | chapter-summary 等 schema（仓库级，非单书目录） |
| `context-modes/` | RAG 三模式说明 |
| `context-budget.yaml` | **L0 INDEX 预算 + 熔断 + AI Loop 安全栓**（第十轮） |
| `review/config.json` | 体裁 review 阈值（可被 writing-plan 覆盖） |
| `workflows/` | 五工作流多智能体契约 |
| `review/rules/` | `forge review` 维度与实现状态 |
| `scripts/forge.mjs` | CLI 入口（manifest/validate/review/context · 第十轮新增 doctor/budget/nav） |

## 基础 CLI

```bash
pnpm forge manifest chapter-draft stories/my-novel --chapter 1
pnpm forge manifest post-chapter stories/my-novel --chapter 1
pnpm forge context stories/my-novel --chapter 1
pnpm forge validate stories/my-novel
pnpm forge review stories/my-novel --chapter 1
pnpm forge compact stories/my-novel
pnpm forge context-index stories/my-novel
```

## 第十轮 · 防雪球 CLI

```bash
pnpm forge doctor stories/my-novel --chapter N        # 体检：circuit_state + INDEX 鲜度 + 预算
pnpm forge budget stories/my-novel --chapter N        # 当前章预算条目可视化
pnpm forge nav build stories/my-novel --chapter N     # 生成 context-plan
pnpm forge nav rebuild stories/my-novel               # 重建三份 INDEX 头部
pnpm forge nav lookup stories/my-novel --id fs-003    # 单条登记项直查
```

## 多智能体

```bash
pnpm forge next|handoff|workflow validate stories/{id}
pnpm smoke:all
```

文档：[`docs/harness/execution/README.md`](../docs/harness/execution/README.md) · 联动契约：[`docs/harness/layer-sync-contract.md`](../docs/harness/layer-sync-contract.md)

**字数哲学**：故事合理性优先于字数达标。详见 [`skills/guides/word-count-philosophy.md`](../skills/guides/word-count-philosophy.md)

**根项目保护**：防止书籍生产污染根项目。详见 [`docs/ops/root-project-protection.md`](../docs/ops/root-project-protection.md)
