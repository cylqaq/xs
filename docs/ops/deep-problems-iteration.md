# 深度问题迭代（第十一轮 · 叙事质量防退化）

> **触发**：《昼隙有渊》ch29-32 出现四大叙事质量问题 — 失忆无代价、包袱停滞、代入感缺失、模式重复。
> **根因反推**：框架有 plot / foreshadow / hook / cool-points 登记能力，但无 **灵魂驱动** 和 **反重复** 强制机制；chapter-production **未检查** scene_drive 四问；retention-analyst **未检** 关系/冲突停滞。
> **子项目验证**：`e:/个人/写书/zhouyuan-jie/` 已落地全套机制文件并验证有效。

## 一、问题诊断（来自真实生产）

| 问题 | 症状 | 根因 |
|------|------|------|
| 失忆无代价 | 角色一直失忆，观众窝火 | 失忆成为逃避剧情的工具，没有代价、逻辑、进展 |
| 包袱停滞 | 拆迁线一直在"维持"，无实质进展 | 同一状态持续 3+ 章无升级、无新信息、无后果 |
| 代入感缺失 | 角色只是功能性存在 | 缺乏内在矛盾、选择、代价、成长 |
| 模式重复 | "开口→停住→说没事"重复 4 次 | 同一拉扯模式无限制重复，无升级机制 |

## 二、子项目已验证的解决方案

### 2.1 架构文件（单书级）

| 文件 | 作用 | 维护 Skill |
|------|------|-----------|
| `canon/characters/soul-depth.yaml` | 欲望-恐惧二元动力、场景四问 | persona-evolution-warden |
| `canon/world/memory-mechanics.yaml` | 失忆触发/机制/后果/对抗/重建 | conflict-architect |
| `canon/plot/escalation-mechanics.yaml` | 包袱升级周期/方式/转化 | conflict-architect |
| `canon/style/immersion-design.yaml` | 角色/情感/悬念代入 | prose-style-architect |
| `canon/plot/anti-repetition.yaml` | 模式限制/升级机制/转折点 | conflict-architect |
| `canon/plot/sequence-spine.yaml` | 序列结构模板/反重复/章节改革 | conflict-architect |

### 2.2 整合层（防雪球）

| 文件 | 整合方式 |
|------|----------|
| `story-engine.yaml` | 摘要字段（`anti_repetition` / `memory_narrative_reform` / `escalation_mechanics` / `immersion_design`）+ `_ref` 引用 |
| `prose-profile.yaml` | `anti_patterns` 扩展（反重复相关模式） |
| `reader-retention-contract.md` | 写章自检清单 |

### 2.3 验证结果

| 验证项 | 状态 | 说明 |
|--------|------|------|
| ch33 打破"开口→停住"模式 | ✅ | 江朔直接介入，沈渊被迫选择 |
| 失忆 body_cost 落地 | ✅ | 手腕鳞纹发烫、泪痣加深 |
| 灵魂四问执行 | ✅ | scene_drive 已定义并使用 |
| 包袱升级 | ✅ | escalation-mechanics 已定义 |
| 序列脊柱 | ✅ | sequence-spine 已定义并使用 |

## 三、框架集成路径（五层联动落地）

### 3.1 L1 — Skill / 指南

| Skill | 变更 | 对应机制 |
|-------|------|----------|
| `conflict-architect` | 新增 checklist：记忆机制是否定义、包袱升级周期是否设定、代入感模板是否填写 | 失忆叙事 + 包袱升级 + 代入感 |
| `chapter-production` | 写章前加载 `soul-depth` + `memory-mechanics`；新增 scene_drive 四问 | 代入感 + 失忆叙事 |
| `retention-analyst` | 章后检查：关系阶段停滞 ≥3 章、冲突等级停滞 ≥3 章、拉扯模式重复 ≥3 次 | 反重复 + 包袱升级 |
| `continuity-warden` | 章后检查：body_cost 是否落地、包袱 progress 是否兑现 | 失忆叙事 + 包袱升级 |
| `rule-reviewer` | review 维扩展（见 3.3） | 全部 |

**新增指南**：

