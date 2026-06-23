# 路线图（框架待办）

**更新**：2026-06-11（第十轮 · context-budget / 防雪球）

> 本文只列**根框架**能力待办，不追踪任何具体书籍的写作进度。

## 进行中

| # | 任务 | 完成标志 |
|---|------|----------|
| — | （当前无阻塞性框架项） | — |

## 待办

| # | 任务 |
|---|------|
| 1 | 卷级 `revision-volume` smoke 扩展（与 prose-profile 联动） |
| 2 | publish 导出 `publish/exports/` |
| 3 | `forge diff-canon`、`forge graph` |
| 4 | `sentence_variance` review 维（可选） |
| 5 | review 维 `diary_drift` 自动化（近 3 章零 conflict 升级） |
| 6 | Cursor/SDK 多 Agent 自动会话（可选） |
| 7 | navigator 智能化升级：自动按 INDEX 命中**裁剪 character/state 子集**返回压缩 ≤200 行 plan（当前为模板生成） |
| 8 | `forge doctor` 增加 stall_chapters / cost_ceiling 实际检测（当前仅 context_pressure 已硬实现） |

## 已完成（第十轮 · 上下文预算/防雪球）

- L0 INDEX 导航层：`canon/INDEX.yaml` / `registries/INDEX.yaml` / `state/memory/INDEX.yaml`
- `@navigator` Skill + `chapter-cycle` 新增 `navigate` 第 0 步
- `harness/context-budget.yaml` v2（`hard_total_cap` / `loop_safety` / `navigation_first` / `snapshot_limits`）
- `harness/scripts/context-budget-lib.mjs`（loadContextBudget / loadNavIndices / assessContextHealth / rebuildNavIndices）
- CLI 三件套：`forge doctor` / `forge budget` / `forge nav build|rebuild|lookup`
- manifest 改造：`chapter-draft.yaml` medium/low 标 `source: from_index`；`post-chapter.yaml` 让 continuity-warden 维护 INDEX
- 协议文档：`docs/architecture/context-budget-system.md` + `skills/guides/context-budget-protocol.md`
- 迭代纪要：`docs/ops/context-budget-iteration.md`
- 模板：`stories/_template/{canon,registries,state/memory}/INDEX.yaml`
- 衍生书同步：`dungeon-echo` / `zhouyuan-jie` AGENTS.md 增第十轮铁律
- **字数哲学**：`skills/guides/word-count-philosophy.md` — 故事合理性优先于字数达标
- **根项目保护**：`docs/ops/root-project-protection.md` — 防止书籍生产污染根项目
- **错误恢复指南**：`docs/ops/error-recovery-guide.md` — 流程卡住/手稿写坏时的恢复路径
- **单书生命周期**：`docs/ops/book-lifecycle.md` — 从创建到归档的完整管理
- **质量门禁检查清单**：`docs/ops/quality-gates-checklist.md` — 每章/每卷/每书的质量检查

## 已完成（第九轮 · 叙事引擎链）

- `@conflict-architect` + creation-chain 第 10 步
- `canon/plot/story-engine.yaml` + `registries/emotional-beats.yaml`
- `skills/guides/story-engine-protocol.md`
- beats 硬字段 `conflict_active` / `throughline_touch` / cool|emotional
- `validate --task outline-batch` 加强 · review `emotional_beat_delivery`
- `forge sync framework` story engine 就绪检测
- chapter-draft / post-chapter manifest JIT 路径

## 已完成（第八轮 · 生产完整性）

- prose-style-architect · 生产完整性门禁 · 单会话≤2 章

## 迭代纪律

改 Skill / workflow / manifest / 执行文档 / 状态机任一 → [`layer-sync-contract.md`](../harness/layer-sync-contract.md) + `pnpm forge workflow validate` + `pnpm forge doctor stories/_template --chapter 1` + `pnpm smoke:all`
