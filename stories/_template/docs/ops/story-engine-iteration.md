# 叙事引擎迭代（第九轮 · Story Engine Chain）

> **触发**：连载文笔成熟但故事像「日记」— 缺立场对立、人物摩擦、贯穿发动机、爽/哭节奏。  
> **根因反推**：开书链有 plot / foreshadow / hook / cool-points **登记能力**，但无 **专责 Skill** 建叙事发动机；batch-planner **未强制** beats 绑定对立与情绪节拍；chapter-draft **未 JIT** story-engine。

## 迭代前能力缺口

| 已有 | 缺口 |
|------|------|
| `plot-architect` 宏观 outline | 无立场对立矩阵、无 throughline 契约 |
| `hook-manager` 悬念 | 钩子可孤立日常，不服务对立升级 |
| `cool-points.yaml` 模板 | 无规划 Skill；beats 常不引用 |
| `retention-analyst` outline 末步 | 只做 plot-debt，不检 diary_drift |
| `chapter-production` | 无 throughline_touch 硬约束 |

## 第九轮新增

| 层 | 变更 |
|----|------|
| **L1** | 新 Skill `@conflict-architect`；指南 `story-engine-protocol.md` |
| **L2** | `creation-chain` +1 步：plot-architect → **conflict-architect** → foreshadow |
| **L3** | `outline-batch` / `chapter-draft` / `post-chapter` manifest 增路径 |
| **L4** | `phases/03-outline.md`、05、06；`agent-routing` |
| **L5** | `pipeline-state-machine` 大纲链更新 |
| **脚本** | `validate --task outline-batch` 加强；review `emotional_beat_delivery`；`sync framework` 检 engine |

## 新产物

- `canon/plot/story-engine.yaml` — throughline、position_conflicts、character_tensions
- `registries/emotional-beats.yaml` — 哭点/虐点/共鸣（与 cool-points 互补）

## beats 硬字段

`conflict_active` · `throughline_touch` · `cool_points` 或 `emotional_beats`（至少其一）

## 旧书补齐

```bash
pnpm forge sync framework stories/{id}
# Story engine ready: NO → @conflict-architect
# 补 engine + emotional-beats + 下一批 beats 字段；不必重跑全书
```

## 机械校验

```bash
pnpm forge workflow validate
pnpm smoke:all
```

联动：[`layer-sync-contract.md`](../harness/layer-sync-contract.md) · [`framework-status.md`](framework-status.md) · [`../../skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md) · [`root-project-protection.md`](root-project-protection.md) · [`error-recovery-guide.md`](error-recovery-guide.md) · [`book-lifecycle.md`](book-lifecycle.md) · [`quality-gates-checklist.md`](quality-gates-checklist.md)
