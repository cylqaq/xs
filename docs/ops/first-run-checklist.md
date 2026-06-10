# 正式生成验证清单

人类监督下用**真实 seed**跑通一本书的第一章，验证第四轮编排能力。

## 0. 环境

```bash
pnpm smoke:all
pnpm forge workflow validate
```

## 1. 开书

```bash
cp -r stories/_template stories/{your-id}   # 或项目约定方式复制
# 编辑 novel.yaml id/title；填写 seed/author-intent.md 核心幻想
```

循环直到 `phase` 离开 ideation：

```bash
pnpm forge next stories/{your-id}
# 按输出激活 Skill → 完成后 handoff complete
pnpm forge intake questions stories/{your-id}   # ideation
pnpm forge intake check stories/{your-id}
```

**creation-chain 顺序**：orchestrator → seed-intake → bootstrap → world → character → plot → foreshadow → hook → batch → retention（outline）

## 2. 首章连载

确认 `phase: drafting`，`canon/plot/beats/ch-001.md` 存在。

```bash
pnpm forge run stories/{your-id} --workflow chapter-cycle --chapter 1
```

按 `run-plan.json` 逐步：

| 步 | Skill | 关键产物 |
|----|-------|----------|
| 1 | context-router | context 快照 |
| 2 | chapter-production | `manuscripts/chapters/ch-001.md` |
| 3 | dialogue-craftsman | 仅 beats 含对话时 |
| 4 | continuity-warden | summary + registries |
| 5 | retention-analyst | `state/retention/ch-001.yaml` |
| 6 | rule-reviewer | `state/reviews/ch-001.json` PASS |
| 7 | novel-orchestrator | `phase advance --chapter 1` |

每步：`forge next` → 工作 → `forge handoff complete --skill … --chapter 1`

## 3. 验收

- [ ] `state/reviews/ch-001.json` → `"pass": true`
- [ ] `state/working/handoffs/` 本章各 Skill 均为 `complete`
- [ ] `phase.yaml` → `last_completed_chapter: 1`
- [ ] 登记册与 `continuity-log` 已更新

## 4. 失败路径

review FAIL → `forge next` 路由 `patch-cycle` → 按 `delegate_skill` 修补 → 再 `rule-reviewer` handoff（≤3 轮）

## 5. 正式测试后发现框架问题

1. 先记清改了哪一层（Skill / workflow / manifest / 文档 / 脚本）
2. 按 [`layer-sync-contract.md`](../harness/layer-sync-contract.md) 迭代检查表同步其余层
3. `pnpm forge workflow validate` + `pnpm smoke:all`
4. 更新 [`roadmap.md`](roadmap.md)

## 参考

- 五层联动：[`layer-sync-contract.md`](../harness/layer-sync-contract.md)
- 状态机：[`pipeline-state-machine.md`](../architecture/pipeline-state-machine.md)
- 框架现状：[`framework-status.md`](framework-status.md)
