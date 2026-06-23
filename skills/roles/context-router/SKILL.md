---
name: context-router
description: >-
  Selects RAG context mode and runs forge context before chapter-production.
  First step of chapter-cycle. Isolated session — does not draft prose.
---

# Context Router

## 工作流位置

`chapter-cycle` **第 1 步**（紧随 `@navigator` 之后） · 读 navigator 输出的 `state/working/context-plan-ch-{NNN}.yaml` · 交 `@chapter-production`

## 与 navigator 的分工（第十轮）

| Skill | 读 | 写 | 任务 |
|-------|----|----|------|
| navigator | L0 INDEX 三件套 + beats | context-plan-ch-N.yaml | 决定**读哪些** |
| context-router | context-plan + state/context-mode.yaml | 更新 last_selected | 决定**用什么模式**（auto/graph_hybrid/bm25） |

router **不再加载全 manifest BEFORE**；以 navigator 的 plan 为准，按需补 mode 特定文件。

## 流程

1. 读 `state/context-mode.yaml`
2. 读本章 beats 角色数、场景复杂度
3. 选择模式并写回 `last_selected`
4. `pnpm forge context stories/{id} --chapter N`
5. 将输出文件列表交给 production（逐项读取）

## 选择启发

| 条件 | 模式 |
|------|------|
| 默认 | auto |
| beats ≥3 核心角色同场 | graph_hybrid |
| graph 空或边断裂 | bm25_fallback + `forge context-index` |

## 人物 JIT（必含）

写章 context 须包含本章出场角色的：

- `voice-matrix.yaml` 对应条目
- `persona-shifts.yaml` 当前生效 `voice_delta`
- `cast-roster.yaml` 社会身份一句
- `appearance-log` 该章 `characters_present`（若已存在）
- `character-state-log.yaml` 本章出场角色的 `status: active` 条目
- `world-state-log.yaml` 本章 beats/locations 相关 `status: active` 条目

## 文笔 JIT（必含 · 免疫压缩）

- `canon/style/prose-profile.yaml`
- `canon/style/voice.md`
- `canon/style/exemplars/positive.md`（若已填）

## 叙事引擎 JIT（必含 · 防日记体）

- `canon/plot/story-engine.yaml` — throughline + 本章相关对立
- 本章 beats 的 `conflict_active` / `throughline_touch`
- `registries/cool-points.yaml` + `registries/emotional-beats.yaml` 中本章 planned 未 delivered 项
- `registries/relationship-tracking.yaml` 中涉及本章角色的 active 张力

见 [`story-engine-protocol.md`](../../guides/story-engine-protocol.md)、[`prose-style-protocol.md`](../../guides/prose-style-protocol.md)、[`character-persona-chain.md`](../../guides/character-persona-chain.md)、[`state-evolution-chain.md`](../../guides/state-evolution-chain.md)

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill context-router --chapter N
```

router **不生成正文**；production **不决定**读哪些文件。
