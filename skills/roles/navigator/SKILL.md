---
name: navigator
description: >-
  Pre-context sub-agent. Reads only L0 INDEX files (canon/registries/memory)
  and outputs a distilled context plan (≤200 lines) listing exactly which files
  the next Skill must load. Replaces "load entire manifest" pattern. Prevents
  context bloat at scale (works the same for ch-10 and ch-200).
---

# Navigator（导航员 · sub-agent · 防雪球核心）

## 工作流位置

`chapter-cycle` **第 0 步**（在 context-router 之前）·  
新会话首次写章 / `forge doctor` 报 yellow|red 时强制激活。

## 设计目的

参考 Anthropic [Effective context engineering] + SPD-RAG sub-agent 模式：  
**主 Skill 不直接读海量原始文件**；navigator 在隔离会话里读 L0 INDEX，**输出压缩清单**，主 Skill 只按清单 load。

类比：你不会让一个程序员每次写代码前读完整本《代码大全》；他会查目录。

## BEFORE（navigator 自己只读以下）

仅读 L0 INDEX 三件套（合计 ≤ 6 KB）：

1. `canon/INDEX.yaml`
2. `registries/INDEX.yaml`
3. `state/memory/INDEX.yaml`
4. 本章 `canon/plot/beats/ch-{NNN}.md`（解析 `characters[]` / `conflict_active[]` / `cool_points[]` / `emotional_beats[]` 引用）

**禁止**读 cast-roster / voice-matrix 全文 / 任何登记册原文 / 任何角色卡正文。

## DURING（输出 context plan）

写 `state/working/context-plan-ch-{NNN}.yaml`（≤ 200 行）：

```yaml
chapter: 25
generated_at: "2026-06-11T16:30:00Z"
budget_estimate_kb: 38     # 预估本次 context 总量
circuit_state: green       # green | yellow | red
must_load:                 # 主 Skill 必读
  critical:
    - canon/plot/beats/ch-025.md
    - state/memory/summary-rolling.md
    - state/memory/chapter-summaries/ch-024.yaml
    - canon/style/voice.md
    - canon/style/prose-profile.yaml
    - canon/plot/story-engine.yaml
  high:
    - canon/characters/ming-zhou.md            # INDEX 命中本章出场
    - canon/characters/bai-yu.md
    - canon/world/locations/school.md
  medium_snapshots:
    - state/working/context-snapshot-ch-025/foreshadowing-open.yaml
    - state/working/context-snapshot-ch-025/hooks-open.yaml
    - state/working/context-snapshot-ch-025/cool-points-due.yaml
    - state/working/context-snapshot-ch-025/emotional-beats-due.yaml
skip_with_reason:          # 显式说明跳过原因（审计用）
  - path: canon/characters/lao-li.md
    reason: last_seen=8, archived in INDEX
  - path: registries/chekhov-guns.yaml
    reason: snapshot empty (no due in 5 ch)
on_demand_hints:           # 主 Skill 可能临时需要时用
  - "若涉及前史，pnpm forge nav lookup --id fs-003"
warnings:                  # navigator 体检发现的问题
  - "INDEX.canon last_synced_chapter=20 distance=5 — 建议 forge nav rebuild"
```

## CLI

```bash
pnpm forge nav build stories/{id} --chapter N      # 生成 context plan
pnpm forge nav rebuild stories/{id}                # 重建三份 INDEX
pnpm forge nav lookup stories/{id} --id fs-003     # 不进 manifest 的单查
pnpm forge doctor stories/{id} --chapter N         # 预算 + 鲜度体检
```

## 输出审查

- 总 budget_estimate_kb ≤ 60（warn）/ ≤ 72（红线 fail）
- must_load.critical 须包含本章 beats 与 voice/prose-profile/story-engine
- 凡 medium_snapshots 引用的 snapshot 文件不存在 → 自动跳过并 WARN

## 与 context-router 的关系

| 步 | Skill | 职责 |
|----|-------|------|
| 0 | **navigator** | 读 INDEX → 输出 context-plan |
| 1 | context-router | 根据 context-plan 决定 mode（auto/graph_hybrid/bm25_fallback）+ 跑 `forge context` |
| 2 | chapter-production | 严格按 plan.must_load 读，不私自扩展 |

旧书无 INDEX：navigator 自动 `forge nav rebuild`；首次会 fallback 到 legacy 全量 manifest + WARN。

## 禁止

- 读手稿正文（manuscripts/）
- 读任何角色卡 / 登记册原文
- 输出 plan 时遗漏 critical（CLI 会拒绝 handoff）
- 单 plan > 200 行（强行裁剪 skip_with_reason）

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill navigator --chapter N
```

详见 [`../../guides/context-budget-protocol.md`](../../guides/context-budget-protocol.md) · [`../../../docs/architecture/context-budget-system.md`](../../../docs/architecture/context-budget-system.md)
