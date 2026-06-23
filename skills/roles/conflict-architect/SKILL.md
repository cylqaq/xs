---
name: conflict-architect
description: >-
  Builds story engine after macro outline in creation-chain. Writes
  story-engine.yaml, plans cool/emotional beats, maps position and character
  oppositions. Prevents diary-drift slice-of-life outlines. Hands off to
  foreshadow-engineer.
---

# Conflict Architect（叙事引擎 / 对立架构）

## 工作流位置

`creation-chain` 第 **10** 步 · 读 `@plot-architect` handoff · 交 `@foreshadow-engineer`

## 职责（本步独有）

宏观大纲有结构，但**不等于**有对立与节奏。本 Skill 负责：

1. **贯穿主线发动机** — `throughline`（赌注 + 不可逆代价 + 每章回扣规则）
2. **立场对立** — 制度/阵营/价值观（如：拆迁办程序 vs 住户守屋）
3. **人物摩擦** — 非反派对立（祖孙 vs 外界、双主角宿命未相识张力等）
4. **爽点/哭点规划** — 初始化 `cool-points.yaml` · `emotional-beats.yaml` 的 **planned** 项（覆盖第一 batch 及近 10 章密度目标）
5. **关系张力种子** — `relationship-tracking.yaml` 初始 trust/friction 条目

**不在本步写** `beats/`（属 `@batch-planner`）、**不改写** `outline.md` 正文（冲突检查点可 append 到 `outline-amendments.md`）。

## BEFORE

```bash
pnpm forge manifest outline-batch stories/{id} --chapter 1
```

必读：`outline.md`、`arcs.yaml`、`premise.md`、`cast-roster.yaml`、`graph.yaml`、`registries/relationship-tracking.yaml`（若空则建）

## 产出

| 路径 | 内容 |
|------|------|
| `canon/plot/story-engine.yaml` | throughline、position_conflicts、character_tensions、anti_diary |
| `registries/emotional-beats.yaml` | 哭点/虐点/ bittersweet · planned_chapter |
| `registries/cool-points.yaml` | 补全 planned（与 emotional 交替，避免全章零高潮） |
| `registries/relationship-tracking.yaml` | 核心对初始张力 |
| `canon/plot/outline-amendments.md` | append：冲突检查点列表（可选） |

## 质量门禁（handoff 前自检）

- [ ] `throughline.statement` ≤80 字且含赌注
- [ ] `position_conflicts` ≥2 条（表世界须含社会/制度对立）
- [ ] `character_tensions` ≥3 条（含双主角相关）
- [ ] 第一 batch 章节范围内：每章在 cool/emotional 登记册有 **至少一项** planned
- [ ] 每条 conflict/tension 挂 `linked_arc`

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill conflict-architect --chapter 1
```

见 [`story-engine-protocol.md`](../../guides/story-engine-protocol.md) · [`handoff-protocol.md`](../../guides/handoff-protocol.md)
