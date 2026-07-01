---
name: persona-voice-binder
description: >-
  Binds speech patterns and personality baselines in creation-chain step 7.
  After cast-network-weaver, before plot-architect. Initializes persona-shifts.
  Enhanced with character arc stages and resonance points.
---

# Persona Voice Binder（声线绑定）

## 工作流位置

`creation-chain` 第 8 步 · 读 `@cast-network-weaver` handoff · 交 `@plot-architect`

## 产出

- `canon/characters/voice-matrix.yaml` — 每人：register、verbal_tics、forbidden_ooc、sample_lines
- `registries/persona-shifts.yaml` — `planned` 性格转变（含 `voice_delta`、`trigger_chapter`）
- `registries/character-arcs.yaml` — 角色弧追踪器（新增）
- `registries/character-resonance.yaml` — 角色共鸣点登记（新增）

## 必读

- 所有 `core` / `major` 角色 `{id}.md`
- `cast-roster.yaml`、`power-defects.yaml`（缺陷可驱动转变触发）
- **`canon/style/prose-profile.yaml`** — 对白 register 须对齐叙述 distance / emotional_temperature
- [`skills/guides/character-persona-chain.md`](../../guides/character-persona-chain.md)
- [`skills/guides/prose-style-protocol.md`](../../guides/prose-style-protocol.md)
- [`skills/guides/character-soul-card-schema.md`](../../guides/character-soul-card-schema.md)

## 规则

1. 每个 `core` 角色至少 2 条 `sample_lines`、≥3 条 `forbidden_ooc`
2. 重大性格转变须在 `persona-shifts` 预埋，禁止无登记突变
3. `voice_delta` 须可执行（如「句长变短、去掉语气词、改用敬称」）
4. 声线与年龄、学龄、`narrative_age_span` 一致

### 新增角色弧规则

5. 每个 `core` 角色必须有至少 1 个角色弧（`character-arcs.yaml`）
6. 角色弧必须与 `persona-shifts` 关联
7. 角色弧的三个阶段（unaware_self → reactive_self → integrated_self）必须有明确的章节范围
8. 关键转折点必须与故事的关键事件对齐

### 新增角色共鸣点规则

9. 每个 `core` 角色必须有至少 2 个共鸣点（`character-resonance.yaml`）
10. 共鸣点必须与角色的 The Wound 或 The Lie 相关
11. 共鸣点必须说明读者共鸣的机制（为什么读者会共情）
12. 共鸣点必须有计划兑现的章节

## 角色弧设计流程

### 1. 分析灵魂卡的 The Wound 和 The Lie

从角色灵魂卡中提取：
- `wound.event` — 核心创伤事件
- `lie.statement` — 错误信念
- `want` — 外在欲望
- `need` — 内在需求

### 2. 确定弧类型

基于 The Lie 和 The Truth 的关系：
- **positive_change**：角色克服 The Lie，拥抱 The Truth
- **negative_fall**：角色深陷 The Lie，拒绝 The Truth
- **flat**：角色保持内在稳定，用已有的 Truth 改变周围世界

### 3. 设计三个阶段

每个阶段必须有：
- 明确的描述
- 章节范围
- 关键场景
- 状态（completed/active/planned）

### 4. 设计关键转折点

每个转折点必须有：
- 类型（lie_tested/truth_glimpsed/truth_accepted/truth_rejected）
- 章节
- 事件
- 影响
- 状态

### 5. 关联 persona-shifts

将角色弧与 `persona-shifts.yaml` 中的转变关联：
- `linked_character_arc` — 关联的角色弧 ID
- `arc_stage` — 转变发生在哪个弧阶段
- `lie_challenge` — 这个转变如何挑战 The Lie

## 角色共鸣点设计流程

### 1. 识别共鸣触发条件

从角色的 The Wound、The Lie、Core Contradiction 中识别：
- 什么场景会唤起读者的个人记忆？
- 什么情感能让读者产生共情？

### 2. 设计具体场景

每个共鸣点必须有：
- 具体的场景描述
- 角色的行为表现
- 读者的情感反应

### 3. 说明共鸣机制

每个共鸣点必须说明：
- 为什么读者会共情？
- 读者的什么个人记忆会被唤起？
- 这个共鸣如何增强故事的情感深度？

### 4. 关联角色弧

将共鸣点与角色弧关联：
- 哪个弧阶段会产生这个共鸣？
- 这个共鸣如何推动角色的成长？

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill persona-voice-binder
```

postflight：`validate --task persona-voice`
