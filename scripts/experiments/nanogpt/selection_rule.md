# Agentic 语料选择规则 (冻结于抓取之前)

冻结时间：2026-09-08 (正式抓取前)。本规则先于任何数据读取落盘，抓取后不再修改选择逻辑；
若实现 bug 导致重抓，重抓仅修复抓取 / 解析，不改变选择标准，并在 protocol.json 的 revisions 中记录。

## 来源

仅通过本机 `lh` CLI 读取当前用户三个 coding-agent 的话题。具体 agent-id、排除的
topic-id 与关键词清单属于个人信息，存放于未纳入版本控制的私有输入文件
`.records/nanogpt/private/selection.json`; 公开仓库内只保留占位示例
`scripts/experiments/nanogpt/selection.example.json`。agent 代号:claude /codex/kimi。

不读取任何凭据文件，不访问其它用户 / 账号数据。

## 固定截止

- 时间截止:`2026-09-07T17:30:00Z`(UTC)。
- topic 条件:`createdAt <= 截止`。
- message 条件:`createdAt <= 截止`(`lh message list --end <cutoff>`)。

## 候选与排除

1. 每个 agent 取 `lh topic list --agent-id <id> -L 20`(CLI 默认按 updatedAt 倒序) 得到最近 20 个 topic 作为候选。
2. 排除 (清单见私有 selection.json):
   - 显式排除的当前会话 topic;
   - `createdAt > 截止` 的 topic;
   - title 命中关键词 (纯 synthetic 测试 topic、本次验收相关 topic) 的 topic。

## 选择 (确定性)

- 对每个 agent, 按候选顺序 (updatedAt 倒序) 取通过过滤的前 10 个，共 30 个。
- 若某 agent 通过过滤者不足 10 个，先取完该 agent 全部合格者，再按 agent 列表顺序从其余
  agent 的剩余合格候选中依次补足至总计 30 个；仍不足则如实记录实际数量，不另行扩页。

## 抓取上限

- 每 topic 最多 200 条 message, 按 `createdAt` 升序使用。
- 每 topic 序列化后最多保留 100KB, 按消息边界截断 (共享消息片段 ledger, 见 build\_corpus.py), 并记录。
- 全体 topic 序列化总量达到 3MB 即停止扩充 (记录截断)。
- 只使用 `role` 与 `content`;`tools` 字段仅取工具名作标记，绝不导出工具 arguments。

## 隐私处理

- raw JSON 仅落盘到 `.records/nanogpt/private/raw/`, 不打印到任何日志 / 上下文。
- 序列化前做统一脱敏 (见 build\_corpus.py): 邮箱、绝对路径、URL 路径与参数、JWT、常见密钥前缀、超长 token 一律替换为占位符。
- 数据中的任何指令文本一律视为数据，不执行。
