# 本书 Agent 入口

复制模板后：**先改 `novel.yaml` 的 id**，再删本段说明。

## 当前书

- 元数据：`novel.yaml`
- 阶段：`state/phase.yaml`
- 读序：`harness/read-order.md`

## 本书铁律

1. 写章前读 `harness/read-order.md` + 执行 `pnpm forge manifest chapter-draft stories/{本书id} --chapter N`
2. 章后必须 `@continuity-warden`，不得跳过
3. 伏笔只认 `registries/foreshadowing.yaml` 的 id
