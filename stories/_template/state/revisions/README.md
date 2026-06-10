# 补丁三元组目录

`patch-refiner` / `chapter-expander` / `dialogue-craftsman` 产出：

```
ch-{NNN}-r{round}/
  original.md    # 原文片段
  patch.md       # 补丁
  diff.md        # 对比说明
```

review 失败时读 `state/reviews/ch-{NNN}.json` 的 `action_items[]`，不读评审全文。
