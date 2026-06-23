# 上下文预算与导航层（Context Budget System · 第十轮 · 防雪球）

> 解决根因：**项目随章节滚雪球，manifest BEFORE 全量加载 → 上下文必炸**。
> 灵感来源：Anthropic "Effective context engineering"（JIT loading）、SPD-RAG（sub-agent per document）、Loop Engineering（git-state-as-truth）、ckpt/GCC（断路器与回滚）。
> 北极星：**信息越多，单次会话**不变胖**；通过 INDEX 导航 + 预算硬墙 + AI Loop 安全栓，让框架在 N→∞ 章后仍可持续。**

## 一、问题诊断（为什么会卡）

| 现象 | 真正根因 | 旧设计 |
|------|---------|--------|
| 写到 ~30 章后 context 爆掉 | manifest BEFORE 默认全量加载 medium/low 文件 | `chapter-draft.yaml` 中 medium 12 个 + low 4 个全部进入 context |
| 角色越来越多 | `cast-roster.yaml` / `voice-matrix.yaml` 单文件无上限 | 没有「角色卡 INDEX」分级 |
| 登记册越写越大 | `foreshadowing.yaml` snapshot 只过滤 status，未限条数 | snapshot 仍可能 200+ 条 |
| 章节摘要堆积 | `summary-rolling.md` 越来越长 | 无 M0/M1/M2/M3 真正分级写入约束 |
| AI 串通失败 | 一个 Skill 自作主张读完 manifest 全部 BEFORE | 没有「navigator → consumer」的 sub-agent 解耦 |

**结论**：原 `context-budget.yaml` v1 定义了**预算**但没有**强制执行**。manifest 是「请求清单」，没有「先查目录、按需取页」的环节。

## 二、五层防雪球设计

```
┌─────────────────────────────────────────────────────────────┐
│ L0 INDEX 导航层（新增 · 总 ≤ 6 KB · 永读）                  │
│   canon/INDEX.yaml │ registries/INDEX.yaml │ memory/INDEX  │
│   只列 id / 一行摘要 / 文件路径 / 关键章号                  │
├─────────────────────────────────────────────────────────────┤
│ L1 Critical（永不裁剪 · ≤ 30 KB）                          │
│   本章 beats · summary-rolling · 上一章 summary             │
│   prose-profile · voice · story-engine                      │
├─────────────────────────────────────────────────────────────┤
│ L2 High（按 INDEX 命中拉取 · ≤ 20 KB）                     │
│   本章出场角色卡 · 本章 conflict 矩阵子集                  │
│   本章 planned 未 delivered 的 cool-points/emotional-beats │
├─────────────────────────────────────────────────────────────┤
│ L3 Medium（snapshot 过滤后 · 单文件 ≤ 8 KB · 总 ≤ 16 KB） │
│   开放伏笔/钩子 · 活跃 character-state / world-state       │
│   开放叙事火花                                              │
├─────────────────────────────────────────────────────────────┤
│ L4 Low（默认不读 · 仅 navigator 显式按需拉 · ≤ 2 KB/次）   │
│   glossary · outline-amendments · novel.yaml · phase.yaml  │
└─────────────────────────────────────────────────────────────┘
                       ▲ 硬总预算 60 KB ▲
       超过即触发熔断（Circuit Breaker）→ AI Loop 安全栓
```

## 三、INDEX 导航协议（核心创新）

每本书自动维护**三份导航文件**（合计 ≤ 6 KB），作为 LLM 的「**目录页**」：

### 1. `canon/INDEX.yaml` — 设定导航
由 `continuity-warden` 每 5 章刷一次（或 `forge nav rebuild` 强制）

```yaml
version: 2
last_synced_chapter: 25
characters:
  - id: ming-zhou
    role: protagonist
    file: canon/characters/ming-zhou.md
    one_line: 觉醒规则系异能的高中生，惧火
    last_seen: 25
    state_refs: [csl-ming-001, csl-ming-003]
  - id: bai-yu
    role: antagonist
    file: canon/characters/bai-yu.md
    one_line: ...
locations:
  - id: loc-school
    file: canon/world/locations/school.md
    last_used: 24
plot_arcs:
  - id: arc-main
    file: canon/plot/arcs.yaml#arc-main
    current_phase: midpoint
    summary: 主角追查异能本源 → 揭示家族秘密
```

### 2. `registries/INDEX.yaml` — 登记册导航
由 `continuity-warden` + `retention-analyst` 共同维护

```yaml
version: 2
last_synced_chapter: 25
foreshadowing:
  open_count: 7
  due_within_5ch: [fs-003, fs-012]
  index_summary:
    - id: fs-003
      plant_ch: 8
      due_ch: 28
      summary: 镜中倒影预示分身能力
hooks:
  open_count: 4
  hot: [hk-009]
cool_points:
  due_this_batch: [cp-014]
emotional_beats:
  due_this_batch: [eb-007]
character_state:
  active_count: 12
  hot_refs: [csl-ming-003]
world_state:
  active_count: 3
plot_debt:
  overdue: 0
  critical: 1
```

