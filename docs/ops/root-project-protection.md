# 根项目保护规范（Root Project Protection）

> **核心原则**：根项目是万能的母版，用于指导和生产任何新的书籍项目。只有在明确需要迭代根项目能力时才操作根项目代码文件。

## 一、根项目的定义与职责

### 1.1 根项目是什么
- **路径**：`e:\my-project\novel-forge`
- **性质**：框架母版，包含所有 Skill、工作流、CLI 工具、文档模板
- **职责**：提供统一的创作框架，指导和生产任何新的书籍项目

### 1.2 根项目不是什么
- **不是**具体书籍的存储位置
- **不是**单本书的创作环境
- **不是**临时文件的存放处

### 1.3 根项目的核心定位
根项目是**母版**，用于：
1. **启动新项目**：从模板创建新的书籍项目
2. **完善设定**：在创建子项目前收集和整理设定
3. **框架迭代**：更新 Skill、工作流、CLI 工具
4. **文档维护**：更新框架文档和模板

**子项目一旦创建完成，后续写作应直接在子项目中进行，不再染指根项目。**

## 二、书籍项目的正确位置

### 2.1 书籍项目路径
- **推荐路径**：`e:/个人/写书/{novel-id}/`
- **示例**：
  - `e:/个人/写书/dungeon-echo/`
  - `e:/个人/写书/zhouyuan-jie/`

### 2.2 书籍项目结构
每个书籍项目应包含：
```
{novel-id}/
├── canon/          # 设定、人物、世界观
├── harness/        # 本书覆盖层（read-order.md 等）
├── manuscripts/    # 正文手稿
├── registries/     # 登记册（伏笔、钩子等）
├── state/          # 状态文件（memory、phase.yaml 等）
├── seed/           # 初始种子文件
├── AGENTS.md       # 本书 Agent 入口
├── novel.yaml      # 本书元数据
├── forge.mjs       # CLI Wrapper（可独立运行）
└── .forge-root     # 根项目路径配置
```

## 三、根项目保护规则

### 3.1 禁止的操作
1. **禁止**在根项目目录下创建具体书籍的文件
2. **禁止**将书籍的 canon、manuscripts、registries 等目录放在根项目下
3. **禁止**修改根项目的 `stories/_template/` 作为正式创作（应复制为新 id）
4. **禁止**在根项目下运行书籍特定的 CLI 命令（应使用绝对路径指向书籍目录）

### 3.2 允许的操作
1. **允许**在根项目下运行框架级 CLI 命令（如 `pnpm forge workflow validate`）
2. **允许**更新根项目的 Skill、工作流、文档（明确需要迭代根项目能力时）
3. **允许**修改 `stories/_template/` 以更新模板结构
4. **允许**在根项目下运行书籍命令，但必须使用绝对路径指向书籍目录

## 四、正确的工作流程

### 4.1 开始新书（在根项目中）
```bash
# 1. 在根项目目录启动
cd e:\my-project\novel-forge

# 2. 复制模板到书籍目录
cp -r stories/_template "e:/个人/写书/{novel-id}"

# 3. 在书籍目录中开始设定收集
pnpm forge intake questions "e:/个人/写书/{novel-id}"

# 4. 完善设定，直到 intake check PASS
pnpm forge intake check "e:/个人/写书/{novel-id}"

# 5. 运行 bootstrap 和 prose-style
pnpm forge next "e:/个人/写书/{novel-id}"
```

### 4.2 日常创作（在子项目中）
```bash
# 1. 直接在书籍目录启动
cd e:/个人/写书/{novel-id}

# 2. 使用本地 forge.mjs 执行命令
node forge.mjs doctor . --chapter N
node forge.mjs manifest chapter-draft . --chapter N
node forge.mjs next .

# 3. 在 Cursor 中工作时，确保工作区是书籍目录
```

### 4.3 迭代根项目能力
当需要增强框架功能时：
1. **明确需求**：确定需要增强的具体能力
2. **更新根项目**：修改 Skill、工作流、文档等
3. **测试验证**：使用 `pnpm smoke:all` 验证
4. **同步子项目**：更新所有书籍项目的相关文档

## 五、违规处理

### 5.1 发现违规操作时
1. **立即停止**：停止在根项目下的违规操作
2. **清理文件**：删除或移动违规创建的文件
3. **正确迁移**：将文件移动到正确的书籍目录
4. **更新文档**：确保相关文档指向正确位置

### 5.2 预防措施
1. **启动检查**：新会话启动时检查当前目录
2. **路径验证**：CLI 命令使用绝对路径时验证路径正确性
3. **定期审查**：定期检查根项目目录是否有违规文件

## 六、与现有文档的关系

本文档补充而非替代以下文档：
- [`AGENTS.md`](../../AGENTS.md)：框架铁律
- [`first-run-checklist.md`](first-run-checklist.md)：首跑清单
- [`book-framework-sync.md`](book-framework-sync.md)：单书跟框架

## 七、示例

### 7.1 正确示例：新书创建（在根项目中）
```bash
# 在根项目目录启动，创建新书
cd e:\my-project\novel-forge
cp -r stories/_template "e:/个人/写书/my-new-novel"
pnpm forge intake questions "e:/个人/写书/my-new-novel"
```

### 7.2 正确示例：日常写作（在子项目中）
```bash
# 直接在书籍目录启动，使用本地 forge.mjs
cd e:/个人/写书/dungeon-echo
node forge.mjs doctor . --chapter 1
node forge.mjs next .
```

### 7.3 错误示例
```bash
# 错误：在根项目下创建书籍文件
cd e:\my-project\novel-forge
mkdir stories/my-novel  # 应该在 e:/个人/写书/ 下创建

# 错误：在根项目下运行书籍命令（不使用绝对路径）
cd e:\my-project\novel-forge
pnpm forge doctor . --chapter 1  # 应该使用绝对路径
```

## 八、子项目独立运行说明

### 8.1 forge.mjs Wrapper
每个子项目都包含一个 `forge.mjs` wrapper 脚本，用于：
- 自动找到根项目的位置
- 将 `.` 或相对路径转换为绝对路径
- 委托根项目的 CLI 执行命令

### 8.2 .forge-root 配置
每个子项目都包含一个 `.forge-root` 文件，用于：
- 指定根项目的路径
- 支持环境变量覆盖（`NOVEL_FORGE_ROOT`）
- 支持默认路径回退

### 8.3 独立运行的好处
1. **隔离性**：子项目不会污染根项目
2. **便携性**：子项目可以移动到任何位置
3. **独立性**：子项目可以在不同的 Cursor 会话中独立运行
4. **清晰性**：每个项目都有明确的边界

**记住**：根项目是母版，书籍项目是实例。创建完成后，子项目应独立运行，不再依赖根项目的会话。
