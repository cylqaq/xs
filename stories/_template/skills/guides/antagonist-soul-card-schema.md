# 反派/对手灵魂卡字段契约（Antagonist Soul Card Schema）

> **性质**：`character-soul-card-schema.md` 的补充契约，专门针对反派/对手角色。  
> **模板**：`stories/_template/canon/characters/char-antagonist.example.md`  
> **实例**：每本书 `canon/characters/{id}.md`

## 设计哲学

反派/对手角色需要特殊的灵魂深度设计：

1. **镜像关系**：反派是主角的镜像，反映主角可能堕落的方向
2. **扭曲逻辑**：反派的行为必须有自洽的逻辑，即使这个逻辑是扭曲的
3. **可恨又可理解**：读者应该能理解反派的动机，即使不认同其行为
4. **主题表达**：反派是表达主题的重要手段

## 新增必填节（character-forge）

| 节 | 用途 | 设计理念 |
|----|------|----------|
| **镜像关系（Mirror Relationship）** | 与主角的镜像关系 | 反派是主角的另一种可能 |
| **扭曲逻辑（Twisted Logic）** | 反派行为的自洽逻辑 | 让反派可信 |
| **可恨又可理解（Hateable yet Understandable）** | 平衡点设计 | 让反派有深度 |
| **主题表达（Theme Expression）** | 如何通过反派表达主题 | 增强故事深度 |
| **与主角的对立（Protagonist Opposition）** | 具体的对立点 | 创造戏剧冲突 |

## 新增字段详解

### 镜像关系（Mirror Relationship）

反派是主角的镜像，反映主角可能堕落的方向。必须：
- 与主角有相似的起点
- 因为不同的选择走向不同的道路
- 代表主角可能堕落的方向
- 通过对比突出主角的成长

示例：
```yaml
mirror_relationship:
  shared_origin: "都曾是被背叛的孤儿"
  divergent_choice: "主角选择信任，反派选择复仇"
  dark_reflection: "反派是主角如果选择仇恨的未来"
  thematic_purpose: "展示信任与仇恨的不同结果"
```

### 扭曲逻辑（Twisted Logic）

反派行为的自洽逻辑，即使这个逻辑是扭曲的。必须：
- 有明确的前提和推理过程
- 从反派的角度看是合理的
- 有情感根源
- 能让读者理解（即使不认同）

示例：
```yaml
twisted_logic:
  premise: "世界是残酷的，只有强者才能生存"
  reasoning: "我曾被背叛，所以我要成为最强者，让所有人臣服"
  emotional_origin: "童年的背叛创伤"
  reader_understanding: "读者能理解被背叛的痛苦，但不认同其复仇逻辑"
```

### 可恨又可理解（Hateable yet Understandable）

平衡点设计，让反派有深度。必须：
- 有让读者恨的理由
- 有让读者理解的理由
- 两者之间有张力
- 创造复杂的情感反应

示例：
```yaml
hateable_yet_understandable:
  hateable_traits: ["残忍", "无情", "利用他人"]
  understandable_traits: ["曾被背叛", "保护弱者的扭曲方式", "对忠诚的极端重视"]
  balance_point: "读者恨其行为，但理解其动机"
  emotional_complexity: "读者在恨与同情之间摇摆"
```

### 主题表达（Theme Expression）

如何通过反派表达主题。必须：
- 与故事主题相关
- 通过反派的行为和命运表达
- 与主角形成对比
- 增强主题深度

示例：
```yaml
theme_expression:
  theme: "信任与仇恨的选择"
  antagonist_expression: "反派选择仇恨，最终走向毁灭"
  protagonist_contrast: "主角选择信任，最终获得救赎"
  thematic_purpose: "展示两种选择的不同结果"
```

### 与主角的对立（Protagonist Opposition）

具体的对立点，创造戏剧冲突。必须：
- 有明确的对立领域
- 有具体的冲突点
- 有升级的可能
- 与故事弧相关

示例：
```yaml
protagonist_opposition:
  opposition_areas: ["价值观", "方法论", "对世界的看法"]
  specific_conflicts: ["保护弱者的方式", "对力量的理解", "对信任的态度"]
  escalation_potential: "从理念对立到直接冲突"
  linked_arc: arc-main
```

## 禁止

- 反派的动机过于简单（如纯粹的邪恶）
- 反派的行为没有逻辑（如无理由的残忍）
- 反派与主角没有镜像关系
- 反派不能表达主题

## 相关

- [`character-soul-card-schema.md`](character-soul-card-schema.md)
- [`character-persona-chain.md`](character-persona-chain.md)
- [`ability-defect-matrix.md`](ability-defect-matrix.md)
