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
| 5 | wordcount | 汉字 ≥ writing-plan.minWordsPerChapter | chapter-expander |
| 6 | cool_point_density | beats `cool_points[]` → registry `delivered_chapter`；无登记时关键词兜底 | patch-refiner |
| 7 | pov_consistency | frontmatter pov vs voice.md（同行） | patch-refiner |
| 8 | forbidden_terms | voice.md 禁忌词 | patch-refiner |
| 9 | foreshadow_debt | 超期 planned 伏笔 | chapter-production |
| 10 | micro_payoff | overdue micro-payoffs | patch-refiner |

## action_items 结构

```json
{
  "dimension": "wordcount",
  "delegate_skill": "chapter-expander",
  "severity": "error",
  "message": "章字数不足（2500/3000）",
  "hint": "扩写感官与对话节拍，不新增剧情"
}
```

`patch-refiner` / `chapter-expander` / `dialogue-craftsman` **只读** `action_items[]`，不读 dimensions 全文。

## 通过后

`forge phase advance stories/{id} --chapter N`（需 review PASS + 章后产物齐全）。