| 指南 | 内容 | 路径 |
|------|------|------|
| `soul-depth-protocol.md` | 欲望-恐惧二元动力设计方法、场景四问、反模式清单 | `skills/guides/` |
| `narrative-escalation-protocol.md` | 包袱升级周期、反重复规则、序列脊柱使用方法 | `skills/guides/` |

### 3.2 L2 — Workflow / Manifest / CLI

| 变更 | 文件 | 说明 |
|------|------|------|
| `chapter-draft` manifest 新增 BEFORE | `harness/manifests/chapter-draft.yaml` | `soul-depth`（L2 按需）、`memory-mechanics`（L2 按需）由 navigator 决定加载 |
| `outline-batch` manifest 新增路径 | `harness/manifests/outline-batch.yaml` | `escalation-mechanics` + `anti-repetition` + `sequence-spine` 作为 outline 输入 |
| `post-chapter` manifest 新增检查 | `harness/manifests/post-chapter.yaml` | retention-analyst 须检查反重复状态、关系/冲突停滞 |
| `forge doctor` 新增告警 | `harness/scripts/` | 连续 3 章无关系/冲突升级 → yellow 告警 |

### 3.3 L3 — Review 维度 / 阈值

**新增 review 维度**：

| 维度 | 说明 | 归属 Skill |
|------|------|-----------|
| `soul_drive` | 场景是否有欲望-恐惧拉扯、选择和代价 | chapter-production / conflict-architect |
| `escalation_fresh` | 包袱是否在 3 章内有实质进展 | conflict-architect |
| `anti_repetition` | 同一拉扯模式是否超过 2 次无变化 | retention-analyst |
| `memory_cost` | 失忆场景是否有身体代价 | chapter-production |

**阈值**：

| 键 | 默认 | 说明 |
|----|------|------|
| `maxPullPatternRepeat` | 2 | 同一拉扯模式最多连续 2 次 |
| `maxRelationshipStagnation` | 3 | 同一关系阶段最多持续 3 章 |
| `maxConflictStagnation` | 3 | 同一冲突等级最多持续 3 章 |
| `maxPlotStagnation` | 3 | 同一包袱状态最多持续 3 章 |

### 3.4 L4 — 执行文档

| 文档 | 变更 |
|------|------|
| `phases/03-outline.md` | outline 阶段须定义包袱升级周期、关系阶段规划 |
| `phases/05-chapter-draft.md` | 写章前须完成 scene_drive 四问；失忆场景须确认 body_cost |
| `phases/06-post-chapter.md` | 章后须检查反重复状态、关系/冲突停滞 |

### 3.5 L5 — 架构 / 状态机

| 文件 | 变更 |
|------|------|
| `pipeline-state-machine.md` | `circuit_state: yellow` 新增触发：连续 3 章无关系/冲突/包袱升级 |
| `story-engine-protocol.md` | 新增"反重复 + 灵魂驱动"章节 |
| `framework-status.md` | 能力矩阵新增行 |

## 四、读者反馈闭环

```
读者反馈 → 诊断（conflict-architect + retention-analyst）
       ↓
架构文件（canon/ 下新增/更新机制文件）
       ↓
story-engine.yaml 摘要整合（防雪球：只存引用，不复制全文）
       ↓
prose-profile.yaml anti_patterns 更新（文笔层面固化）
       ↓
写章执行（chapter-production 加载）
       ↓
review 拦截（rule-reviewer 新维度）
       ↓
读者验证（下一波反馈）
       ↓
固化为母版框架（skills/guides/ + _template/）
```

**关键原则**：
1. 反馈不留在对话里 → 写入 `canon/analysis/` 或 `canon/style/`
2. 机制不留在单一文件里 → 整合到 `story-engine.yaml` + `prose-profile.yaml`
3. 新书不重走老路 → 固化到母版 `skills/guides/` 和 `_template/`

## 五、与现有迭代的衔接

### 5.1 第八轮（生产完整性）

| 产物 | 本次衔接 |
|------|---------|
| `production-integrity-gates.md` | 新增 `soul_drive` 和 `memory_cost` 作为 integrity 检查项 |
| `draft check` integrity | 扩展：失忆场景无 body_cost → integrity warn |
| 字数哲学 | 不变。场景四问和反重复是**质量**维度，与字数正交 |

