# Harness 工作流（L2 编排契约）

定义 **Skill 顺序、隔离、handoff、CLI 门禁**。由 `orchestrator-lib.mjs` 编译为 `forge next` / `run-plan.json`。

**与 Skill / manifest / 文档联动**：[`docs/harness/layer-sync-contract.md`](../../docs/harness/layer-sync-contract.md)

| 工作流 | 用途 | 步数 |
|--------|------|------|
| `creation-chain` | 开书（含 prose-style · 人物 3 步 · outline 6 步含 conflict-architect） | **14** |
| `chapter-cycle` | 单章微循环（含 `when_dialogue` · 第十轮新增 navigator 第 0 步） | **9** |
| `patch-cycle` | review FAIL 补丁链 | 7 |
| `revision-volume` | 卷精修 + re-review | — |
| `rebuild-chain` | `sub_phase: rebuild-canon` | — |

## 铁律

1. **一 Skill 一会话** — 顺序以本目录 YAML 为准，不以 Skill 文档口头约定为准
2. **handoff complete** — 强制 postflight + 产物校验
3. **manifest:** — 每步引用 `harness/manifests/`；`forge workflow validate` 校验 skill ⊆ manifest.skills
4. **navigator 第 0 步**（第十轮）— 章首读 L0 INDEX 输出 context-plan；其他 Skill 据此加载，防止滚雪球。详见 [`docs/architecture/context-budget-system.md`](../../docs/architecture/context-budget-system.md)

## 条件步

| 字段 | 含义 |
|------|------|
| `when_dialogue: true` | beats 含对话关键词 |
| `reads_handoff_when_dialogue` | 仅当 `when_dialogue` 步激活时要求的 handoff（如 continuity ← dialogue） |
| `skip_when: no_persona_shift_triggers` | 本章无 persona 触发章时自动写 skip handoff |
| `when_delegate: <skill>` | patch-cycle 路由 |
| `gate: draft_ready` | continuity 前 production (+ 可选 dialogue) handoff |
| `requires_review_pass: true` | advance 前 review PASS |

## 改 workflow 后必做

见 [`layer-sync-contract.md`](../../docs/harness/layer-sync-contract.md) 检查表 + `pnpm forge workflow validate` + `pnpm smoke:all`

**字数哲学**：故事合理性优先于字数达标。详见 [`skills/guides/word-count-philosophy.md`](../../skills/guides/word-count-philosophy.md)

**根项目保护**：防止书籍生产污染根项目。详见 [`docs/ops/root-project-protection.md`](../../docs/ops/root-project-protection.md)

**错误恢复指南**：流程卡住/手稿写坏时的恢复路径。详见 [`docs/ops/error-recovery-guide.md`](../../docs/ops/error-recovery-guide.md)

**单书生命周期**：从创建到归档的完整管理。详见 [`docs/ops/book-lifecycle.md`](../../docs/ops/book-lifecycle.md)

**质量门禁检查清单**：每章/每卷/每书的质量检查。详见 [`docs/ops/quality-gates-checklist.md`](../../docs/ops/quality-gates-checklist.md)
