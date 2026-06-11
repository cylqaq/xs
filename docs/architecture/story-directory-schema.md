# 单书目录契约（Story Directory Schema）

每部小说位于 `stories/{novel-id}/`。`novel-id`：小写、连字符，如 `starfall-saga`。

## 总览

```
stories/{novel-id}/
├── novel.yaml                 # 元数据：书名、体裁、POV、当前章
├── AGENTS.md                  # 单书路由与禁忌
├── seed/                      # 作者输入（想象力入口）
│   └── author-intent.md
├── harness/
│   └── read-order.md          # 本书当前阶段读序（覆盖全局默认）
├── canon/                     # 【事实层 M3】审慎更新
│   ├── world/
│   │   ├── overview.md        # 世界概览
│   │   ├── rules.md           # 硬规则（魔法/科技/社会）
│   │   ├── locations/         # 地点圣经
│   │   └── factions/          # 势力/组织
│   ├── background/            # 故事背景（历史、时代）
│   │   ├── era.md
│   │   └── premise.md         # 故事前提（与 seed 对齐后升格）
│   ├── characters/
│   │   ├── index.yaml         # id、file、status、last_seen_ch
│   │   ├── cast-roster.yaml   # 全员名册与社会关系摘要
│   │   ├── voice-matrix.yaml  # 声线、OOC 禁忌、示例对白
│   │   └── {char-id}.md       # 灵魂卡
│   ├── timeline/
│   │   └── master.yaml        # 事件序：id, ch, time, summary
│   ├── plot/
│   │   ├── outline.md         # 宏观结构（三幕/四部等）
│   │   ├── outline-amendments.md  # 大纲补丁日志（append-only）
│   │   ├── arcs.yaml          # 故事弧
│   │   └── beats/             # ch-{nnn}.md 章节拍表
│   └── style/
│       ├── prose-profile.yaml # 叙述文笔契约（机械校验主源）
│       ├── voice.md           # 叙述声音摘要（人类可读）
│       ├── glossary.md        # 专有名词表
│       └── exemplars/         # 正负范例（JIT context）
├── canon/entities/
│   └── graph.yaml             # 实体图（graph_hybrid）
├── registries/                # 【追踪层 M4】高频更新
│   ├── foreshadowing.yaml
│   ├── hooks.yaml
│   ├── chekhov-guns.yaml
│   ├── open-threads.yaml
│   ├── plot-debt.yaml         # 情节债务仪表
│   ├── cool-points.yaml       # 爽点
│   ├── micro-payoffs.yaml     # 微兑现
│   ├── continuity-log.yaml
│   ├── appearance-log.yaml    # 出场章记录
│   ├── persona-shifts.yaml    # 性格转变 planned/active
│   ├── character-state-log.yaml  # 角色伤痕/能力/装备/体质可变状态
│   ├── world-state-log.yaml   # 地点/世界破坏与修复状态
│   ├── narrative-sparks.yaml  # 写章涌现灵感 inbox
│   ├── relationship-tracking.yaml  # 信任/情感 delta（可选）
│   ├── dialogue-promises.yaml
│   ├── motifs.yaml
│   └── callbacks.yaml
├── state/
│   ├── phase.yaml             # 含 review_round / blocked
│   ├── context-mode.yaml      # auto | graph_hybrid | bm25_fallback
│   ├── batches/               # 分批续写 batch-*.yaml
│   ├── working/
│   │   ├── session-relay.md      # 新会话接力（forge relay refresh）
│   │   ├── session-collect.yaml  # 章后待作者确认（retention-analyst）
│   │   └── sparks/               # 章内火花草稿 ch-{NNN}-draft.yaml
│   ├── memory/
│   │   ├── summary-rolling.md
│   │   ├── chapter-summaries/
│   │   └── keyword-index.json # BM25 兜底
│   ├── retention/             # 追读力 ch-*.yaml
│   ├── reviews/               # 规则评审 ch-*.json
│   ├── revisions/             # 精修三元组
│   ├── snapshots/             # 恢复检查点
│   └── checkpoints/
├── manuscripts/
│   ├── chapters/              # ch-{nnn}.md 正文
│   └── scenes/                # 可选：场景级草稿
└── publish/
    └── exports/               # 导出物
```

## 各目录职责（环环相扣且解耦）

| 目录 | 回答的问题 | 谁写 | 谁读 |
|------|-----------|------|------|
| `seed/` | 作者想讲什么 | 人 | seed-intake / bootstrap |
| `canon/style` | 叙述文笔、套话禁令、范例 | prose-style-architect | 写章 context / review |
| `canon/world` | 世界是什么 | world-architect | 全员 JIT |
| `canon/background` | 故事发生在什么背景下 | plot-architect | 写章前 |
| `canon/characters` | 谁是谁、声线、关系 | character-forge → cast-network → persona-voice | 写章前 |
| `registries/persona-shifts` | 性格转变状态 | persona-voice / persona-evolution-warden | 写章前/后 |
| `registries/character-state-log` | 伤痕/能力/装备可变状态 | continuity-warden | 写章前/后 |
| `registries/world-state-log` | 地点/世界破坏与修复 | continuity-warden | 写章前/后 |
| `registries/narrative-sparks` | 写章涌现灵感 inbox | production → continuity → retention | 写章前/后 |
| `canon/plot/outline-amendments` | 宏观大纲补丁（append-only） | plot-architect / retention（ack 后） | 批次规划前 |
| `registries/appearance-log` | 出场记录 | cast-network / continuity-warden | 写章前/后 |
| `canon/plot` | 结构与时序 | plot-architect | 写章前 |
| `registries/foreshadowing` | 埋了什么、何时收 | foreshadow-engineer | 写章前/后 |
| `registries/hooks` | 读者被什么吊着 | hook-manager | 写章前/后 |
| `state/memory` | 前文压缩 | continuity-warden | 每章必读 |
| `manuscripts` | 读者看到的正文 | chapter-production | 人类 |

**解耦规则**：`manuscripts` 不得包含未同步到 `canon` 或 `registries` 的「秘密设定」；秘密只活在 `registries`（planned）或 `canon`（已成立）。

## novel.yaml 最小字段

```yaml
id: starfall-saga
title: 星落之歌
genre: xuanhuan
language: zh-CN
pov: third-limited
current_chapter: 0
status: ideation  # ideation|worldbuilding|outlining|drafting|revision|publish
target_chapters: 120
```

## 登记册条目示例

见 `stories/_template/registries/*.yaml`。
