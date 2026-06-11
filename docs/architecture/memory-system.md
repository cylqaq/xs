# 记忆系统架构（防失忆 — 最高优先级）

## 问题定义

LLM 的上下文窗口是 **易失工作内存**。长篇小说失败的主因不是「文笔差」，而是：

- 角色性格/外貌/关系前后不一
- 时间线矛盾
- 伏笔遗忘或重复埋设
- 世界观规则被悄悄改写

**解法**：不把记忆放在对话里，放在 **可版本化的 Canon + 登记册 + 压缩层**，由 Harness 强制读写。

## 五层记忆模型

| 层 | 名称 | 存储 | 生命周期 | Agent 是否默认加载 |
|----|------|------|----------|-------------------|
| M0 | 易失工作区 | 对话 / `state/working/` | 单次任务 | 是（仅 working） |
| M1 | 滚动摘要 | `state/memory/summary-rolling.md` | 每章更新 | 是 |
| M2 | 章级摘要 | `state/memory/chapter-summaries/*.yaml` | 永久 | 按需（近 N 章） |
| M3 | 结构化 Canon | `canon/**` | 永久，审慎修改 | JIT（manifest） |
| M4 | 登记册 | `registries/*.yaml` | 永久，状态机 | 按任务过滤 open |

**原则**：M3 是事实源；M1/M2 是检索加速；M0 禁止成为唯一真相。

## JIT 上下文组装（非 dump）

借鉴 Agent Harness「Context is assembled, not dumped」：

1. `task` → 查 `harness/manifests/{task}.yaml`
2. 按章号过滤 registries（只拉 `target_chapters` 含本章或 `status: open`）
3. 角色：`forge context` 拉取 `appear_in: [current_ch]` 或 beats `characters[]` 引用的角色卡（`collectAppearInCharacterFiles`）
4. 登记册：`foreshadowing` / `hooks` / `open-threads` 在 context 时写入 `state/working/context-snapshot-ch-{NNN}/` 的 **open 过滤快照**，非全量 dump
5. 地点/势力：graph_hybrid 模式按 beats 引用扩展
6. 角色/世界可变状态：`character-state-log` / `world-state-log` 的 `status: active` 快照（见 `state-evolution-chain.md`）
7. 叙事火花：`narrative-sparks` 中 `captured|triaged|deferred` 快照（见 `narrative-spark-protocol.md`）
8. 总 token 预算超限时：**先压缩 M1**，再减 M2 章数，**永不裁 M3 中与 beats 冲突的条目**

## 写后提取流水线（Continuity Pipeline）

每章完成后强制执行（`@continuity-warden`）：

```
手稿 ch-N
  → 提取实体 delta（人物状态、新事实、时间戳）
  → 与 canon  diff，冲突则 flag 不写
  → 合并入 canon（人物卡、timeline、locations）
  → 更新 foreshadowing/hooks 状态
  → 写 chapter-summary YAML（结构化，供脚本读）
  → 再生 summary-rolling.md（模板见 harness/templates）
  → continuity-log 追加
  → character-state-log / world-state-log 追加（状态演化链）
  → narrative-sparks 合并章内 draft（叙事火花）
  → validate
```

## 登记册状态机

### 伏笔 `foreshadowing.yaml`

`planned` → `planted` → `hinted` → `resolved` | `abandoned`（须记录原因）

### 钩子 `hooks.yaml`

`open` → `partially_addressed` → `closed` | `merged_into:{id}`

### 开放线程 `open-threads.yaml`

叙事承诺（「主角欠谁人情」类），与钩子区别：跨弧追踪。

## 防失忆校验（门禁）

**章号权威**：`state/phase.yaml`（`forge validate` / `compact` 读取 `last_completed_chapter`）。

`pnpm forge validate` 检查（实现见 `harness/scripts/forge-lib.mjs`）：

- `phase.yaml` 与 `novel.yaml` 章号同步（漂移 → WARN，用 `forge phase sync` 修复）
- 已完成章：手稿、chapter-summary 存在；retention 缺失 → WARN
- summary `characters_present` 与手稿交叉校验；`word_count` 与手稿汉字数粗比对
- timeline 事件顺序单调；实体图边合法
- `foreshadowing` 中 `resolved` 必有 `payoff_chapter`
- beats 中 `foreshadowing`/`hooks`/`cool_points` id 须在登记册存在（registry-consistency）
- `hooks` open 过多、主角长期缺席 → warning

`pnpm forge review` 额外检查：角色一致性、时间线 frontmatter、对话密度、字数、爽点、POV、禁忌词、伏笔债务、微兑现（见 `harness/review/rules/README.md`）。

## 与 Web / CLI 的关系

- Phase 1：Cursor Agent 手动/半自动走流水线
- Phase 2：CLI 自动跑 validate + compact + manifest
- Phase 3：Web 可视化 registries，**后端仍读写同一 YAML/MD**

## 参考理念

- Harness Engineering：filesystem 持久化、写后验证、子任务隔离
- ETCLOVG 之 Context / Verification / Lifecycle 层
- 「Ralph Loop」：每章新上下文 + 从文件恢复状态
