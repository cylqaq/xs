# 上下文检索模式（RAG 文件化）

> **第十轮升级**：navigator sub-agent 在 mode 决策**之前**先读 L0 INDEX 输出 context-plan；context-router 据此选择以下模式，**不再加载全量 manifest BEFORE**。详见 [`../../docs/architecture/context-budget-system.md`](../../docs/architecture/context-budget-system.md)。

| 模式 | 触发 | 加载逻辑 |
|------|------|----------|
| **auto** | 默认 | `forge context` = `manifest chapter-draft` 的 BEFORE 列表 + snapshot 过滤；受 `context-budget.yaml` 预算约束 |
| **graph_hybrid** | 多角色场景 / context-mode override | `canon/entities/graph.yaml` 中 beats 引用节点的 1-hop 邻居 + 对应 canon_ref |
| **bm25_fallback** | 图谱空或过期 | `state/memory/keyword-index.json` Top-K 片段路径 |

## 命令

```bash
pnpm forge context stories/my-novel --chapter 5
pnpm forge budget stories/my-novel --chapter 5     # 查看各文件占用
pnpm forge doctor stories/my-novel --chapter 5     # 总预算 + circuit_state
```

输出本次应读文件列表（含模式说明 + snapshot 过滤结果）。

## 维护

章后 `continuity-warden` 自动写 INDEX 三件套 + 可调 `pnpm forge context-index` 重建 keyword-index。

**字数哲学**：故事合理性优先于字数达标。详见 [`skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md)

**根项目保护**：防止书籍生产污染根项目。详见 [`docs/ops/root-project-protection.md`](../../docs/ops/root-project-protection.md)
