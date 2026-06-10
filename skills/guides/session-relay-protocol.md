# 会话接力协议（Session Relay）

> **性质**：跨会话/跨模型的**单书入口文件**协议；模板在框架，实例在每本书 `state/working/`。

## 文件

| 路径 | 写者 | 读者 |
|------|------|------|
| `state/working/session-relay.md` | `forge relay refresh` / `phase advance` | **新会话第一个读** |
| `state/working/session-collect.yaml` | `@retention-analyst` 章后 | 作者 + 下一会话 orchestrator |
| `harness/read-order.md` | 本书维护 | relay 之后第二读 |

## session-relay.md 含

- 本书 phase、章号、writing-plan 约束
- `forge next` 下一步 Skill 提示
- session-collect 待确认项（≤3 问/章）
- summary-rolling 节选
- AGENTS 铁律摘要、命令速查

## session-collect.yaml schema

```yaml
chapter: 1
generated_by: retention-analyst
questions:
  - id: sc-001
    priority: high
    prompt: 向作者追问的一句
    context: 剧情依据
    suggested_canon: seed|characters|world|plot
```

## 刷新时机

1. `pnpm forge phase advance` 成功后自动
2. `pnpm forge relay refresh stories/{id}` 手动
3. creation-chain 里程碑 handoff 后建议手动 refresh

## 与 intake 区别

| | seed-intake | session-collect |
|--|-------------|-----------------|
| 阶段 | ideation | drafting+ |
| 门禁 | 离开 ideation | 不阻断 advance |
| 目的 | 开书三层 seed | 连载中补洞/确认 |

## 相关

- [`character-persona-chain.md`](character-persona-chain.md)
- [`handoff-protocol.md`](handoff-protocol.md)
