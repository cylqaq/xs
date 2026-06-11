# 生产完整性门禁（Production Integrity Gates）

> **性质**：框架硬门禁 · 零 LLM · `forge draft check` + `forge review` + `handoff complete` 三重强制  
> **根因**：2026-06 ch5 meta/凑字事件 — 流程跑完但 review 有盲区，Agent 为凑字数写登记册语言

## 反推问题链

| 环节 | 原状 | 漏洞 | 后果 |
|------|------|------|------|
| 字数 band | 3000–6000 / 硬下限 2200 | 目标过高 | Agent 在章末堆「第 N 日尽」摘要凑字 |
| review | 无 meta/padding 维 | handoff 仍 PASS | `ch5`、`hk-002` 进正文 |
| production handoff | 仅 draft check 字数 | integrity 不阻断 | 脏稿进入 continuity |
| 单会话 | ≤4 章 | 链路过长易偷工 | 跳步、合并 Skill |
| Skill 文案 | 禁止项分散 | 模型当建议 | 「登记」写进小说 |

## 硬门禁（不可跳过）

### 1. `@chapter-production` handoff 前

```bash
pnpm forge draft check stories/{id} --chapter N
```

**必须**同时满足：

- `wordcount` tier ≠ `fail`（低于 `minWordsHardFail`，默认 **1600**）
- `integrity: ok`（无 meta、无重复章末）

任一失败 → `handoff complete @chapter-production` **CLI 拒绝**。

### 2. `@rule-reviewer` handoff 前

```bash
pnpm forge review stories/{id} --chapter N
```

**必须 PASS**，含：

- `meta_prose_leakage` — 登记册 id、chN、框架术语
- `anti_padding` — 重复「第 N 日尽」、弧光摘要堆叠、章末重复句

FAIL → `patch-cycle` → `@patch-refiner`（≤3 轮）。

### 3. 单会话

- `maxChaptersPerSession` 默认 **2**（见 `writing-plan.json`）
- **禁止**同会话扮演 production + continuity + reviewer

## 字数 band（2026-06 下调）

| 项 | 新默认 | 旧默认 |
|----|--------|--------|
| 目标 band | **2000–4500** | 3000–6000 |
| 硬下限 FAIL | **1600** | 2200 |
| 未达目标 | 1600–1999 warn，仍 PASS | 2200–2999 |

**原则**：宁可短而干净，不可长而 meta。扩写只许 **beats 中段**（感官/对话/动作），禁止章末说明文。

## 正文绝对禁止（进 manuscripts）

- 登记册 id：`hk-001`、`fs-005`、`ot-002` …
- 章号 meta：`ch5`、`ch72`
- 框架术语：表世界、缺陷链、这本书、关键道具、作者埋/锁
- beats 指令：埋设 fs-、登记、弧光摘要（同桌线起、入档、首见）
- **重复章末**：≥2 处「第 N 日尽」；章末 35% 内弧光摘要语堆叠

登记、伏笔、钩子 **只写** `registries/`，**never** 正文。

## 各 Skill 分责

| Skill | integrity 职责 |
|-------|----------------|
| context-router | 不产正文 |
| chapter-production | handoff 前 draft check PASS；遵守本指南 |
| dialogue-craftsman | 不改章末凑字 |
| patch-refiner | 修 meta_prose_leakage / anti_padding action_items |
| chapter-expander | 仅字数 fail；**禁止**用 meta/摘要扩写 |
| rule-reviewer | 跑全维 review，禁止 LLM 自判 PASS |
| continuity-warden | 不改正文 meta（应拒收脏稿） |

## 相关

- [`session-production-limits.md`](session-production-limits.md)
- [`golden-rules.md`](golden-rules.md)
- [`handoff-protocol.md`](handoff-protocol.md)
- [`../../docs/ops/harness-integrity-iteration.md`](../../docs/ops/harness-integrity-iteration.md)
- `harness/review/rules/README.md`
