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
| [`phases/01-worldbuilding.md`](phases/01-worldbuilding.md) | creation-chain · worldbuilding |
| [`phases/02-characters.md`](phases/02-characters.md) | creation-chain · characters |
| [`phases/03-outline.md`](phases/03-outline.md) | creation-chain · outline-batch（5 Skill 步） |
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
| `worldbuilding` | 01 | world-architect |
| `characters` | 02a | character-forge |
| `cast-network` | 02b | cast-network-weaver |
| `persona-voice` | 02c | persona-voice-binder |
| `outline-batch` | 03–04 | plot-architect, foreshadow-engineer, hook-manager, batch-planner, retention-analyst |
| `chapter-draft` | 05 | context-router, chapter-production, dialogue-craftsman |
| `post-chapter` | 06 | continuity-warden, persona-evolution-warden, retention-analyst |
| `revision-volume` | 07 | chief-editor, style-guardian, patch-refiner, rule-reviewer |
| `rebuild-canon` | 08 | canon-rebuilder |

```bash
pnpm smoke:all
```

模板：`harness/templates/chapter-summary.yaml`、`retention-chapter.yaml`
