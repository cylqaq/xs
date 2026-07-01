# 单书生命周期

> 状态迁移细则见 [`docs/architecture/pipeline-state-machine.md`](../../architecture/pipeline-state-machine.md)。

## phase.yaml（权威）

```yaml
phase: drafting
sub_phase: chapter-draft
current_chapter: 3
last_completed_chapter: 2
blocked: false
block_reason: null
```

## 阶段切换条件

| 从 | 到 | 条件 |
|----|-----|------|
| ideation | worldbuilding | novel.yaml + seed 已确认 |
| worldbuilding | outlining · `sub_phase: characters` | world/rules + overview 无 TBD |
| outlining · characters | outlining · `sub_phase: outline` | character index + 实体图 |
| outlining | drafting | outline + 首章 beats |
| drafting | revision | 计划章数全部 `last_completed` |
| revision | publish | chief-editor 清单通过 |

## 每章微生命周期

见 [`README.md`](README.md) BEFORE → DURING → AFTER。

章号递增：`pnpm forge phase advance stories/{id} --chapter N`（需 review PASS + 章后产物齐全）。禁止手改双 yaml 不同步；漂移时用 `forge phase sync`。