### 5.2 第九轮（叙事引擎）

| 产物 | 本次衔接 |
|------|---------|
| `conflict-architect` | 新增 checklist：灵魂深度、包袱升级、代入感 |
| `story-engine.yaml` | 已整合摘要 + 文件引用 |
| `diary_drift_watch` | 扩展：加入反重复检查（连续 3 章同模式 → diary_drift warn） |

### 5.3 第十轮（上下文预算/防雪球）

| 产物 | 本次衔接 |
|------|---------|
| L0 INDEX | 新增机制文件通过 `story-engine.yaml` 的 `_ref` 字段间接索引，**不增加 INDEX 体积** |
| navigator | 决策是否加载 `soul-depth` / `memory-mechanics`（本章出场角色相关时加载） |
| `forge doctor` | 新增告警：关系/冲突/包袱停滞 ≥3 章 → yellow |

## 六、母版落地清单

### 6.1 需要新增的文件

| 文件 | 路径 | 内容 |
|------|------|------|
| `soul-depth-protocol.md` | `skills/guides/` | 欲望-恐惧二元动力设计方法 |
| `narrative-escalation-protocol.md` | `skills/guides/` | 包袱升级 + 反重复 + 序列脊柱使用方法 |
| `memory-narrative-framework.yaml` | `harness/templates/` | 失忆叙事机制模板 |
| `soul-depth-template.yaml` | `harness/templates/` | 人物灵魂深度模板 |

### 6.2 需要更新的文件

| 文件 | 变更 |
|------|------|
| `skills/roles/conflict-architect/SKILL.md` | 新增 checklist |
| `skills/roles/chapter-production/SKILL.md` | 新增 scene_drive 四问 |
| `skills/roles/retention-analyst/SKILL.md` | 新增反重复/停滞检查 |
| `skills/roles/continuity-warden/SKILL.md` | 新增 body_cost/progress 检查 |
| `skills/roles/rule-reviewer/SKILL.md` | 新增 review 维度 |
| `harness/manifests/chapter-draft.yaml` | 新增 BEFORE 条目 |
| `harness/manifests/outline-batch.yaml` | 新增路径 |
| `harness/manifests/post-chapter.yaml` | 新增检查 |
| `docs/ops/framework-status.md` | 能力矩阵新增行 |
| `docs/architecture/pipeline-state-machine.md` | circuit_state 触发扩展 |
| `stories/_template/` | 新书骨架新增模板文件 |

### 6.3 机械校验

```bash
pnpm forge workflow validate
pnpm smoke:all
```

## 七、索引

### 相关文件

| 文件 | 层级 | 作用 |
|------|------|------|
| `story-engine-protocol.md` | L1 | 叙事引擎协议（本次新增章节） |
| `production-integrity-gates.md` | L1 | 生产完整性门禁（本次扩展） |
| `chapter-draft.yaml` | L2 | 写章 manifest（本次扩展） |
| `outline-batch.yaml` | L2 | 大纲 manifest（本次扩展） |
| `post-chapter.yaml` | L2 | 章后 manifest（本次扩展） |
| `pipeline-state-machine.md` | L5 | 状态机（本次扩展） |
| `framework-status.md` | L5 | 框架现状（本次更新） |

### 问题-解决方案-落地索引

| 问题 | 解决方案 | 落地方式 |
|------|----------|----------|
| 失忆没有代价 | 赋予失忆代价 | integrity 门禁 + review `memory_cost` |
| 失忆没有逻辑 | 建立失忆逻辑 | `conflict-architect` checklist |
| 失忆没有进展 | 让失忆有进展 | `retention-analyst` 章后检查 |
| 包袱停滞 | 包袱必须升级 | `forge doctor` 告警 + review `escalation_fresh` |
| 没有代入感 | 设计代入感 | review `soul_drive` |
| 角色没有内在矛盾 | 赋予角色内在矛盾 | `chapter-production` scene_drive 四问 |
| 模式重复 | 反重复机制 | review `anti_repetition` + doctor 告警 |
| 关系阶段停滞 | 升级机制 | `maxRelationshipStagnation` 阈值 |
| 冲突等级停滞 | 升级机制 | `maxConflictStagnation` 阈值 |
