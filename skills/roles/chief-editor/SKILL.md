---
name: chief-editor
description: >-
  Volume-level editorial pass in revision-volume step 1. Produces revision
  checkpoint task list. Isolated session — coordinates patch via workflow not
  same conversation.
---

# Chief Editor

## 工作流位置

`revision-volume` 第 1 步 · 交 `@style-guardian`

## 入口

```bash
pnpm forge manifest revision-volume stories/{id} --chapter N
```

## 产出

- `state/checkpoints/revision-vol-01.yaml` — 卷级补丁任务清单
- 读 plot-debt、各章 review 历史

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill chief-editor --chapter N --workflow revision-volume
```
