# 开书快速指南（一页纸）

> **目标**：从零开始创建一本新书，完成设定收集，进入写作阶段。

## 前置条件

- Node.js >= 18
- 根项目 `e:/my-project/novel-forge` 可用
- Cursor IDE 打开根项目目录

## 步骤 1：创建书籍目录（在根项目中）

```bash
# 确保在根项目目录
cd e:\my-project\novel-forge

# 复制模板到书籍目录（二选一）
# 方式 A：仓库内
Copy-Item -Recurse stories/_template "stories/{your-id}"

# 方式 B：仓库外（推荐）
Copy-Item -Recurse stories/_template "e:/个人/写书/{your-id}"
```

## 步骤 2：初始化书籍配置

编辑 `novel.yaml`：
```yaml
id: {your-id}
title: {你的书名}
author: {作者名}
genre: {类型}
```

编辑 `seed/author-intent.md`：填写核心幻想、体裁、主角欲望/恐惧/秘密、必含元素、禁忌、篇幅基调。

## 步骤 3：收集设定（在根项目中）

```bash
# 运行 intake 收集设定
pnpm forge intake questions "e:/个人/写书/{your-id}"

# 按提示填写 seed/*.yaml 文件，然后检查
pnpm forge intake check "e:/个人/写书/{your-id}"

# 如果 PASS，继续下一步
# 如果 FAIL，继续填写 seed 文件后重试
```

## 步骤 4：运行 Bootstrap 和 Prose Style

```bash
# 查看下一步应该做什么
pnpm forge next "e:/个人/写书/{your-id}"

# 按照输出激活 Skill，完成后 handoff
pnpm forge handoff complete "e:/个人/写书/{your-id}" --skill seed-intake
pnpm forge handoff complete "e:/个人/写书/{your-id}" --skill novel-bootstrap
pnpm forge handoff complete "e:/个人/写书/{your-id}" --skill prose-style-architect
```

## 步骤 5：完成设定链

```bash
# 继续运行 next，按顺序完成 creation-chain
pnpm forge next "e:/个人/写书/{your-id}"

# creation-chain 顺序：
# orchestrator → seed-intake → bootstrap → prose-style-architect
# → world-architect → character-forge → cast-network-weaver
# → persona-voice-binder → plot-architect → conflict-architect
# → foreshadow-engineer → hook-manager → batch-planner → retention-analyst
```

每步：`forge next` → 激活 Skill → 工作 → `forge handoff complete --skill ...`

## 步骤 6：验收设定完成

```bash
# 检查框架同步
pnpm forge sync framework "e:/个人/写书/{your-id}"

# 验证设定完整性
pnpm forge validate "e:/个人/写书/{your-id}" --strict --task bootstrap
```

验收清单：
- [ ] `seed/intake-status.yaml` → `readiness: ready`
- [ ] `state/phase.yaml` → `phase: outlining` 或 `drafting`
- [ ] `canon/style/prose-profile.yaml` → `status: ready`
- [ ] `canon/INDEX.yaml` 已填充
- [ ] `registries/INDEX.yaml` 已填充

## 步骤 7：切换到子项目独立运行

```bash
# 关闭根项目的 Cursor 会话
# 打开书籍目录的 Cursor 会话
cd e:/个人/写书/{your-id}
cursor .

# 在子项目中运行 CLI
node forge.mjs next .
node forge.mjs doctor . --chapter 1
```

## 后续写作（在子项目中）

```bash
# 每章写作流程
node forge.mjs doctor . --chapter N      # 防雪球体检
node forge.mjs nav build . --chapter N   # 构建上下文计划
node forge.mjs manifest chapter-draft . --chapter N  # 查看 manifest
node forge.mjs context . --chapter N     # 构建上下文
# ... 写章 ...
node forge.mjs review . --chapter N      # 章后 review
node forge.mjs handoff complete . --skill rule-reviewer --chapter N
node forge.mjs phase advance . --chapter N  # 推进到下一章
```

## 关键原则

1. **根项目是母版**：只用于创建项目和迭代框架
2. **子项目独立运行**：创建完成后，直接在子项目中写作
3. **设定先于写作**：必须完成 creation-chain 才能开始写章
4. **防雪球**：每章先 doctor 体检，避免上下文爆炸

## 常见问题

**Q: intake check 失败怎么办？**
A: 检查 `seed/` 目录下的 YAML 文件，确保所有必填字段都已填写并标记 `completed: true`。

**Q: prose-style-architect 需要做什么？**
A: 填写 `canon/style/prose-profile.yaml`，包括 voice、tone、sentence_length、vocabulary 等字段。参考 `canon/style/exemplars/` 中的正负面示例。

**Q: 如何在根项目和子项目之间切换？**
A: 根项目用于创建和设定阶段，子项目用于写作阶段。两者的 Cursor 会话独立，互不干扰。

**Q: 子项目找不到根项目怎么办？**
A: 检查 `.forge-root` 文件是否存在，或设置环境变量 `NOVEL_FORGE_ROOT`。
