# 新会话接入指南（New Session Onboarding）

> **读者**：人类作者 + 任意新 LLM 会话。  
> **真相源**：单书目录内 `state/working/session-relay.md`（非对话记忆）。

## 开新会话前（当前会话必做）

由 **novel-orchestrator** 或当前 Agent 在结束前执行：

```bash
cd e:\my-project\novel-forge
pnpm forge relay refresh "e:\个人\写书\{novel-id}"
pnpm forge handoff status "e:\个人\写书\{novel-id}"
pnpm forge doctor "e:\个人\写书\{novel-id}" --chapter N    # 第十轮 · 体检 INDEX 与预算
```

确认：

- [ ] `session-relay.md` 时间戳为刚刚
- [ ] `session-collect.yaml` 已更新（有待答写清；已答写 `resolved: true`）
- [ ] 无未 handoff 的半成品章（drafting 时）
- [ ] `phase.yaml` 与磁盘一致
- [ ] `doctor` 报 `circuit_state: green`（yellow 也可；red 必须 `forge nav rebuild`）

**然后才可放心开新会话。**

## 新会话第一条消息（复制模板）

```
我在用 Novel Forge 写《{书名}》。
书目录：e:\个人\写书\{novel-id}
请先读（按顺序）：
1. state/working/session-relay.md
2. harness/read-order.md
3. AGENTS.md
再运行：
  pnpm forge doctor "e:\个人\写书\{novel-id}" --chapter N
  pnpm forge next "e:\个人\写书\{novel-id}"
只扮演 forge next 输出的一个 Skill，遵守 session-production-limits（单会话≤2章正文；integrity 门禁见 production-integrity-gates.md；防雪球见 context-budget-protocol.md）。
```

## 框架负责接力的组件

| 组件 | 类型 | 作用 |
|------|------|------|
| `session-relay.md` | 单书文件 | 快照 + 约束 + 下一步 + 摘要 |
| `session-collect.yaml` | 单书文件 | 待作者/剧情确认项 |
| **INDEX 三件套（第十轮）** | 单书文件 | L0 导航：所有 Skill 永读 ≤ 6 KB |
| `forge relay refresh` | CLI | 再生 relay |
| `forge doctor` | CLI | 体检预算 + 鲜度 + 熔断 |
| `forge nav build/rebuild` | CLI | navigator 输出 / INDEX 再生 |
| `forge next` | CLI | 当前 Skill |
| `handoff complete` | CLI | 步间门禁 |
| 本指南 | 框架文档 | 人类流程 |

## 禁止

- 新会话不读 relay 直接写正文
- 凭聊天记忆覆盖 `canon/`（须 continuity 流程）
- 单会话连写 >4 章不经 chapter-cycle

## 相关

- [`session-relay-protocol.md`](session-relay-protocol.md)
- [`handoff-protocol.md`](handoff-protocol.md)
