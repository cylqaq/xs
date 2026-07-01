# Phase 07 — 精修 + 反馈循环

## 章级（drafting · `patch-cycle` workflow）

review FAIL → `forge next` 路由 `patch-cycle` → 按 `action_items.delegate_skill` 激活一步：

| delegate_skill | workflow 步 |
|----------------|-------------|
| patch-refiner | patch-refiner |
| chapter-expander | expand |
| dialogue-craftsman | dialogue |
| continuity-warden | continuity-fix |

完成后 `rule-reviewer` handoff（postflight: review）· ≤3 轮 · 超限 `blocked`

## 卷级（`revision-volume` workflow）

```bash
pnpm forge manifest revision-volume stories/{id} --chapter N
```

**Skill 链（每步隔离 + handoff）**：

`chief-editor` → `style-guardian` → `patch-refiner` → `rule-reviewer`

| 步 | 关键产物 |
|----|----------|
| chief-editor | `state/checkpoints/revision-vol-01.yaml` |
| patch-refiner | `state/revisions/ch-{NNN}-r{round}/` 三元组 |
| rule-reviewer | review PASS |

## 与五层契约

改补丁规则 → 同步 `harness/review/config.json`、`skills/roles/rule-reviewer`、`patch-cycle.yaml`  
见 [`../../layer-sync-contract.md`](../../layer-sync-contract.md)
