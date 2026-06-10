# 本书读序（覆盖全局默认）

当前阶段：见 `state/phase.yaml`

## ideation

1. seed/author-intent.md
2. `@seed-intake` → seed/layer1-core.yaml 等
3. docs/harness/execution/phases/00-bootstrap.md

## drafting 第 N 章

```bash
pnpm forge context stories/{本书id} --chapter N
pnpm forge manifest chapter-draft stories/{本书id} --chapter N
```

1. state/memory/summary-rolling.md
2. state/memory/chapter-summaries/ch-{N-1}.yaml（若存在）
3. canon/plot/beats/ch-{NNN}.md
4. registries/foreshadowing.yaml（过滤本章相关）
5. registries/hooks.yaml（过滤 open）
6. canon/style/voice.md
7. 角色卡（按 beats 引用的 id）

写后：`pnpm forge manifest post-chapter stories/{本书id} --chapter N` → phases/06-post-chapter.md
