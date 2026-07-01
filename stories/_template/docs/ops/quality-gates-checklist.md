# 质量门禁检查清单（Quality Gates Checklist）

> **目的**：每章、每卷、每书的质量检查清单，确保无遗漏。  
> **使用方式**：按阶段逐项检查，勾选后再声称完成。

## 一、每章质量门禁

### 1.1 写作前（BEFORE）

- [ ] `forge doctor` 通过（`circuit_state: green` 或 `yellow`）
- [ ] `forge nav build` 生成 context-plan
- [ ] `forge manifest chapter-draft` 生成文件清单
- [ ] `canon/plot/beats/ch-{NNN}.md` 存在且内容完整
- [ ] `canon/style/prose-profile.yaml` 状态为 `ready`
- [ ] 已读 `state/working/session-relay.md` 了解上次状态

### 1.2 写作中（DURING）

- [ ] 遵守 `skills/guides/golden-rules.md` 三大黄金法则
- [ ] 展示而非讲述（用动作、对话、细节）
- [ ] 冲突驱动（每章至少一处冲突或转折）
- [ ] 悬念承上启下（章末留叙事悬念）
- [ ] 禁止 meta 泄漏（登记册 id、章号、框架术语）
- [ ] 禁止凑字行为（重复章末收束、无功能对话）
- [ ] 涌现灵感写入 `state/working/sparks/ch-{NNN}-draft.yaml`

### 1.3 写作后（AFTER）

- [ ] `forge draft check` 通过（`integrity: ok` 且 `wordcount tier ≠ fail`）
- [ ] 字数在合理范围内（故事合理性优先，详见 `word-count-philosophy.md`）
- [ ] 无 meta 泄漏
- [ ] 无重复章末收束
- [ ] beats 覆盖率 ≥ 70%

### 1.4 章后维护（Post-Chapter）

- [ ] `continuity-warden` 完成：
  - [ ] chapter-summary 已写
  - [ ] summary-rolling 已更新
  - [ ] registries 已更新（伏笔、钩子、爽点、哭点等）
  - [ ] INDEX 三件套已更新
  - [ ] appearance-log 已更新
  - [ ] character-state-log / world-state-log 已更新
  - [ ] narrative-sparks 已分诊
- [ ] `persona-evolution-warden` 完成（或 auto-skip）
- [ ] `retention-analyst` 完成：
  - [ ] retention/ch-{NNN}.yaml 已写
  - [ ] cool-points delivered 已标记
  - [ ] plot-debt 已检测
  - [ ] INDEX.plot_debt 已更新
- [ ] `rule-reviewer` 通过（`review PASS`）

### 1.5 章完成（Advance）

- [ ] 所有 handoff 文件存在且状态为 `complete`
- [ ] `forge phase advance` 成功
- [ ] `state/phase.yaml` 已更新 `last_completed_chapter`
- [ ] `continuity-log.yaml` 已更新

## 二、每卷质量门禁

### 2.1 卷开始

- [ ] 卷级大纲（`canon/plot/volumes/vol-{NN}.md`）存在
- [ ] 本卷主要弧线已规划
- [ ] 本卷伏笔已预埋

### 2.2 卷结束

- [ ] 本卷所有章节完成（`last_completed_chapter` 覆盖本卷范围）
- [ ] 本卷伏笔 resolved 率 ≥ 阈值（可配置）
- [ ] 本卷 cool-points / emotional-beats 已兑现
- [ ] 角色弧线在本卷有推进
- [ ] 时间线在本卷内一致

### 2.3 卷级精修（可选）

- [ ] `revision-volume` 工作流完成
- [ ] 文笔一致性检查通过
- [ ] 情节逻辑检查通过
- [ ] 登记册与手稿一致性检查通过

## 三、全书质量门禁

### 3.1 开书阶段

- [ ] `seed/author-intent.md` 核心幻想明确
- [ ] `novel.yaml` 元数据完整
- [ ] `canon/background/premise.md` 逻辑自洽
- [ ] `canon/style/prose-profile.yaml` 状态为 `ready`
- [ ] `canon/world/rules.md` 无 TBD 硬规则
- [ ] `canon/characters/` 主要角色灵魂卡完整
- [ ] `canon/plot/outline.md` 主线清晰
- [ ] `canon/plot/arcs.yaml` 弧线规划完整
- [ ] `canon/plot/story-engine.yaml` 叙事引擎就绪
- [ ] `registries/foreshadowing.yaml` 伏笔已规划
- [ ] `registries/hooks.yaml` 钩子已规划
- [ ] `registries/cool-points.yaml` 爽点已规划
- [ ] `registries/emotional-beats.yaml` 哭点已规划

### 3.2 连载阶段

- [ ] 所有章节完成（`last_completed_chapter` = `target_chapters`）
- [ ] 所有伏笔 resolved 或明确标记为下一卷
- [ ] 所有钩子已关闭或明确标记为下一卷
- [ ] 角色弧线完整（主要角色有明显成长）
- [ ] 时间线一致（无矛盾）
- [ ] 登记册与手稿一致

### 3.3 完成阶段

- [ ] 最终 review 通过
- [ ] 无 `blocked` 状态
- [ ] 无未处理的 `action_items`
- [ ] `continuity-log.yaml` 完整记录所有章节变更
- [ ] 所有 INDEX 文件状态为 `green`

## 四、特殊场景门禁

### 4.1 恢复暂停的书

- [ ] `forge sync framework` 完成（补缺最新脚手架）
- [ ] `forge nav rebuild` 完成（重建 INDEX）
- [ ] `forge doctor` 通过
- [ ] 已读 `session-relay.md` 了解上次状态

### 4.2 修复损坏的 INDEX

- [ ] 检查 `canon/characters/index.yaml` 完整性
- [ ] 检查 `registries/*.yaml` 完整性
- [ ] `forge nav rebuild` 完成
- [ ] `forge doctor` 通过

### 4.3 处理 review FAIL

- [ ] 读 `state/reviews/ch-{NNN}.json` 的 `action_items`
- [ ] 按 `delegate_skill` 指示修复
- [ ] 重新运行 `forge review`
- [ ] 确认 PASS 后继续

## 五、与现有文档的关系

- [`production-integrity-gates.md`](../../skills/guides/production-integrity-gates.md)：生产完整性门禁
- [`session-production-limits.md`](../../skills/guides/session-production-limits.md)：会话生产约束
- [`golden-rules.md`](../../skills/guides/golden-rules.md)：三大黄金法则
- [`word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md)：字数哲学
- [`error-recovery-guide.md`](error-recovery-guide.md)：错误恢复指南
- [`book-lifecycle.md`](book-lifecycle.md)：单书生命周期管理