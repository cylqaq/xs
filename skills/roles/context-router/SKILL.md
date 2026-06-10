---
name: context-router
description: >-
  Selects RAG context mode and runs forge context before chapter-production.
  First step of chapter-cycle. Isolated session — does not draft prose.
---

# Context Router

## 工作流位置

`chapter-cycle` 第 1 步 · 交 `@chapter-production`

## 流程

1. 读 `state/context-mode.yaml`
2. 读本章 beats 角色数、场景复杂度
3. 选择模式并写回 `last_selected`
4. `pnpm forge context stories/{id} --chapter N`
5. 将输出文件列表交给 production（逐项读取）

## 选择启发

| 条件 | 模式 |
|------|------|
| 默认 | auto |
| beats ≥3 核心角色同场 | graph_hybrid |
| graph 空或边断裂 | bm25_fallback + `forge context-index` |

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill context-router --chapter N
```

router **不生成正文**；production **不决定**读哪些文件。
