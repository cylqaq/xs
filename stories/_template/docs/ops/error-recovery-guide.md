# 错误恢复指南（Error Recovery Guide）

> **目的**：当流程卡住、手稿写坏、INDEX 损坏时的系统化恢复路径。  
> **原则**：先诊断，再恢复；审计优先于覆盖。

## 一、常见故障与恢复路径

### 1.1 review 连续 3 轮 FAIL → blocked

**症状**：`state/phase.yaml` 中 `blocked: true`

**恢复步骤**：
1. 读 `state/reviews/ch-{NNN}.json` 最后一次 review 的 `action_items`
2. 手动修复手稿中的问题（根据 `delegate_skill` 指示）
3. 清除 blocked 状态：
   ```bash
   # 在 phase.yaml 中设置
   blocked: false
   review_round: 0
   block_reason: ""
   ```
4. 重新运行 review：
   ```bash
   pnpm forge review stories/{id} --chapter N
   ```

**预防**：每轮 review 后认真修复 `action_items`，不要跳过。

### 1.2 INDEX 过期/损坏

**症状**：`forge doctor` 报 `circuit_state: yellow/red` 或 INDEX 文件内容为空

**恢复步骤**：
1. 重建 INDEX 三件套：
   ```bash
   pnpm forge nav rebuild stories/{id}
   ```
2. 验证：
   ```bash
   pnpm forge doctor stories/{id} --chapter N
   ```
3. 如果仍然异常，手动检查 `canon/characters/index.yaml`、`registries/*.yaml` 是否完整

### 1.3 上下文超预算（circuit_state: red）

**症状**：`forge doctor` 报 `circuit_state: red`

**恢复步骤**：
1. 查看预算详情：
   ```bash
   pnpm forge budget stories/{id} --chapter N
   ```
2. 归档过期内容：
   - 归档 `last_seen` 超过 30 章的角色到 `canon/characters/archived/`
   - 合并旧的 `chapter-summaries` 到 `summary-rolling.md`
3. 重建 INDEX：
   ```bash
   pnpm forge nav rebuild stories/{id}
   ```

### 1.4 章节手稿写坏（逻辑矛盾/角色 OOC）

**症状**：review 通过但内容有严重问题

**恢复步骤**：
1. 备份当前手稿：
   ```bash
   cp manuscripts/chapters/ch-{NNN}.md manuscripts/chapters/ch-{NNN}.bak.md
   ```
2. 从 beats 重写：
   ```bash
   pnpm forge manifest chapter-draft stories/{id} --chapter N
   # 重新运行 chapter-production
   ```
3. 章后必须重新运行完整章后链

### 1.5 handoff 文件损坏/丢失

**症状**：`forge next` 报 handoff 依赖缺失

**恢复步骤**：
1. 检查 `state/working/handoffs/` 目录
2. 删除损坏的 handoff 文件
3. 重新运行该步：
   ```bash
   pnpm forge next stories/{id}
   # 按指示重新执行该 Skill
   ```

## 二、紧急恢复命令

```bash
# 查看当前状态
pnpm forge doctor stories/{id} --chapter N

# 重建 INDEX
pnpm forge nav rebuild stories/{id}

# 同步框架脚手架
pnpm forge sync framework stories/{id}

# 查看当前应该执行的 Skill
pnpm forge next stories/{id}

# 查看 handoff 状态
pnpm forge handoff status stories/{id}
```

## 三、预防措施

1. **每章完成后**：运行 `forge doctor` 确认健康状态
2. **新会话开始时**：先读 `session-relay.md` 了解上次状态
3. **大规模修改前**：手动备份关键文件
4. **定期**：运行 `pnpm forge sync framework` 确保脚手架完整

## 四、与现有文档的关系

- [`first-run-checklist.md`](first-run-checklist.md)：首跑清单
- [`book-framework-sync.md`](book-framework-sync.md)：单书跟框架
- [`harness-integrity-iteration.md`](harness-integrity-iteration.md)：生产完整性迭代
- [`context-budget-system.md`](../architecture/context-budget-system.md)：上下文预算系统