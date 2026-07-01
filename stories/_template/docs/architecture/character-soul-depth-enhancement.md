# 人物灵魂深度增强设计

> **性质**：框架增强设计文档，记录人物灵魂深度相关的所有优化。  
> **日期**：2026-07-01  
> **目标**：让人物变得生动、有灵魂、有核心记忆点，不能是死板的、没有底色的、没有核心记忆点的。

## 设计哲学

基于心理学和叙事理论，我们采用以下设计原则来创造有灵魂、有深度、有核心记忆点的角色：

1. **Want vs Need 分离**：外在欲望（Want）与内在需求（Need）的张力创造深度
2. **The Wound → The Lie**：核心创伤塑造错误信念，错误信念驱动行为模式
3. **Iceberg Principle**：知道的比展示的多 10 倍，用行为展示而非讲述
4. **Diagnostic Details**：具体的、非制造的感官细节让角色真实
5. **Character Contradiction**：对立特质创造内在张力和记忆点
6. **Maslow's Hierarchy**：用需求层级设计动机冲突
7. **Mirror Relationship**：反派是主角的镜像，反映主角可能堕落的方向

## 核心增强内容

### 1. 灵魂卡字段增强

**文件**：`skills/guides/character-soul-card-schema.md`

新增以下必填字段：

| 字段 | 用途 | 设计理念 |
|------|------|----------|
| **核心创伤（The Wound）** | 过去经历的创伤事件 | 塑造 The Lie 的根源 |
| **错误信念（The Lie）** | 角色相信的关于自己或世界的错误信念 | 驱动行为模式的核心 |
| **外在欲望 vs 内在需求（Want vs Need）** | 分离设计 | 创造内在张力 |
| **核心矛盾（Core Contradiction）** | 对立特质 | 创造深度和记忆点 |
| **需求层级（Maslow Level）** | 当前驱动角色的需求层级 | 设计动机冲突 |
| **诊断性细节（Diagnostic Details）** | 具体的感官细节 | 让角色真实可信 |
| **角色符号系统** | 标志性物件/习惯动作/意象 | 创造核心记忆点 |

### 2. 角色弧追踪器

**文件**：`stories/_template/registries/character-arcs.yaml`

新增角色弧追踪器，专门追踪角色的内在转变：

- **弧类型**：正面改变（positive_change）/ 负面堕落（negative_fall）/ 平坦弧（flat）
- **核心心理结构**：The Lie → The Truth → The Wound
- **Want vs Need**：外在欲望与内在需求
- **弧阶段**：无意识自我（unaware_self）→ 反应性自我（reactive_self）→ 整合自我（integrated_self）
- **关键转折点**：The Lie 被测试、The Truth 被瞥见、The Truth 被接受/拒绝

### 3. 角色共鸣点登记册

**文件**：`stories/_template/registries/character-resonance.yaml`

新增角色共鸣点登记册，追踪角色的读者共鸣点：

- **共鸣类型**：共情（empathy）/ 敬佩（admiration）/ 怜悯（pity）/ 恐惧（fear）/ 宣泄（catharsis）/ 认同（recognition）
- **共鸣触发条件**：什么场景会唤起读者的个人记忆
- **具体场景**：角色的行为表现
- **共鸣机制**：为什么读者会共情

### 4. 反派/对手灵魂卡特殊字段

**文件**：`skills/guides/antagonist-soul-card-schema.md`

新增反派/对手角色的特殊字段：

- **镜像关系（Mirror Relationship）**：反派是主角的镜像，反映主角可能堕落的方向
- **扭曲逻辑（Twisted Logic）**：反派行为的自洽逻辑，即使这个逻辑是扭曲的
- **可恨又可理解（Hateable yet Understandable）**：平衡点设计，让反派有深度
- **主题表达（Theme Expression）**：如何通过反派表达主题
- **与主角的对立（Protagonist Opposition）**：具体的对立点，创造戏剧冲突

### 5. 配角灵魂深度最低标准

**文件**：`skills/roles/character-forge/SKILL.md`

新增配角灵魂深度最低标准：

- **Core 角色**：必须完整填写所有心理深度字段
- **Major 角色**：必须填写核心创伤、错误信念、Want vs Need、诊断性细节
- **Minor 角色**：必须填写 Want、诊断性细节
- **反派/对手角色**：必须填写所有心理深度字段 + 反派特殊字段

### 6. 性格转变增强

**文件**：`stories/_template/registries/persona-shifts.yaml`

新增以下字段：

