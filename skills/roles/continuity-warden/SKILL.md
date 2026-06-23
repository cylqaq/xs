---
name: continuity-warden
description: >-
  Post-chapter memory guardian for Novel Forge. chapter-cycle step 4 or
  patch-cycle continuity-fix. Updates canon, registries, summaries. handoff
  runs compact + validate postflight.
---

# Continuity Warden（防失忆核心）

## 工作流位置

- `chapter-cycle` · 读 `@chapter-production` handoff · `gate: draft_ready`（含可选 dialogue）
- `patch-cycle` · `when_delegate: continuity-warden`

## 流程（严格顺序）

1. `docs/harness/execution/phases/06-post-chapter.md`
2. `pnpm forge manifest post-chapter stories/{id} --chapter N`（novel 路径可在 `--chapter` 前或后）
3. 读 `manuscripts/chapters/ch-{NNN}.md`（若 `dialogue-craftsman` 已跑，须以其后手稿为准）
4. 写 `state/memory/chapter-summaries/ch-{NNN}.yaml`
5. 更新 canon delta、registries 状态机（伏笔 planted/resolved、hooks、timeline、index）
6. 写 `state/memory/summary-rolling.md`（主线进展 + 近章摘要）
7. `registries/continuity-log.yaml`
8. **`registries/appearance-log.yaml`** 追加本章出场；`index.yaml` 更新 `last_seen_chapter`
9. **`registries/character-state-log.yaml`** 提取角色伤痕/异象/能力档/装备/体质变化（见 [`state-evolution-chain.md`](../../guides/state-evolution-chain.md)）
10. **`registries/world-state-log.yaml`** 提取地点破坏/翻修/关键物件/局部规则变化
11. **`registries/narrative-sparks.yaml`** 合并 `state/working/sparks/ch-{NNN}-draft.yaml` → `status: captured`
12. 新人名 → 同步 `cast-roster.yaml`（或标 `new_pending` 交 character-forge）
13. 若 `appearance-log` 新增节点但 `graph.yaml` 缺边 → 写入 `continuity_flags` 或委派 `cast-network-weaver`
14. **【第十轮 · 防雪球】维护三份 INDEX**（≤ 6 KB · 见 [`context-budget-protocol.md`](../../guides/context-budget-protocol.md)）：
    - `canon/INDEX.yaml`：更新出场角色 `last_seen` / `state_refs`；新登场→新增；超 `archive_after_chapters` 移入 archive
    - `registries/INDEX.yaml`：刷新 `foreshadowing.open_count` / `due_within_5ch` / `hot` 等热条目
    - `state/memory/INDEX.yaml`：更新 `last_completed_chapter` / `summary_rolling_chars` / `recent_5`
    - 单文件 ≤ 2 KB；超过须收敛（裁旧条目或仅写 id 引用）
    - 章后 handoff postflight 自动 `forge nav rebuild` 同步头部时间戳

**不负责**：`cool-points.yaml` delivered（归 `@retention-analyst`）；`persona-shifts` active（归 `@persona-evolution-warden`）；`category: ability` 与 persona 交叉核对（persona-evolution 回写 csl）。

handoff postflight 自动跑 `compact --chapter N`（merge 已填 rolling 段）+ `validate --task post-chapter --chapter N`（章后 scoped，非全书 validate）。

## 冲突

canon 与手稿冲突 → `continuity_flags` + 考虑 `blocked: true`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill continuity-warden --chapter N
```
