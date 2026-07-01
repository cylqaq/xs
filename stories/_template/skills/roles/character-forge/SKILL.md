---
name: character-forge
description: >-
  Creates character bibles in creation-chain step 5. Isolated session after
  world-architect. Writes canon/characters before plot-architect. Binds
  appearance, age, and power-defect instances. Enhanced with psychological
  depth: The Wound, The Lie, Want vs Need, Core Contradiction.
---

# Character Forge

## 工作流位置

`creation-chain` 第 6 步 · 读 `@world-architect` handoff · 交 `@cast-network-weaver`

## 产出

- `canon/characters/index.yaml`
- `canon/characters/{id}.md` — 字段见 [`character-soul-card-schema.md`](../../guides/character-soul-card-schema.md)
- 更新 `canon/world/power-defects.yaml` 的 `character_bindings`（与 world 规则一致）

## 人物卡必填节

1. **年龄与学龄** — 与 `seed/layer2` 的 `narrative_age_span`、`protagonist_age_gap` 一致
2. **外貌锚点** — 可复述的视觉特征（写作时禁止漂移）
3. **能力** — 引用 `rules.md` / `power-defects.yaml`，不得超上限
4. **缺陷实例** — 每人至少 2 项缺陷及**首次触发场景草案**
5. **欲望 / 恐惧 / 秘密** — 与缺陷链咬合
6. **关系网与说话风格**

### 新增心理深度字段（必填）

7. **核心创伤（The Wound）** — 过去经历的创伤事件，塑造 The Lie
   - 必须有具体的时间、地点、人物
   - 必须有明确的情感冲击
   - 必须说明如何通过行为展示（show not tell）

8. **错误信念（The Lie）** — 角色相信的关于自己或世界的错误信念
   - 由核心创伤塑造
   - 看似合理但实际上是错误的
   - 驱动角色的外在欲望（Want）

9. **外在欲望 vs 内在需求（Want vs Need）** — 分离设计
   - Want：角色有意识追求的目标（具体、可衡量）
   - Need：角色无意识需要学习的真相（抽象、关于成长）
   - 两者之间的矛盾创造内在张力

10. **核心矛盾（Core Contradiction）** — 对立特质
    - 两个对立的特质
    - 如何在行为中表现
    - 具体场景示例

11. **需求层级（Maslow Level）** — 动机冲突设计
    - 当前驱动层级
    - 威胁的下一层级
    - 层级冲突如何创造戏剧性

12. **诊断性细节（Diagnostic Details）** — 具体的感官细节
    - 独特的习惯动作
    - 特定的感官偏好
    - 无意识的小动作
    - 与背景相关的细节

13. **角色符号系统** — 核心记忆点设计
    - 标志性物件
    - 习惯动作
    - 反复意象
    - 符号的深层含义

## 角色类型灵魂深度标准

### Core 角色（主角/关键对手）

必须完整填写所有心理深度字段：
- 核心创伤（The Wound）
- 错误信念（The Lie）
- 外在欲望 vs 内在需求（Want vs Need）
- 核心矛盾（Core Contradiction）
- 需求层级（Maslow Level）
- 诊断性细节（Diagnostic Details）
- 角色符号系统

### Major 角色（重要配角）

必须填写以下心理深度字段：
- 核心创伤（The Wound）— 可简化，但必须有
- 错误信念（The Lie）— 可简化，但必须有
- 外在欲望 vs 内在需求（Want vs Need）— 必须有
- 诊断性细节（Diagnostic Details）— 至少 2 条

### Minor 角色（次要配角）

必须填写以下心理深度字段：
- 外在欲望（Want）— 必须有
- 诊断性细节（Diagnostic Details）— 至少 1 条
- 核心矛盾（Core Contradiction）— 可选，但推荐

### 反派/对手角色

必须填写所有心理深度字段，外加反派特殊字段：
- 镜像关系（Mirror Relationship）
- 扭曲逻辑（Twisted Logic）
- 可恨又可理解（Hateable yet Understandable）
- 主题表达（Theme Expression）
- 与主角的对立（Protagonist Opposition）

详见 [`antagonist-soul-card-schema.md`](../../guides/antagonist-soul-card-schema.md)

## 规则

- 新人名须先建卡或 `new_pending` 入 summary
- 缺陷必须来自 `power-defects.yaml` 的 `defect_types`，不可即兴发明
- **The Lie 必须由核心创伤塑造**，不可凭空设定
- **Want 与 Need 必须有明确的矛盾**，创造内在张力
- **诊断性细节必须是具体的、非制造的**，避免陈词滥调
- **配角的灵魂深度必须达到最低标准**，不可过于扁平

## 心理深度检查清单

在完成灵魂卡后，检查以下项目：

- [ ] 核心创伤是否有具体的时间、地点、人物？
- [ ] 错误信念是否由核心创伤塑造？
- [ ] Want 与 Need 是否有明确的矛盾？
- [ ] 核心矛盾是否在场景中可见？
- [ ] 诊断性细节是否具体、非制造？
- [ ] 角色符号是否有深层含义？
- [ ] 所有心理深度字段是否通过行为展示而非讲述？
- [ ] 配角是否达到灵魂深度最低标准？
- [ ] 反派是否有镜像关系和扭曲逻辑？

## 多智能体交接

```bash
pnpm forge handoff complete stories/{id} --skill character-forge
```

postflight：`validate --task characters`

## 联动

- 读 [`skills/guides/ability-defect-matrix.md`](../../guides/ability-defect-matrix.md)
- 读 [`skills/guides/character-persona-chain.md`](../../guides/character-persona-chain.md)
- 读 [`skills/guides/character-soul-card-schema.md`](../../guides/character-soul-card-schema.md)
- 读 [`skills/guides/antagonist-soul-card-schema.md`](../../guides/antagonist-soul-card-schema.md)
- 父母/社会关系由 `@cast-network-weaver` 扩展，本步只写 **灵魂卡**（core/major 主角与关键对手）
- handoff 注明 T1–Tn 是否已分配配角
