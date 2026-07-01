# 单书生命周期管理（Book Lifecycle）

> **目的**：规范单本书从创建到归档的完整生命周期管理。  
> **原则**：每本书都是独立实体，根项目是万能的母版。

## 一、生命周期阶段

```
创建 → 开发中 → 暂停 → 恢复 → 完成 → 归档
```

### 1.1 创建（Creation）

```bash
# 复制模板
cp -r stories/_template "e:/个人/写书/{novel-id}"

# 或在根项目内
cp -r stories/_template stories/{novel-id}

# 编辑 novel.yaml 设置 id 和 title
# 开始 intake 流程
pnpm forge intake questions "e:/个人/写书/{novel-id}"
```

### 1.2 开发中（Active）

**状态标识**：`state/phase.yaml` 中 `status: active`

**日常操作**：
```bash
# 新会话开始
cd e:\my-project\novel-forge
pnpm forge relay refresh "e:/个人/写书/{novel-id}"
pnpm forge next "e:/个人/写书/{novel-id}"

# 写章
pnpm forge doctor "e:/个人/写书/{novel-id}" --chapter N
pnpm forge manifest chapter-draft "e:/个人/写书/{novel-id}" --chapter N
# ... 执行 chapter-cycle ...

# 章后维护
pnpm forge manifest post-chapter "e:/个人/写书/{novel-id}" --chapter N
```

### 1.3 暂停（Pause）

**触发条件**：
- 作者主动暂停（转写其他书）
- 需要长时间收集素材
- 其他优先事项

**操作**：
1. 确保当前章已完成完整章后链
2. 运行最终健康检查：
   ```bash
   pnpm forge doctor "e:/个人/写书/{novel-id}" --chapter N
   ```
3. 在 `novel.yaml` 中标记：
   ```yaml
   status: paused
   paused_at: "2026-06-23"
   pause_reason: "转写其他书"
   ```

### 1.4 恢复（Resume）

**操作**：
1. 更新 `novel.yaml`：
   ```yaml
   status: active
   ```
2. 同步框架（可能有更新）：
   ```bash
   pnpm forge sync framework "e:/个人/写书/{novel-id}"
   ```
3. 重建 INDEX（确保新鲜）：
   ```bash
   pnpm forge nav rebuild "e:/个人/写书/{novel-id}"
   ```
4. 健康检查：
   ```bash
   pnpm forge doctor "e:/个人/写书/{novel-id}" --chapter N
   ```
5. 读取 `session-relay.md` 了解上次状态

### 1.5 完成（Complete）

**触发条件**：所有计划章节完成，进入 publish 阶段

**操作**：
1. 运行最终 review：
   ```bash
   pnpm forge review "e:/个人/写书/{novel-id}" --chapter N
   ```
2. 在 `novel.yaml` 中标记：
   ```yaml
   status: completed
   completed_at: "2026-06-23"
   ```

### 1.6 归档（Archive）

**触发条件**：书已完成或废弃

**操作**：
1. 清理临时文件：
   ```bash
   rm -rf "e:/个人/写书/{novel-id}/state/working/"
   ```
2. 在 `novel.yaml` 中标记：
   ```yaml
   status: archived
   archived_at: "2026-06-23"
   ```
3. 可选：压缩为 zip 归档

## 二、多书并行管理

### 2.1 活跃书限制

**建议**：同时活跃的书不超过 2 本

**原因**：
- 上下文切换成本高
- INDEX 维护需要持续关注
- 手稿质量需要连贯性

### 2.2 书间隔离

**原则**：
- 每本书的 canon、registries、state 完全独立
- 不要在一本书中引用另一本书的内容
- 根项目框架代码是共享的，但书籍数据是隔离的

## 三、状态查询

### 3.1 查看单书状态

```bash
# 查看当前阶段
cat "e:/个人/写书/{novel-id}/state/phase.yaml"

# 查看健康状态
pnpm forge doctor "e:/个人/写书/{novel-id}" --chapter N

# 查看应该执行的 Skill
pnpm forge next "e:/个人/写书/{novel-id}"
```

### 3.2 查看所有书状态

```bash
# 列出所有书目录
ls "e:/个人/写书/"

# 查看每本书的 phase
for dir in "e:/个人/写书"/*/; do
  echo "=== $(basename $dir) ==="
  cat "$dir/state/phase.yaml" 2>/dev/null || echo "无 phase.yaml"
done
```

## 四、与现有文档的关系

- [`root-project-protection.md`](root-project-protection.md)：根项目保护规范
- [`book-framework-sync.md`](book-framework-sync.md)：单书跟框架同步
- [`first-run-checklist.md`](first-run-checklist.md)：首跑清单
- [`error-recovery-guide.md`](error-recovery-guide.md)：错误恢复指南