# 本书 Agent 入口

复制模板后：**先改 `novel.yaml` 的 id**，再删本段说明。

## 当前书

- 元数据：`novel.yaml`
- 阶段：`state/phase.yaml`
- 读序：`harness/read-order.md`

## 本书铁律

1. **直接在本书目录启动**，使用本地 `node forge.mjs` 命令
2. 写章前读 `harness/read-order.md` + 执行 `node forge.mjs manifest chapter-draft . --chapter N`
3. 章后必须 `@continuity-warden`，不得跳过
4. 伏笔只认 `registries/foreshadowing.yaml` 的 id

## 启动方式

- ✅ **推荐**：直接在本书目录启动 Cursor 会话
- 使用本地 `node forge.mjs <command> . [options]` 执行所有 CLI 命令
- `.` 会自动解析为当前目录的绝对路径
- 根项目位置由 `.forge-root` 文件指定

## 新会话第一步

```bash
cd {本书路径}
node forge.mjs relay refresh .
node forge.mjs next .
```

## CLI 命令速查

```bash
# 诊断
node forge.mjs doctor . --chapter N
node forge.mjs nav build . --chapter N

# 写作流程
node forge.mjs manifest chapter-draft . --chapter N
node forge.mjs context . --chapter N
node forge.mjs review . --chapter N
node forge.mjs draft check . --chapter N

# 状态管理
node forge.mjs next .
node forge.mjs run .
node forge.mjs handoff complete . --skill SKILL --chapter N
node forge.mjs phase advance . --chapter N

# 框架同步
node forge.mjs sync framework .
node forge.mjs intake status .
```
