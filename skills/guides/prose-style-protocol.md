# 叙述文笔契约（Prose Style Protocol）

> **性质**：单书叙述层文笔真相源，与 `persona-voice-binder`（角色对白）分层互补。  
> **机械校验**：`prose-profile.yaml` + `forge review`（`forbidden_terms`、`ai_crutch_words`、`pov_consistency`）

## 真相源分层

| 文件 | 层级 | 谁写 | 谁读 |
|------|------|------|------|
| `canon/style/prose-profile.yaml` | 结构化契约（主） | prose-style-architect | context-router、review、patch-refiner |
| `canon/style/voice.md` | 人类可读摘要 | prose-style-architect | chapter-production、style-guardian |
| `canon/style/glossary.md` | 专有名词 | prose-style-architect / continuity | review、production |
| `canon/style/exemplars/*.md` | 正负范例 | prose-style-architect | context-router JIT |
| `harness/style-profiles/{genre}.yaml` | 类型母版（框架） | prose-style-architect 合并 | 不直接进写章 context |

## 开书链位置

`creation-chain`：**novel-bootstrap 之后、world-architect 之前**（第 4 步）

```
seed-intake → novel-bootstrap → prose-style-architect → world-architect → …
```

## prose-profile.yaml 最小字段

```yaml
version: 1
status: ready          # pending | ready
genre_profile: xuanhuan
source_seed:
  pov_tone: "..."
  prose_reference: "..."
mechanics:
  sentence_length: mixed
  paragraph_max_sentences: 6
distance: close
emotional_temperature: tense_heroic
signature_moves: []    # ≥2
anti_patterns: []      # ≥1
kill_list: []          # 本书追加
use_framework_crutch_list: true
```

## 与角色声线关系

- `prose-profile` 定**叙述腔**（句长、距离感、类型节奏）
- `voice-matrix.yaml` 定**对白指纹**（register、verbal_tics）
- `persona-voice-binder` 须对齐 `prose-profile.distance` 与 `emotional_temperature`

## 旧书补齐

框架升级后，已开书目录可能缺本文档链产物。运行：

```bash
pnpm forge sync framework stories/{id}      # 脚手架补缺 + 列 Agent 须完成的 Skill
pnpm forge validate stories/{id} --task prose-style
```

由 `@prose-style-architect` 填满 `status: ready` 后，`forge context` / 写章门禁放行。

## 相关

- [`../roles/prose-style-architect/SKILL.md`](../roles/prose-style-architect/SKILL.md)
- [`character-persona-chain.md`](character-persona-chain.md)
- [`../../docs/ops/book-framework-sync.md`](../../docs/ops/book-framework-sync.md)
