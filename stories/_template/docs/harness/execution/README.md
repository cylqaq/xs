# 执行 Harness

控制 **生成前 / 生成中 / 生成后**，与 **工作流 Harness**、**Skill 语义** 解耦但联动。

| Harness | 管什么 | 路径 |
|---------|--------|------|
| 执行文档（本文 + phases） | 阶段行为、禁止项 | `docs/harness/execution/` |
| 工作流 | Skill 顺序、handoff、CLI 门禁 | `harness/workflows/` |
| Manifest | 读/写哪些文件 | `harness/manifests/` |
| Skill | 角色语义与产出说明 | `skills/roles/` |

**改任意一层 → 必读** [`../layer-sync-contract.md`](../layer-sync-contract.md)

## 入口命令

```bash
pnpm forge next stories/{id} [--chapter N]     # 当前 Skill（L2 编译结果）
pnpm forge run stories/{id} --workflow auto    # 全流程剧本
pnpm forge handoff complete ...                # 步间交接
pnpm forge manifest <task> stories/{id}        # L3 文件清单
pnpm forge workflow validate                   # L2 ⊆ L3 机械校验
```

## 三阶段循环（每章 · 由 chapter-cycle 强制执行）

```
BEFORE → DURING → AFTER → GATE(handoff+review) → advance
```

## 阶段索引

| 文件 | workflow / manifest |
|------|---------------------|
| [`phases/00-bootstrap.md`](phases/00-bootstrap.md) | creation-chain · bootstrap |
| [`phases/00b-prose-style.md`](phases/00b-prose-style.md) | creation-chain · prose-style |
| [`phases/01-worldbuilding.md`](phases/01-worldbuilding.md) | creation-chain · worldbuilding |
| [`phases/02-characters.md`](phases/02-characters.md) | creation-chain · characters |
| [`phases/03-outline.md`](phases/03-outline.md) | creation-chain · outline-batch（6 Skill 步） |
| [`phases/04-foreshadow-hooks.md`](phases/04-foreshadow-hooks.md) | 与 03 交织；registry 分工 |
| [`phases/05-chapter-draft.md`](phases/05-chapter-draft.md) | chapter-cycle · chapter-draft |
| [`phases/06-post-chapter.md`](phases/06-post-chapter.md) | chapter-cycle · post-chapter |
| [`phases/07-revision.md`](phases/07-revision.md) | patch-cycle · revision-volume |
| [`phases/08-rebuild.md`](phases/08-rebuild.md) | rebuild-chain · rebuild-canon |
| [`lifecycle.md`](lifecycle.md) | 全书 ideation→publish |

## Manifest 表（L3 · skills 字段须覆盖 workflow 步）

| manifest | 阶段 | skills（须 ⊇ workflow 引用步） |
|----------|------|--------------------------------|
| `bootstrap` | 00 | novel-orchestrator, seed-intake, novel-bootstrap |
| `prose-style` | 00b | prose-style-architect |
| `worldbuilding` | 01 | world-architect |
| `characters` | 02a | character-forge |
| `cast-network` | 02b | cast-network-weaver |
| `persona-voice` | 02c | persona-voice-binder |
| `outline-batch` | 03–04 | plot-architect, conflict-architect, foreshadow-engineer, hook-manager, batch-planner, retention-analyst |
| `chapter-draft` | 05 | **navigator, context-router, chapter-production, dialogue-craftsman** |
| `post-chapter` | 06 | continuity-warden, persona-evolution-warden, retention-analyst（`during_write_by_skill` 分责） |
| `revision-volume` | 07 | chief-editor, style-guardian, patch-refiner, rule-reviewer |
| `rebuild-canon` | 08 | canon-rebuilder |

```bash
pnpm smoke:all
```

模板：`harness/templates/chapter-summary.yaml`、`retention-chapter.yaml`

**字数哲学**：故事合理性优先于字数达标。详见 [`skills/guides/word-count-philosophy.md`](../../../skills/guides/word-count-philosophy.md)

**根项目保护**：防止书籍生产污染根项目。详见 [`docs/ops/root-project-protection.md`](../../ops/root-project-protection.md)

**错误恢复指南**：流程卡住/手稿写坏时的恢复路径。详见 [`docs/ops/error-recovery-guide.md`](../../ops/error-recovery-guide.md)

**单书生命周期**：从创建到归档的完整管理。详见 [`docs/ops/book-lifecycle.md`](../../ops/book-lifecycle.md)

**质量门禁检查清单**：每章/每卷/每书的质量检查。详见 [`docs/ops/quality-gates-checklist.md`](../../ops/quality-gates-checklist.md)
