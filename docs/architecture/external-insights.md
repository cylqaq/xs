# 外部理念吸收（马良写作 + chinese-novelist-skill）

> 提炼可复用概念，映射到 Novel Forge 目录与 Skill，**不绑定任何商业产品或第三方仓库实现**。

## 马良写作（maliangwriter.com/blog）

### 可采纳理念

| 理念 | 本框架落地 |
|------|------------|
| **人=总导演，AI=执行团队** | `novel-orchestrator` 不写字，用户 seed + 审阅 |
| **三级大纲**（总纲/卷纲/章蓝图） | `canon/plot/master-outline.md` + `volumes/vol-*.md` + `beats/ch-*.md` + **`outline-amendments.md`（火花补丁）** |
| **7 Agent 分工** | 已映射见下表 |
| **知识图谱防吃书** | `canon/entities/graph.yaml` + `graph_hybrid` |
| **设定管理先于正文** | phases 01–03 强制在 drafting 前完成 |
| **会话记忆与智能重试** | `state/snapshots/` + `writing-plan.json` + 中断续写 |
| **故事线可视化** | P2 `forge graph` / Web 看板 |
| **半自动驾驶** | 高潮人工、日常章 Agent 批量 |

### 7 Agent → Novel Forge 映射

| 马良 Agent | 本框架 Skill |
|------------|--------------|
| 结构 | plot-architect + batch-planner |
| 生成 | chapter-production |
| 一致性 | continuity-warden + context-router |
| 纠错 | patch-refiner + rule-reviewer |
| 设定管理 | world-architect + character-forge |
| 伏笔悬念 | foreshadow-engineer + hook-manager + **narrative-sparks 分诊** |
| 总控 | novel-orchestrator |

## chinese-novelist-skill（GitHub）

### 可采纳理念

| 理念 | 本框架落地 |
|------|------------|
| **三层递进问答** | `seed-intake` Skill + `seed/layers/` |
| **三大黄金法则** | `skills/guides/golden-rules.md` → chapter-production / patch-refiner 门禁 |
| **写作计划 JSON** | `state/writing-plan.json`（与 phase.yaml 并存） |
| **大纲表格式规划** | `canon/plot/chapter-plan.md` |
| **中断续写 Phase0** | orchestrator 读 writing-plan + last_completed |
| **字数校验 + 扩充** | `forge review` wordcount 维 + `chapter-expander` |
| **校验修复 ≤3 轮** | 已有 review_round |
| **跨书偏好** | `workspace/user-preferences.json`（默认；本书以 `canon/style/` 为准） |
| **Style Bible / kill list** | `prose-style-architect` + `harness/style-profiles/` + review `ai_crutch_words` |

### 不照搬部分

- 其项目目录 `chinese-novelist/{timestamp}/` → 我们用稳定 `stories/{novel-id}/`
- 标题仅存对话 → 我们强制 `novel.yaml` + premise
- Phase3「禁止向用户确认」→ 我们保留关键节点人工闸门（长期质量更稳）

## 新增 Skill（本项目自有）

见 `skills/roles/seed-intake`、`dialogue-craftsman`、`chapter-expander`。

**字数哲学**：故事合理性优先于字数达标。详见 [`skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md)

**根项目保护**：防止书籍生产污染根项目。详见 [`docs/ops/root-project-protection.md`](../ops/root-project-protection.md)
