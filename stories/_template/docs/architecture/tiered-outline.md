# 三级大纲体系

来源理念：马良写作「总纲 → 卷纲 → 章蓝图」；结合本框架 `beats/` 与登记册。

## 层级

| 级 | 文件 | 粒度 | 负责 Skill |
|----|------|------|------------|
| L1 总纲 | `canon/plot/master-outline.md` | 全书矛盾、成长弧、结局方向 | plot-architect |
| L2 卷纲 | `canon/plot/volumes/vol-{NN}.md` | 每卷 3–5 万字阶段目标 | plot-architect |
| L3 章蓝图 | `canon/plot/beats/ch-{NNN}.md` | 单章情节点 | plot-architect + batch-planner |

## 推导规则

```
总纲.core_conflict
  → 卷纲.vol_goal（每卷一句可检验目标）
    → beats.ch_goal（每章可执行）
      → registries（伏笔/钩子 id 挂载到 beats）
```

## 机器可读索引

`canon/plot/chapter-plan.md` — 表格式全章索引（承接 chinese-novelist 大纲表），与 `state/writing-plan.json` 章号严格一致。

## DoD

- drafting 前：当前卷 vol 文件存在 + 下一 batch beats 就绪
- 改总纲：必须写 continuity-log，并检查 plot-debt
