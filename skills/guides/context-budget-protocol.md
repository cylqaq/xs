# Context Budget Protocol（防雪球作业手册 · 第十轮）

> **铁律**：项目越大，单次会话越**轻**。读 INDEX，不读海洋。
> 协议来源：[`docs/architecture/context-budget-system.md`](../../docs/architecture/context-budget-system.md)
> 业界对照：Anthropic JIT loading · SPD-RAG sub-agent · Loop Engineering

## 一、五层防雪球速记

| 层 | 上限 | 谁读 | 何时 |
|----|------|------|------|
| L0 INDEX | 6 KB | 所有 Skill 永读 | 每次 |
| L1 Critical | 30 KB | 所有 Skill | 永不裁 |
| L2 High | 20 KB | navigator 命中后 | 按章 |
| L3 Medium | 16 KB | snapshot 过滤 | 限 25 条/file |
| L4 Low | 2 KB | 显式 lookup | 不默认 |

## 二、铁律

1. **navigator 必先跑** — 任何写章会话首动作：`pnpm forge nav build stories/{id} --chapter N`
2. **INDEX 必同步** — `continuity-warden` 章后必须写三份 INDEX（manifest `during_write_by_skill` 强制）
3. **超 60 KB 即降级** — `forge doctor` 检测 `circuit_state`；yellow 推荐 / red 拒绝继续加载
4. **L4 默认不读** — 想看 glossary / outline-amendments，必须 `forge nav lookup --id xxx`
5. **snapshot 限 25 条** — 超出按 `due_within_5ch` 排序裁
6. **archive 配角** — `canon/INDEX.yaml.archive_after_chapters`（默认 10）：超阈值角色卡移入 archive 不进 context

## 三、Workflow 改动（chapter-cycle v2）

```
[NEW] 0. navigator      → context-plan-ch-NNN.yaml
      1. context-router → forge context（按 plan 加载）
      2. chapter-production
      3. [dialogue-craftsman 条件]
      4. continuity-warden（更新三份 INDEX）
      5. persona-evolution-warden
      6. retention-analyst（更新 INDEX.registries.plot_debt 摘要）
      7. rule-reviewer
      8. advance
```

## 四、INDEX 维护责任分配

| INDEX 文件 | 主维护 | 副维护 | 频率 |
|-----------|--------|--------|------|
| `canon/INDEX.yaml` | continuity-warden | cast-network-weaver 初始化 | 每 5 章或新角色登场 |
| `registries/INDEX.yaml` | continuity-warden | retention-analyst（plot_debt） | 每章 |
| `state/memory/INDEX.yaml` | continuity-warden | — | 每章 |

## 五、AI Loop 安全栓

| 触发 | 状态 | 处置 |
|------|------|------|
| context ≥ 85% 预算 | yellow | 推荐压 M1 / 裁 snapshot |
| context ≥ 100% 预算 | red | 拒绝加载 → 强制 navigator 重组 |
| 连续 3 章 beats 兑现率 < 50% | yellow | 强制 retention 介入 + spark 分诊 |
| 连续 3 轮 review FAIL | blocked | `forge phase advance --force --reason` |
| 单章预估成本 > $5 | warn | 提示分章 |

## 六、故障排查

| 症状 | 命令 |
|------|------|
| 会话突然变慢 | `pnpm forge doctor stories/{id} --chapter N` |
| INDEX 过期 | `pnpm forge nav rebuild stories/{id}` |
| 看哪些被裁了 | `pnpm forge budget stories/{id} --chapter N` |
| 找单个 id 详情 | `pnpm forge nav lookup stories/{id} --id fs-003` |
| 旧书无 INDEX | `pnpm forge sync framework stories/{id}` |

## 七、新书 vs 旧书

- **新书**：`forge sync framework` 已生成三份空 INDEX，正常走流程即可
- **旧书**：首次进入 chapter-cycle 时 navigator 会自动调 `forge nav rebuild`；可能耗时几十秒，仅一次

## 八、常见误用

| 错误 | 后果 | 正确做法 |
|------|------|---------|
| 直接读 cast-roster 全文 | context 爆 | 查 `canon/INDEX.yaml.characters` |
| 读 foreshadowing.yaml 全文 | 数百伏笔涌入 | 用 snapshot + INDEX.due_within_5ch |
| 写章前不跑 navigator | 旧式全量加载 | `pnpm forge nav build` |
| INDEX 长期不更新 | 信息漂移 | `forge doctor` 会 WARN |

## 九、与五层联动契约的关系

L0 INDEX 是**新增的 L6 层**（在 L1 Skill 之外的「数据接力层」）。  
[`docs/harness/layer-sync-contract.md`](../../docs/harness/layer-sync-contract.md) 已增 INDEX 同步检查项。
