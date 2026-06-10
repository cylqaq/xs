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
2. `pnpm forge manifest post-chapter stories/{id} --chapter N`
3. 读 `manuscripts/chapters/ch-{NNN}.md`
4. `state/memory/chapter-summaries/ch-{NNN}.yaml`
5. 更新 canon delta、registries 状态机
6. `state/memory/summary-rolling.md`
7. `registries/continuity-log.yaml`
8. **`registries/appearance-log.yaml`** 追加本章出场；`index.yaml` 更新 `last_seen_chapter`
9. 新人名 → 同步 `cast-roster.yaml`（或标 `new_pending` 交 character-forge）

handoff postflight 自动跑 `compact` + `validate`。

## 冲突

canon 与手稿冲突 → `continuity_flags` + 考虑 `blocked: true`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill continuity-warden --chapter N
```