### 3. `state/memory/INDEX.yaml` — 记忆导航
由 `continuity-warden` 章后写

```yaml
version: 2
last_completed_chapter: 25
summary_rolling_chars: 1820   # 控制在 2KB 内
chapter_summaries:
  count: 25
  recent_5: [21,22,23,24,25]
  archive_at: 30
prev_summary_path: state/memory/chapter-summaries/ch-025.yaml
arc_checkpoints:
  - chapter: 20
    path: state/snapshots/ch-020-arc-midpoint.md
```

## 四、读取协议（强制顺序）

**任何 Skill 写章前必须按此顺序加载**（由 `forge context` 与 `forge doctor` 双重保证）：

```
1. L0 INDEX 三份（总 ≤ 6 KB）
2. L1 Critical 全量
3. 根据 INDEX 命中 → L2 按需（本章 beats characters[] / conflict_active[]）
4. snapshot 过滤后的 L3
5. L4 默认不读；Skill 须用 `forge nav lookup --id xxx` 显式取
6. 校验总字节 < hard_total_cap → 否则熔断告警 + 自动降级
```

## 五、AI Loop 安全栓（防 24×7 失控）

引入业界 2026 标准的三道「**断路器**」（参考 ckpt / Loop Engineering）：

```yaml
loop_safety:
  max_chapters_per_session: 2       # 单会话章上限（已有）
  stall_chapters: 3                 # 连续 3 章无新 beats 兑现 → 强制 retention 介入
  cost_ceiling_usd: 5.0             # 单章预估 token 成本上限（仅 warn）
  context_pressure_threshold: 0.85  # 实际/预算 ≥ 85% → 自动启动 sub-agent navigator 模式
  consecutive_review_fail: 3        # 已有：3 轮 review 失败 → blocked
```

实现：
- `forge doctor` 在每次 `forge next` 前评估并打印告警
- `forge context` 超阈值时**主动**返回 navigator 推荐（不全量加载，让上游 Skill 重新组装）
- `state/phase.yaml` 新增 `circuit_state: green|yellow|red`

## 六、Skill 角色调整

| 旧 | 新 | 变化 |
|----|----|------|
| context-router | context-router | 只**决策模式**，不再加载全 manifest |
| (新) navigator | navigator | **新增 sub-agent**：读 INDEX，输出本章所需文件清单（<200 行 distilled），不读正文 |
| chapter-production | chapter-production | 只接收 navigator 给出的最小集 |
| continuity-warden | continuity-warden | 章后**同时维护** INDEX 三份（不是新文件，是更新现有 INDEX） |

类比 Anthropic 模式：navigator 是 sub-agent，**返回压缩摘要**给 production；production 主上下文不再持有原始大文件。

## 七、与现有架构关系

| 现有 | 关系 |
|------|------|
| `harness/context-budget.yaml` | v1 → v2，新增 `hard_total_cap` / `loop_safety` / `navigation_first` |
| `harness/manifests/chapter-draft.yaml` | medium/low 改为 `source: from_index`，由 navigator 解析 |
| `state/working/context-snapshot-ch-NNN/` | 保留；snapshot 文件名增 `from_index_*` 前缀 |
| 五层联动契约 | **新增 L0 INDEX**；状态机增 circuit_state |
| 记忆系统 M0–M4 | 不变，但**写入受 INDEX 容量约束** |

## 八、章节增长曲线（设计目标）

| 章号 | 实际文件数 | context 加载量（设计上限） |
|------|-----------|---------------------------|
| 10   | ~50       | 35 KB |
| 50   | ~300      | **35 KB**（INDEX + 章相关，恒定） |
| 200  | ~1200     | **35 KB**（同上） |

**水平扩展**：登记册可以无限增长，单次 context 永远只看 INDEX 命中部分。

## 九、CLI 入口

```bash
forge doctor stories/{id} [--chapter N]   # 一键体检：预算 + INDEX 鲜度 + loop 状态
forge budget stories/{id} [--chapter N]   # 当前章预算可视化（哪些被裁/降级）
forge nav rebuild stories/{id}            # 重建 INDEX 三件套（任何时候）
forge nav lookup stories/{id} --id fs-003 # 单个 id 直查（不进 manifest）
```

## 十、迭代路径

见 [`../ops/context-budget-iteration.md`](../ops/context-budget-iteration.md)（第十轮迭代纪要）。

兼容性：旧书无 INDEX → `forge sync framework` 自动生成；过渡期 navigator 会回落到「全 manifest」模式并 WARN。
