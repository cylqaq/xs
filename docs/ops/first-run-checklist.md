# 用书操作清单（First Run）

人类监督下用**真实 seed**跑通一本书的第一章。  
**说明**：本书进度不在 `framework-status.md` 记录；框架能力以 `pnpm smoke:all` 为准。

## 0. 环境

```bash
pnpm smoke:all
pnpm forge workflow validate
pnpm forge doctor stories/_template --chapter 1   # 第十轮 · 预算 + INDEX 体检
```

## 1. 开书

**书目录位置**（二选一，CLI 均支持绝对路径）：

| 方式 | 路径示例 | 说明 |
|------|----------|------|
| 仓库内 | `stories/{your-id}` | smoke / 示例默认 |
| 仓库外 | `e:/个人/写书/{your-id}` | 私人创作目录；`forge next` / `handoff` 传绝对路径 |

```bash
# 仓库内
cp -r stories/_template stories/{your-id}

# 仓库外（PowerShell 示例）
Copy-Item -Recurse stories/_template "e:/个人/写书/{your-id}"

# 编辑 novel.yaml id/title；填写 seed/author-intent.md 核心幻想
```

循环直到 `phase` 离开 ideation：

```bash
pnpm forge next stories/{your-id}
# 按输出激活 Skill → 完成后 handoff complete
pnpm forge intake questions stories/{your-id}   # ideation
pnpm forge intake check stories/{your-id}
```

**creation-chain 顺序**：orchestrator → seed-intake → bootstrap → **prose-style** → world → character（3 步）→ plot → **conflict** → foreshadow → hook → batch → retention

旧书若缺文笔契约或 INDEX：`pnpm forge sync framework stories/{your-id}` → `@prose-style-architect` / `@conflict-architect`

## 2. 首章连载

确认 `phase: drafting`，`canon/plot/beats/ch-001.md` 存在。

```bash
# 推荐先 doctor 体检（防雪球）
pnpm forge doctor stories/{your-id} --chapter 1
pnpm forge run stories/{your-id} --workflow chapter-cycle --chapter 1
```

按 `run-plan.json` 逐步：

| 步 | Skill | 关键产物 |
|----|-------|----------|
| 0 | **navigator** | `state/working/context-plan-ch-001.yaml`（**第十轮新增** · 防雪球） |
| 1 | context-router | context 快照 |
| 2 | chapter-production | `manuscripts/chapters/ch-001.md` |
| 3 | dialogue-craftsman | 仅 beats 含对话时 |
| 4 | continuity-warden | summary + registries + **更新三份 INDEX** |
| 5 | persona-evolution-warden | persona-shifts active |
| 6 | retention-analyst | `state/retention/ch-001.yaml` + `INDEX.plot_debt` |
| 7 | rule-reviewer | `state/reviews/ch-001.json` PASS |
| 8 | novel-orchestrator | `phase advance --chapter 1` |

每步：`forge next` → 工作 → `forge handoff complete --skill … --chapter 1`

## 3. 验收

- [ ] `state/reviews/ch-001.json` → `"pass": true`
- [ ] `state/working/handoffs/` 本章各 Skill 均为 `complete`
- [ ] `phase.yaml` → `last_completed_chapter: 1`
- [ ] 登记册与 `continuity-log` 已更新
- [ ] `state/memory/INDEX.yaml` 的 `circuit_state: green`（`forge doctor` 验证）

## 4. 失败路径

review FAIL → `forge next` 路由 `patch-cycle` → 按 `delegate_skill` 修补 → 再 `rule-reviewer` handoff（≤3 轮）

doctor 报 `circuit_state: red` → `forge nav rebuild` 或 `forge sync framework` 补 INDEX

## 5. 正式测试后发现框架问题

1. 先记清改了哪一层（INDEX / Skill / workflow / manifest / 文档 / 脚本）
2. 按 [`layer-sync-contract.md`](../harness/layer-sync-contract.md) 迭代检查表同步其余层
3. `pnpm forge workflow validate` + `pnpm forge doctor stories/_template --chapter 1` + `pnpm smoke:all`
4. 更新 [`roadmap.md`](roadmap.md)

## 参考

- 五层联动（含 L0 INDEX）：[`layer-sync-contract.md`](../harness/layer-sync-contract.md)
- 状态机：[`pipeline-state-machine.md`](../architecture/pipeline-state-machine.md)
- **防雪球**：[`context-budget-system.md`](../architecture/context-budget-system.md)
- 框架现状：[`framework-status.md`](framework-status.md)
- **字数哲学**：[`../../skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md) — 故事合理性优先于字数达标
- **根项目保护**：[`root-project-protection.md`](root-project-protection.md) — 防止书籍生产污染根项目
- **错误恢复指南**：[`error-recovery-guide.md`](error-recovery-guide.md) — 流程卡住/手稿写坏时的恢复路径
- **单书生命周期**：[`book-lifecycle.md`](book-lifecycle.md) — 从创建到归档的完整管理
- **质量门禁检查清单**：[`quality-gates-checklist.md`](quality-gates-checklist.md) — 每章/每卷/每书的质量检查
