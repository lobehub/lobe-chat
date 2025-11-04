# Chat 页面 BDD 测试

本目录包含 Chat 页面的 BDD（行为驱动开发）测试用例，使用 Gherkin 语法编写，全部采用中文描述。

## 测试文件结构

### Feature 文件（测试场景）

1. **smoke.feature** - 冒烟测试 (P0)
   - 加载聊天主页
   - 加载会话列表
   - 加载输入框
   - 加载默认助手会话

2. **session-management.feature** - 会话管理 (P1)
   - 创建 / 删除 / 重命名 / 复制会话
   - 会话切换
   - 会话分组功能
   - 会话搜索
   - 置顶 / 取消置顶
   - 收件箱功能

3. **message-interactions.feature** - 消息交互 (P0/P1)
   - 发送 / 接收消息
   - 重新生成消息
   - 编辑 / 删除 / 复制消息
   - 停止生成
   - 查看消息详情和 Token 统计
   - 消息跳转和导航

4. **chat-input.feature** - 输入功能 (P1)
   - 文本输入和多行输入
   - 文件上传（图片、PDF 等）
   - @提及功能
   - Slash 命令
   - 语音输入 (STT)
   - 输入框工具栏操作

5. **group-chat.feature** - Agent 团队聊天 (P1)
   - 创建 / 管理 Agent 团队
   - 成员添加 / 移除
   - 主持人功能
   - 群组消息和 @提及
   - 私信功能

6. **topic-thread.feature** - 话题 / 子话题 (P1)
   - 创建 / 切换 / 删除话题
   - 子话题 (Thread) 功能
   - 话题列表显示
   - 话题搜索

7. **knowledge-base.feature** - 知识库 (P1)
   - 关联 / 移除知识库
   - 关联 / 移除文件
   - 文件上传
   - 查看 RAG 引用源

8. **model-settings.feature** - 模型设置 (P1)
   - 切换模型
   - 调整模型参数
   - 开启 / 关闭上下文缓存
   - 开启 / 关闭深度思考
   - 历史消息数设置
   - 查看定价和 Token 详情

9. **agent-settings.feature** - 助手设置 (P1)
   - 进入 / 退出设置页面
   - 修改助手基础信息
   - 设置系统提示词
   - 配置模型和参数
   - 添加工具和插件
   - 关联知识库
   - 提交助手到市场

## Steps 文件（测试步骤实现）

位于 `e2e/src/steps/chat/` 目录：

- **common.steps.ts** - 通用步骤定义（导航、断言等）
- **smoke.steps.ts** - 冒烟测试步骤实现
- **message-interactions.steps.ts** - 消息交互步骤实现（示例）
- _其他 steps 文件待补充_

## 优先级标签

- `@P0` - 最高优先级，核心功能，必须通过
- `@P1` - 高优先级，重要功能
- `@P2` - 中等优先级，次要功能

## 场景 ID 格式

每个场景都有唯一的 ID，格式为：`@CHAT-<模块>-<序号>`

例如：

- `@CHAT-SMOKE-001` - 冒烟测试第 1 个场景
- `@CHAT-MESSAGE-001` - 消息交互第 1 个场景
- `@CHAT-GROUP-001` - 群组聊天第 1 个场景

## 运行测试

```bash
# 运行所有 chat 测试
npm run test:e2e -- --tags "@chat"

# 运行特定模块测试
npm run test:e2e -- --tags "@chat and @smoke"
npm run test:e2e -- --tags "@chat and @message"

# 运行特定优先级测试
npm run test:e2e -- --tags "@chat and @P0"

# 运行特定场景
npm run test:e2e -- --tags "@CHAT-SMOKE-001"
```

## 注意事项

1. 所有场景描述使用中文，便于团队理解
2. 遵循 Given-When-Then 格式
3. 每个 feature 文件包含相关功能的所有测试场景
4. Steps 实现使用 Playwright 的 Page Object 模式
5. 超时时间统一设置为 120 秒，适应不同环境
6. 优先使用 data-testid 选择器，其次使用语义化选择器
7. 部分 steps 文件需要根据实际开发进度补充完善

## 待补充

以下 steps 文件需要根据实际测试需求补充：

- session-management.steps.ts
- chat-input.steps.ts
- group-chat.steps.ts
- topic-thread.steps.ts
- knowledge-base.steps.ts
- model-settings.steps.ts
- agent-settings.steps.ts
