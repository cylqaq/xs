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
└── novel.yaml      # 本书元数据
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

### 4.1 开始新书
```bash
# 1. 在根项目目录启动
cd e:\my-project\novel-forge

# 2. 复制模板到书籍目录
cp -r stories/_template "e:/个人/写书/{novel-id}"

# 3. 在书籍目录中开始创作
pnpm forge intake questions "e:/个人/写书/{novel-id}"
```

### 4.2 日常创作
```bash
# 1. 始终在根项目目录启动
cd e:\my-project\novel-forge

# 2. 使用绝对路径指向书籍目录
pnpm forge doctor "e:/个人/写书/{novel-id}" --chapter N
pnpm forge manifest chapter-draft "e:/个人/写书/{novel-id}" --chapter N

# 3. 在 Cursor 中工作时，确保工作区是根项目
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

### 7.1 正确示例
```bash
# 在根项目目录启动，使用绝对路径指向书籍目录
cd e:\my-project\novel-forge
pnpm forge doctor "e:/个人/写书/dungeon-echo" --chapter 1
```

### 7.2 错误示例
```bash
# 错误：在书籍目录启动
cd "e:/个人/写书/dungeon-echo"
pnpm forge doctor . --chapter 1

# 错误：在根项目下创建书籍文件
cd e:\my-project\novel-forge
mkdir stories/my-novel  # 应该在 e:/个人/写书/ 下创建
```

**记住**：根项目是母版，书籍项目是实例。保持分离，避免污染。