# 灵魂卡字段契约（Character Soul Card Schema）

> **模板**：`stories/_template/canon/characters/char-protagonist.example.md`  
> **实例**：每本书 `canon/characters/{id}.md`  
> **联动**：`voice-matrix.yaml`、`persona-shifts.yaml`、`power-defects.yaml`、`character-arcs.yaml`

## 设计哲学

灵魂卡的核心目标是创造**有灵魂、有深度、有核心记忆点**的角色。基于心理学和叙事理论，我们采用以下设计原则：

1. **Want vs Need 分离**：外在欲望（Want）与内在需求（Need）的张力创造深度
2. **The Wound → The Lie**：核心创伤塑造错误信念，错误信念驱动行为模式
3. **Iceberg Principle**：知道的比展示的多 10 倍，用行为展示而非讲述
4. **Diagnostic Details**：具体的、非制造的感官细节让角色真实
5. **Character Contradiction**：对立特质创造内在张力和记忆点
6. **Maslow's Hierarchy**：用需求层级设计动机冲突

## 必填节（character-forge）

| 节 | 用途 | 设计理念 |
|----|------|----------|
| 标识 | id、姓名、称呼、角色位 | — |
| 年龄与学龄轨迹 | 关键年表节点 | 时间线锚点 |
| 外貌锚点 | 不可漂移视觉特征 | Diagnostic Details |
| 日常习惯 | 写作贴身感 | 行为展示性格 |
| 应激反应与微表情 | 虐/冲突场景 | 压力下的真实反应 |
| **核心创伤（The Wound）** | 过去经历的创伤事件 | 塑造 The Lie 的根源 |
| **错误信念（The Lie）** | 角色相信的关于自己或世界的错误信念 | 驱动行为模式的核心 |
| **外在欲望 vs 内在需求（Want vs Need）** | 分离设计 | 创造内在张力 |
| **核心矛盾（Core Contradiction）** | 对立特质 | 创造深度和记忆点 |
| **需求层级（Maslow Level）** | 当前驱动角色的需求层级 | 设计动机冲突 |
| 真灵与能力 | 引用 rules；**缺陷行为模式** | 能力与缺陷的统一 |
| 欲望 / 恐惧 / 秘密 | 三件套 | 与 Want/Need 互补 |
| 家庭与社会 | 父母、阶层、学校 | 社会背景 |
| 性格基线与暗面 | 基线 + 压力下反差 | Character Contradiction |
| **诊断性细节（Diagnostic Details）** | 具体的感官细节 | 让角色真实可信 |
| 关系网详表 | 边 + 情绪方向 | 社会网络 |
| 声线速查 | 指向 voice-matrix 条目 | 语言风格 |
| 转变预警 | 指向 persona-shifts id | 成长弧预埋 |
| **角色符号系统** | 标志性物件/习惯动作/意象 | 创造核心记忆点 |
| 写作禁忌 | 本书 OOC 补充 | 一致性保护 |

## 新增字段详解

### 核心创伤（The Wound）

过去经历的创伤事件，是塑造角色错误信念（The Lie）的根源。创伤必须：
- 有具体的时间、地点、人物
- 有明确的情感冲击
- 持续影响角色当前的行为模式
- 通过行为展示，而非直接讲述

示例：
```yaml
wound:
  event: 8岁时被最信任的朋友背叛，当众羞辱
  age: 8
  emotional_impact: "从此相信亲近的人终会伤害自己"
  behavioral_pattern: "难以信任他人，习惯性保持距离"
  show_not_tell: "在新环境中总是最后一个分享秘密"
```

### 错误信念（The Lie）

角色相信的关于自己或世界的错误信念，是驱动行为模式的核心。The Lie 必须：
- 由核心创伤塑造
- 看似合理但实际上是错误的
- 驱动角色的外在欲望（Want）
- 在故事中被挑战和动摇

示例：
```yaml
lie:
  statement: "只有强大到无人能敌，才能保护自己不被伤害"
  origin: 来自8岁被背叛的创伤
  manifestation: "不断追求力量，拒绝他人帮助"
  truth_to_learn: "真正的强大来自信任和连接"
```

### 外在欲望 vs 内在需求（Want vs Need）

分离设计创造内在张力：
- **Want（外在欲望）**：角色有意识追求的目标，通常是具体的、可衡量的
- **Need（内在需求）**：角色无意识需要学习的真相，通常是抽象的、关于成长的

示例：
```yaml
want: "成为最强的剑客，打败所有对手"
need: "学会信任同伴，理解真正的力量来自连接"
contradiction: "追求独行侠的道路，却需要同伴才能突破瓶颈"
```

### 核心矛盾（Core Contradiction）

对立特质创造深度和记忆点。矛盾必须：
- 影响选择和行为
- 在场景中可见，而非只在设定中
- 与 Want/Need 相关
- 创造内在张力

示例：
```yaml
core_contradiction:
  trait_a: "极度自信，相信自己能解决任何问题"
  trait_b: "内心深处害怕失败，害怕被证明是无能的"
  manifestation: "在公开场合表现得无所不能，私下却焦虑不安"
  scene_example: "在众人面前自信地接受挑战，独处时却反复检查准备"
```

### 需求层级（Maslow Level）

用马斯洛需求层级设计动机冲突：
- 确定角色当前驱动层级
- 威胁下一层级创造戏剧冲突
- 层级跃迁驱动角色成长

示例：
```yaml
maslow_level:
  current: "esteem" # 尊重需求
  threat: "safety"  # 威胁安全需求
  conflict: "追求事业成功（尊重需求）时，突然面临生存危机（安全需求）"
  growth: "从追求外在认可转向内在价值"
```

### 诊断性细节（Diagnostic Details）

具体的、非制造的感官细节让角色真实可信：
- 独特的习惯动作
- 特定的感官偏好
- 无意识的小动作
- 与背景相关的细节

示例：
```yaml
diagnostic_details:
  - "紧张时会无意识地摩挲左手无名指的旧伤疤"
  - "只喝冰水，即使在冬天，因为童年创伤与热有关"
  - "阅读时会不自觉地用手指在桌上敲出摩斯密码"
  - "闻到茉莉花香会突然沉默，因为那是母亲最喜欢的花"
```

### 角色符号系统

创造核心记忆点的符号化设计：
- **标志性物件**：角色的标志性物品
- **习惯动作**：角色的标志性动作
- **反复意象**：与角色相关的意象

示例：
```yaml
symbolic_system:
  signature_object: "一枚生锈的铜钱，总是挂在脖子上"
  habitual_action: "思考时会下意识地转动铜钱"
  recurring_image: "铜钱的反光映在眼睛里"
  meaning: "铜钱是母亲留下的唯一遗物，代表对过去的执念"
```

## 禁止

- 在 `_template` 写真实书名剧情（仅 example 占位）
- 灵魂卡与 voice-matrix 声线矛盾
- 无 persona-shifts 登记的大幅性格跳变
- **The Lie 直接在正文中讲述**（必须通过行为展示）
- **诊断性细节使用陈词滥调**（必须是具体的、非制造的）

## 相关

- [`character-persona-chain.md`](character-persona-chain.md)
- [`ability-defect-matrix.md`](ability-defect-matrix.md)
- [`character-arcs.yaml`](../../stories/_template/registries/character-arcs.yaml)
