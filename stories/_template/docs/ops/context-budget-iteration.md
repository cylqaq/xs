# 上下文预算迭代（第十轮 · Context Budget · 防雪球）

> **触发**：用户报告——章数/角色/登记册越写越多，单次会话上下文随项目滚雪球，迟早卡死。  
> **根因反推**：原 `chapter-draft.yaml` BEFORE 默认全量加载 medium/low 文件；snapshot 虽过滤但无条数上限；没有「**目录页**」让 LLM 先查再读。框架预算文件存在但**未强制执行**。  
> **业界对照（2026）**：  
> - Anthropic [Effective Context Engineering] — Just-in-time loading（lightweight identifiers）  
> - SPD-RAG — sub-agent per document（隔离上下文，返回压缩摘要）  
> - Loop Engineering（addyosmani） — Git-state-as-truth + 安全栓 + 工作树隔离  
> - ckpt / Git Context Controller — circuit breaker + 快照回滚  

## 一、迭代前能力缺口

| 已有 | 缺口 |
|------|------|
| `harness/context-budget.yaml` v1 定义优先级 | 未强制；manifest 仍全量请求 |
| `writeContextRegistrySnapshots` 按 status 过滤 | 无条数硬上限；snapshot 仍可能 200 条 |
| 五层联动（L1–L5） | **缺 L0「数据接力层」**；信息越大单次 context 越胖 |
| `forge validate` 章后健康 | 无「写章前预算体检」；无熔断 |
| AI Loop | 仅 review_round 一道闸；无停滞/成本/压力栓 |

## 二、第十轮新增

| 层 | 变更 |
|----|------|
| **L0**（新） | 三份 INDEX.yaml（canon/registries/state-memory），≤ 6 KB，永读 |
| **L1** | 新 Skill `@navigator`（sub-agent · 读 INDEX 输出 context-plan） |
| **L2** | `chapter-cycle` +1 步：**navigate** → route-context |
| **L3** | `chapter-draft.yaml` medium/low 改 `source: from_index`；`post-chapter.yaml` 让 continuity-warden 维护 INDEX |
| **L4** | `phases/05`、`06` 新增 navigator 章节（下一轮补） |
| **L5** | `pipeline-state-machine` 增 NAV 步；`unified-pipeline` 加 navigator + 安全栓 |
| **脚本** | `forge doctor` / `forge budget` / `forge nav build|rebuild|lookup`；`context-budget-lib.mjs` |
| **协议** | 新建 `docs/architecture/context-budget-system.md` + `skills/guides/context-budget-protocol.md` |
| **预算** | v2 ：`hard_total_cap_kb` / `loop_safety` / `navigation_first` / snapshot_limits |

## 三、设计精髓

```
┌─ L0 INDEX 永读（6 KB） ──┐
│   目录页：知道存在什么    │ ← Anthropic JIT loading
└────────┬─────────────────┘
         ▼
┌─ navigator sub-agent ────┐  ← SPD-RAG 模式
│   读 INDEX，输出 ≤200 行  │
│   context-plan 给主 Skill │
└────────┬─────────────────┘
         ▼
┌─ chapter-production ─────┐
│   只按 plan.must_load 读 │  ← 不再「全 manifest 加载」
└──────────────────────────┘

横向：AI Loop 安全栓 — circuit_state {green|yellow|red} + cost/stall/review_fail
纵向：信息越多，INDEX 越发挥作用；单次 context **恒定** ≈ 35 KB
```

## 四、关键产物

- `stories/_template/canon/INDEX.yaml`
- `stories/_template/registries/INDEX.yaml`
- `stories/_template/state/memory/INDEX.yaml`
- `skills/roles/navigator/SKILL.md`
- `skills/guides/context-budget-protocol.md`
- `harness/scripts/context-budget-lib.mjs`
- `harness/context-budget.yaml` v2
- `docs/architecture/context-budget-system.md`

## 五、设计目标（增长曲线）

| 章号 | 文件数 | 旧设计 context | 新设计 context |
|------|-------|---------------|---------------|
| 10   | ~50   | 30 KB         | 25 KB         |
| 50   | ~300  | **~120 KB**（炸） | **~35 KB** |
| 200  | ~1200 | 不可行         | **~38 KB**    |

水平扩展可观，单次会话**永不滚雪球**。

## 六、CLI

```bash
pnpm forge doctor stories/{id} --chapter N    # 体检：circuit_state + INDEX 鲜度 + 预算
pnpm forge budget stories/{id} --chapter N    # 当前章预算条目可视化
pnpm forge nav rebuild stories/{id}           # 重建三份 INDEX
pnpm forge nav build stories/{id} --chapter N # 生成 context-plan-ch-NNN.yaml
pnpm forge nav lookup stories/{id} --id fs-3  # 单条 id 直查
```

## 七、旧书补齐

```bash
pnpm forge sync framework stories/{id}        # 自动复制 INDEX 模板
pnpm forge nav rebuild stories/{id}           # 首次刷新 INDEX 头部
```

navigator 在 INDEX 不存在/过期时自动 fallback + WARN，**不卡流水线**。

## 八、机械校验

```bash
pnpm forge workflow validate
pnpm forge doctor stories/_template --chapter 1   # 必须 circuit=green
pnpm smoke:all
```

## 九、与现有迭代关系

| 轮次 | 主题 | 与第十轮关系 |
|------|------|--------------|
| 第八轮 | 生产完整性 / 字数 band | 不变 |
| 第九轮 | 叙事引擎链 | 不变；story-engine 仍 critical 永读 |
| **第十轮** | 上下文预算 / 防雪球 | **新基础设施**：所有未来迭代受益 |

## 十、AI Loop 概念落地

| 业界概念 | 框架对应 |
|---------|----------|
| Auto-run loop | `pnpm forge next` + handoff |
| Sub-agent isolation | **navigator**（新） · 章 Skill 各自隔离 |
| External memory | Canon + Registries + INDEX |
| Loop safety brakes | `loop_safety.*`（context_pressure / stall / cost / review_fail） |
| Git-state-as-truth | 已实现（state/phase.yaml + chapter-summaries） |
| Worktree 并行 | 暂未引入；单书序列写作场景下非必要 |

## 十一、联动

[`layer-sync-contract.md`](../harness/layer-sync-contract.md)（L0 入契约） · [`framework-status.md`](framework-status.md) · [`../architecture/context-budget-system.md`](../architecture/context-budget-system.md) · [`../../skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md) · [`root-project-protection.md`](root-project-protection.md) · [`error-recovery-guide.md`](error-recovery-guide.md) · [`book-lifecycle.md`](book-lifecycle.md) · [`quality-gates-checklist.md`](quality-gates-checklist.md)
