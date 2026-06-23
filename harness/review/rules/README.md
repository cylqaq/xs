# 规则评审（零 LLM）

`pnpm forge review stories/{id} --chapter N` 执行规则检测，输出 `state/reviews/ch-{NNN}.json`。

体裁阈值：`harness/review/config.json`（可被 `state/writing-plan.json` 的 `minWordsPerChapter` 覆盖）。

失败时自动递增 `state/phase.yaml` 的 `review_round`；超过 `max_review_rounds` 设 `blocked: true`。

## 维度

| # | ID | 说明 | delegate_skill |
|---|-----|------|----------------|
| 1 | opening_hook | 前 3 章首段动作/异常 | patch-refiner |
| 2 | character_consistency | summary 人物 ⊆ 手稿；已知角色出现 | continuity-warden |
| 3 | timeline_order | timeline 单调 + frontmatter chapter/marker | continuity-warden |
| 4 | dialogue_quality | beats 含对话时对话密度 | dialogue-craftsman |
| 4b | beats_coverage | 编号 beats 与手稿关键词覆盖 ≥70% | chapter-production |
| 5 | wordcount | tier=ok/warn/long **PASS**；tier=fail 低于 `minWordsHardFail`（默认 1600） | chapter-expander |
| 6 | cool_point_density | beats `cool_points[]` → registry `delivered_chapter`；无登记时关键词兜底 | patch-refiner |
| 6b | emotional_beat_delivery | beats `emotional_beats[]` → registry `delivered_chapter` | patch-refiner |
| 7 | pov_consistency | frontmatter pov vs voice.md（同行） | patch-refiner |
| 8 | meta_prose_leakage | 正文框架/meta 泄漏（chN、登记册 id、表世界等） | patch-refiner |
| 8b | anti_padding | 重复章末收束、弧光摘要凑字 | patch-refiner |
| 8c | forbidden_terms | voice.md 禁忌词 | patch-refiner |
| 8d | ai_crutch_words | prose-profile kill_list + 框架套话表 | patch-refiner |
| 9 | foreshadow_debt | 超期 planned 伏笔 | chapter-production |
| 10 | micro_payoff | overdue micro-payoffs | patch-refiner |

## action_items 结构

```json
{
  "dimension": "wordcount",
  "delegate_skill": "chapter-expander",
  "severity": "error",
  "message": "1500/2000 汉字（低于硬下限 1600）",
  "hint": "按 beats 整段扩写感官/对话；禁止改结尾凑字或堆 meta 摘要"
}
```

`patch-refiner` / `chapter-expander` / `dialogue-craftsman` **只读** `action_items[]`，不读 dimensions 全文。

## 通过后

`forge phase advance stories/{id} --chapter N`（需 review PASS + 章后产物齐全）。

**字数哲学**：故事合理性优先于字数达标。字数是参考指标，不是硬性目标。详见 [`skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md)
