# 上下文检索模式（RAG 文件化）

| 模式 | 触发 | 加载逻辑 |
|------|------|----------|
| **auto** | 默认 | `forge context` = `manifest chapter-draft` 的 BEFORE 列表（与 manifest 一致） |
| **graph_hybrid** | 多角色场景 / context-mode override | `canon/entities/graph.yaml` 中 beats 引用节点的 1-hop 邻居 + 对应 canon_ref |
| **bm25_fallback** | 图谱空或过期 | `state/memory/keyword-index.json` Top-K 片段路径 |

## 命令

```bash
pnpm forge context stories/my-novel --chapter 5
```

输出本次应读文件列表（含模式说明）。

## 维护

章后 `continuity-warden` 或 `pnpm forge context-index` 重建 keyword-index。
