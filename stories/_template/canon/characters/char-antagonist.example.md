# {反派姓名}（example · 复制为 {id}.md 后删除 example 后缀）

## 标识

- id: char-antagonist
- 姓名：
- 称呼：
- 角色位：antagonist

## 年龄与学龄轨迹

| 年 | 年龄 | 事件 |
|----|------|------|

## 外貌锚点

（3–5 条不可漂移特征）

## 日常习惯

## 应激反应与微表情

## 核心创伤（The Wound）

> 塑造错误信念（The Lie）的根源创伤。必须有具体的时间、地点、人物，通过行为展示而非讲述。

```yaml
wound:
  event: # 具体创伤事件
  age: # 发生年龄
  emotional_impact: # 情感冲击
  behavioral_pattern: # 持续影响的行为模式
  show_not_tell: # 如何在正文中展示
```

## 错误信念（The Lie）

> 角色相信的关于自己或世界的错误信念，驱动行为模式的核心。

```yaml
lie:
  statement: # 错误信念的具体表述
  origin: # 如何由创伤塑造
  manifestation: # 在行为中的表现
  truth_to_learn: # 故事中需要学习的真相（反派可能拒绝学习）
```

## 外在欲望 vs 内在需求（Want vs Need）

> 外在欲望（Want）与内在需求（Need）的分离创造内在张力。

```yaml
want: # 角色有意识追求的目标（具体、可衡量）
need: # 角色无意识需要学习的真相（抽象、关于成长）
contradiction: # Want 与 Need 的矛盾如何创造戏剧性
```

## 核心矛盾（Core Contradiction）

> 对立特质创造深度和记忆点。必须在场景中可见。

```yaml
core_contradiction:
  trait_a: # 第一个特质
  trait_b: # 对立的第二个特质
  manifestation: # 在行为中的表现
  scene_example: # 具体场景示例
```

## 需求层级（Maslow Level）

> 用马斯洛需求层级设计动机冲突。

```yaml
maslow_level:
  current: # 当前驱动层级（physiological/safety/love/esteem/self_actualization）
  threat: # 威胁的下一层级
  conflict: # 层级冲突如何创造戏剧性
  growth: # 角色如何通过冲突成长（反派可能拒绝成长）
```

## 真灵与能力

- 能力：
- 缺陷：见 `power-defects.yaml`
- **缺陷行为模式**：（何时失控、伤及谁）

## 欲望 / 恐惧 / 秘密

> 与 Want/Need 互补，提供更具体的情感锚点。

## 家庭与社会

## 性格基线与暗面

> Character Contradiction 的具体化。基线 + 压力下反差。

## 诊断性细节（Diagnostic Details）

> 具体的、非制造的感官细节让角色真实可信。

```yaml
diagnostic_details:
  - # 独特的习惯动作
  - # 特定的感官偏好
  - # 无意识的小动作
  - # 与背景相关的细节
```

## 角色符号系统

> 创造核心记忆点的符号化设计。

```yaml
symbolic_system:
  signature_object: # 标志性物件
  habitual_action: # 习惯动作
  recurring_image: # 反复意象
  meaning: # 符号的深层含义
```

## 关系网详表

| 对象 | 关系 | 情绪方向 |
|------|------|----------|

## 声线速查

→ `voice-matrix.yaml` / `{id}`

## 转变预警

→ `persona-shifts.yaml` / ps-xxx
→ `character-arcs.yaml` / ca-xxx

## 写作禁忌

（本书专用 OOC，补充 voice-matrix forbidden_ooc）

---

## 反派/对手特殊字段

### 镜像关系（Mirror Relationship）

> 反派是主角的镜像，反映主角可能堕落的方向。

```yaml
mirror_relationship:
  shared_origin: # 与主角的相似起点
  divergent_choice: # 不同的选择导致不同的道路
  dark_reflection: # 反派是主角如果做出不同选择的未来
  thematic_purpose: # 如何通过镜像关系表达主题
```

### 扭曲逻辑（Twisted Logic）

> 反派行为的自洽逻辑，即使这个逻辑是扭曲的。

```yaml
twisted_logic:
  premise: # 反派的核心前提
  reasoning: # 从前提到行为的推理过程
  emotional_origin: # 逻辑的情感根源
  reader_understanding: # 读者如何理解这个逻辑
```

### 可恨又可理解（Hateable yet Understandable）

> 平衡点设计，让反派有深度。

```yaml
hateable_yet_understandable:
  hateable_traits: # 让读者恨的特质
  understandable_traits: # 让读者理解的特质
  balance_point: # 如何平衡恨与理解
  emotional_complexity: # 创造的情感复杂性
```

### 主题表达（Theme Expression）

> 如何通过反派表达主题。

```yaml
theme_expression:
  theme: # 故事主题
  antagonist_expression: # 反派如何表达主题
  protagonist_contrast: # 与主角的对比
  thematic_purpose: # 如何增强主题深度
```

### 与主角的对立（Protagonist Opposition）

> 具体的对立点，创造戏剧冲突。

```yaml
protagonist_opposition:
  opposition_areas: # 对立领域
  specific_conflicts: # 具体冲突点
  escalation_potential: # 升级可能
  linked_arc: # 关联的故事弧
```
