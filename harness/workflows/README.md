# Harness 工作流（L2 编排契约）

定义 **Skill 顺序、隔离、handoff、CLI 门禁**。由 `orchestrator-lib.mjs` 编译为 `forge next` / `run-plan.json`。

**与 Skill / manifest / 文档联动**：[`docs/harness/layer-sync-contract.md`](../../docs/harness/layer-sync-contract.md)

| 工作流 | 用途 |
|--------|------|
| `creation-chain` | 开书 **13** 步（含 prose-style · 人物 3 步 · outline 5 步） |
| `chapter-cycle` | 单章微循环（含 `when_dialogue`） |
| `patch-cycle` | review FAIL 补丁链 |
| `revision-volume` | 卷精修 + re-review |
| `rebuild-chain` | `sub_phase: rebuild-canon` |

## 铁律

1. **一 Skill 一会话** — 顺序以本目录 YAML 为准，不以 Skill 文档口头约定为准
2. **handoff complete** — 强制 postflight + 产物校验
3. **manifest:** — 每步引用 `harness/manifests/`；`forge workflow validate` 校验 skill ⊆ manifest.skills

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
