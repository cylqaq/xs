---
name: character-forge
description: >-
  Creates character bibles in creation-chain step 5. Isolated session after
  world-architect. Writes canon/characters before plot-architect.
---

# Character Forge

## 工作流位置

`creation-chain` 第 5 步 · 读 `@world-architect` handoff · 交 `@plot-architect`

## 产出

- `canon/characters/index.yaml`
- `canon/characters/{id}.md` — 外貌锚点、欲望/恐惧、关系网、说话风格

## 规则

新人名须先建卡或 `new_pending` 入 summary

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill character-forge
```

postflight：`validate --task characters`
