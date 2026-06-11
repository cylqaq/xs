# 三大黄金法则（正文门禁）

全项目 `chapter-production`、`patch-refiner`、`chapter-expander` 必遵守。

1. **展示而非讲述** — 用动作、对话、细节；避免「他很愤怒」式直述
2. **冲突驱动** — 每章至少一处冲突或转折（对齐 beats）
3. **悬念承上启下** — 章末留叙事悬念；**钩子 id 只登记** `registries/hooks.yaml`，**禁止**写进正文

## 完整性（硬，CLI 强制）

见 [`production-integrity-gates.md`](production-integrity-gates.md)：

- **禁止**登记册 id、章号 meta、框架术语进 `manuscripts/`
- **禁止**重复章末收束、弧光摘要凑字数
- handoff / review 失败则 **不得** 进入 continuity

评审：`rule-reviewer` 含 `meta_prose_leakage` + `anti_padding`；人工卷审对照本文件。