- `linked_character_arc` — 关联的角色弧 ID
- `arc_stage` — 转变发生在哪个弧阶段
- `lie_challenge` — 这个转变如何挑战 The Lie
- `shift_depth` — 转变深度（minor/moderate/major/transformative）
- `shift_direction` — 转变方向（growth/regression/lateral/revelation）
- `resonance_point` — 读者共鸣点

### 7. 叙事引擎增强

**文件**：`skills/guides/story-engine-protocol.md`

新增以下内容：

- **共鸣层**：添加第四层叙事——共鸣层，追踪读者何时与角色共情
- **角色共鸣点关联**：在 story-engine.yaml 中添加 character_resonance_links
- **beats 硬字段**：添加 character_resonance 字段
- **章后检查**：添加共鸣点兑现检查

### 8. 采集题库增强

**文件**：`harness/templates/intake-questions.yaml`

新增以下问题：

- `protagonist_wound` — 主角的核心创伤是什么？
- `protagonist_lie` — 主角相信的错误信念是什么？
- `protagonist_want_vs_need` — 主角的外在欲望和内在需求分别是什么？
- `protagonist_contradiction` — 主角的核心矛盾是什么？

## 文件变更清单

### 新增文件

1. `skills/guides/antagonist-soul-card-schema.md` — 反派/对手灵魂卡字段契约
2. `stories/_template/canon/characters/char-antagonist.example.md` — 反派/对手灵魂卡模板
3. `stories/_template/registries/character-arcs.yaml` — 角色弧追踪器模板
4. `stories/_template/registries/character-resonance.yaml` — 角色共鸣点登记册模板
5. `docs/architecture/character-soul-depth-enhancement.md` — 本文档

### 修改文件

1. `skills/guides/character-soul-card-schema.md` — 增强灵魂卡字段契约
2. `stories/_template/canon/characters/char-protagonist.example.md` — 增强灵魂卡模板
3. `skills/guides/character-persona-chain.md` — 增强人物人格链设计
4. `skills/roles/character-forge/SKILL.md` — 增强 character-forge 规则
5. `skills/roles/persona-voice-binder/SKILL.md` — 增强 persona-voice-binder 规则
6. `skills/roles/persona-evolution-warden/SKILL.md` — 增强 persona-evolution-warden 规则
7. `skills/guides/story-engine-protocol.md` — 增强叙事引擎契约
8. `skills/guides/registry-field-extensions.md` — 增强登记册字段扩展
9. `harness/templates/intake-questions.yaml` — 增强采集题库

## 设计原则

### 1. Show, Don't Tell

所有心理深度字段都必须通过行为展示，而非直接讲述。例如：
- 不要写"他有信任问题"
- 要写"他在新环境中总是最后一个分享秘密"

### 2. Iceberg Principle

知道的比展示的多 10 倍。角色的背景、创伤、秘密等信息，只在需要时展示，让读者感受到深度而不被信息淹没。

### 3. Diagnostic Details

具体的、非制造的感官细节让角色真实可信。例如：
- 不要写"他很紧张"
- 要写"他紧张时会无意识地摩挲左手无名指的旧伤疤"

### 4. Character Contradiction

对立特质创造深度和记忆点。例如：
- "极度自信，相信自己能解决任何问题" vs "内心深处害怕失败，害怕被证明是无能的"

### 5. Mirror Relationship

反派是主角的镜像，反映主角可能堕落的方向。通过对比突出主角的成长。

## 使用指南

### 创建角色时

1. 填写灵魂卡的所有必填字段
2. 确保心理深度字段通过行为展示
3. 为反派/对手填写特殊字段
4. 确保配角达到灵魂深度最低标准

### 设计角色弧时

1. 从灵魂卡的 The Wound 和 The Lie 出发
2. 确定弧类型（正面改变/负面堕落/平坦弧）
3. 设计三个阶段和关键转折点
4. 关联 persona-shifts 和 character-resonance

### 设计共鸣点时

1. 识别共鸣触发条件
2. 设计具体场景
3. 说明共鸣机制
4. 关联角色弧

## 总结

通过以上增强设计，我们为框架添加了完整的角色灵魂深度系统。这个系统基于心理学和叙事理论，旨在创造有灵魂、有深度、有核心记忆点的角色。

核心思想是：
1. **The Wound → The Lie → Want/Need** 的心理结构驱动角色行为
2. **Character Contradiction** 创造内在张力和记忆点
3. **Diagnostic Details** 让角色真实可信
4. **Character Arc** 追踪角色的内在转变
5. **Character Resonance** 创造读者共鸣
6. **Mirror Relationship** 让反派有深度

这些设计原则和工具，将帮助作者创造出生动、有灵魂、有核心记忆点的角色。
