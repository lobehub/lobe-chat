# AgentRuntime 实现详解

## 概述

`AgentRuntime` 是一个事件驱动的智能体执行引擎，负责执行来自 `Agent`（大脑）的指令。它采用了简化的 Plan -> Execute 循环模式，支持流式 LLM 调用、工具执行和人机交互。

## 核心架构

### 设计原则

1. **事件驱动**: 所有操作都产生事件，通过事件历史来追踪状态变化
2. **执行器模式**: 每种指令类型都有对应的执行器，支持自定义扩展
3. **优先级系统**: Agent > Config > Built-in 的执行器优先级
4. **流式支持**: 原生支持流式 LLM 响应和实时事件推送

### 类型系统

```typescript
// 核心接口
interface Agent {
  executors?: Partial<Record<AgentInstruction['type'], any>>;
  runner(state: AgentState): Promise<AgentInstruction>;
  tools?: ToolRegistry;
}

// 运行时配置
interface RuntimeConfig {
  executors?: Partial<Record<AgentInstruction['type'], InstructionExecutor>>;
  modelRuntime?: (payload: unknown) => AsyncIterable<any>;
}

// 指令执行器
type InstructionExecutor = (
  instruction: AgentInstruction,
  state: AgentState,
) => Promise<{ events: AgentEvent[]; newState: AgentState }>;
```

## 核心组件

### 1. 构造器和执行器优先级

```typescript
constructor(private agent: Agent, private config: RuntimeConfig = {}) {
  // 构建执行器，优先级：agent.executors > config.executors > built-in
  this.executors = {
    // 内置执行器
    call_llm: this.createCallLLMExecutor(),
    call_tool: this.createCallToolExecutor(),
    finish: this.createFinishExecutor(),
    request_human_approve: this.createHumanApproveExecutor(),
    request_human_prompt: this.createHumanPromptExecutor(),
    request_human_select: this.createHumanSelectExecutor(),
    // 配置执行器覆盖内置
    ...config.executors,
    // Agent 执行器具有最高优先级
    ...(agent.executors as any),
  };
}
```

**测试验证**:

- ✅ 默认使用内置执行器
- ✅ 配置执行器可以覆盖内置执行器
- ✅ Agent 执行器具有最高优先级

### 2. 步骤执行方法

```typescript
async step(
  state: AgentState,
  approvedToolCall?: ToolsCalling,
): Promise<{ events: AgentEvent[]; newState: AgentState }> {
  try {
    let result: { events: AgentEvent[]; newState: AgentState };

    // 直接工具执行（用于已批准的人机交互调用）
    if (approvedToolCall) {
      result = await this.executors.call_tool(
        { toolCall: approvedToolCall, type: 'call_tool' },
        state,
      );
    } else {
      // 标准流程：计划 -> 执行
      const instruction = await this.agent.runner(state);
      result = await this.executors[instruction.type](instruction, state);
    }

    // 将事件累积到状态历史中
    result.newState.events = [...result.newState.events, ...result.events];
    return result;
  } catch (error) {
    return this.createErrorResult(state, error);
  }
}
```

**执行流程**:

1. **工具直接执行**: 如果提供了 `approvedToolCall`，直接执行工具调用
2. **标准流程**: Agent.runner 生成指令 → 对应执行器执行指令
3. **事件累积**: 将执行产生的事件添加到状态历史中
4. **错误处理**: 捕获异常并生成错误事件

### 3. 状态创建

```typescript
static createInitialState(partialState: Partial<AgentState> & { sessionId: string }): AgentState {
  const now = new Date().toISOString();

  return {
    // 默认值
    createdAt: now,
    events: [],
    lastModified: now,
    messages: [],
    status: 'idle',
    // 用户提供的值覆盖默认值
    ...partialState,
  };
}
```

**特性**:

- 灵活的部分状态初始化
- 自动设置时间戳
- 必须提供 `sessionId`

## 内置执行器详解

### 1. LLM 调用执行器

```typescript
private createCallLLMExecutor(): InstructionExecutor {
  return async (instruction, state) => {
    const { payload } = instruction;
    const newState = structuredClone(state);
    const events: AgentEvent[] = [];

    // 设置运行状态
    newState.status = 'running';
    newState.lastModified = new Date().toISOString();

    events.push({ payload, type: 'llm_start' });

    if (!this.config.modelRuntime) {
      throw new Error('LLM provider is required for call_llm instruction');
    }

    let assistantContent = '';
    let toolCalls: ToolsCalling[] = [];

    try {
      // 流式 LLM 响应
      for await (const chunk of this.config.modelRuntime(payload)) {
        events.push({ chunk, type: 'llm_stream' });

        // 从块中累积内容和工具调用
        if (chunk.content) {
          assistantContent += chunk.content;
        }
        if (chunk.tool_calls) {
          toolCalls = chunk.tool_calls;
        }
      }

      events.push({
        result: { content: assistantContent, tool_calls: toolCalls },
        type: 'llm_result',
      });

      return { events, newState };
    } catch (error) {
      return this.createErrorResult(state, error);
    }
  };
}
```

**关键特性**:

- ✅ **流式支持**: 实时产生 `llm_stream` 事件
- ✅ **内容累积**: 自动合并流式响应的内容
- ✅ **工具调用支持**: 处理 LLM 返回的工具调用
- ✅ **错误处理**: 优雅处理 LLM 调用失败

**测试覆盖**:

- 要求 modelRuntime 配置
- 流式响应处理
- 工具调用响应处理

### 2. 工具调用执行器

```typescript
private createCallToolExecutor(): InstructionExecutor {
  return async (instruction, state) => {
    const { toolCall } = instruction;
    const newState = structuredClone(state);
    const events: AgentEvent[] = [];

    newState.lastModified = new Date().toISOString();
    newState.status = 'running';

    const tools = this.agent.tools || ({} as ToolRegistry);
    const toolName = toolCall.function.name;

    if (!(toolName in tools)) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    try {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await tools[toolName](args);

      events.push({
        id: toolCall.id,
        result,
        type: 'tool_result',
      });

      // 添加工具消息到状态
      newState.messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });

      return { events, newState };
    } catch (error) {
      return this.createErrorResult(state, error);
    }
  };
}
```

**特性**:

- ✅ **工具注册表**: 从 Agent.tools 获取可用工具
- ✅ **参数解析**: 自动解析 JSON 参数
- ✅ **结果处理**: 生成工具结果事件并添加工具消息
- ✅ **错误处理**: 处理工具不存在和执行错误

### 3. 人机交互执行器

#### Human Approve 执行器

```typescript
private createHumanApproveExecutor(): InstructionExecutor {
  return async (instruction, state) => {
    const { pendingToolsCalling } = instruction;
    const newState = structuredClone(state);

    newState.lastModified = new Date().toISOString();
    newState.status = 'waiting_for_human_input';
    newState.pendingToolsCalling = pendingToolsCalling;

    const events: AgentEvent[] = [
      {
        pendingToolsCalling,
        sessionId: newState.sessionId,
        type: 'human_approve_required',
      },
      { toolCalls: pendingToolsCalling, type: 'tool_pending' },
    ];

    return { events, newState };
  };
}
```

#### Human Prompt 执行器

```typescript
private createHumanPromptExecutor(): InstructionExecutor {
  return async (instruction, state) => {
    const { metadata, prompt } = instruction;
    const newState = structuredClone(state);

    newState.lastModified = new Date().toISOString();
    newState.status = 'waiting_for_human_input';
    newState.pendingHumanPrompt = { metadata, prompt };

    const events: AgentEvent[] = [
      {
        metadata,
        prompt,
        sessionId: newState.sessionId,
        type: 'human_prompt_required',
      },
    ];

    return { events, newState };
  };
}
```

#### Human Select 执行器

```typescript
private createHumanSelectExecutor(): InstructionExecutor {
  return async (instruction, state) => {
    const { metadata, multi, options, prompt } = instruction;
    const newState = structuredClone(state);

    newState.lastModified = new Date().toISOString();
    newState.status = 'waiting_for_human_input';
    newState.pendingHumanSelect = { metadata, multi, options, prompt };

    const events: AgentEvent[] = [
      {
        metadata,
        multi,
        options,
        prompt,
        sessionId: newState.sessionId,
        type: 'human_select_required',
      },
    ];

    return { events, newState };
  };
}
```

**人机交互特性**:

- ✅ **状态管理**: 设置 `waiting_for_human_input` 状态
- ✅ **会话关联**: 事件包含 `sessionId`
- ✅ **待处理数据**: 在状态中保存待处理的交互数据
- ✅ **多种交互类型**: 支持批准、提示输入、选择等

### 4. 完成执行器

```typescript
private createFinishExecutor(): InstructionExecutor {
  return async (instruction, state) => {
    const newState = structuredClone(state);

    newState.lastModified = new Date().toISOString();
    newState.status = 'done';

    const events: AgentEvent[] = [{ finalState: newState, type: 'done' }];
    return { events, newState };
  };
}
```

**特性**:

- ✅ **状态终结**: 设置 `done` 状态
- ✅ **最终状态**: 在事件中包含最终状态快照

## 事件系统

### 事件类型

```typescript
type AgentEvent =
  | AgentEventInit // 初始化
  | AgentEventLlmStart // LLM 开始
  | AgentEventLlmStream // LLM 流式响应
  | AgentEventLlmResult // LLM 结果
  | AgentEventToolPending // 工具待处理
  | AgentEventToolResult // 工具结果
  | AgentEventHumanApproveRequired // 需要人工批准
  | AgentEventHumanPromptRequired // 需要人工输入
  | AgentEventHumanSelectRequired // 需要人工选择
  | AgentEventDone // 完成
  | AgentEventError; // 错误
```

### 事件流示例

```typescript
// 1. 用户提问
const state = AgentRuntime.createInitialState({
  sessionId: 'session-123',
  messages: [{ role: 'user', content: "What's the weather?" }],
});

// 2. 执行步骤 - LLM 调用
let result = await runtime.step(state);
// 产生事件: llm_start, llm_stream..., llm_result

// 3. 处理 LLM 结果中的工具调用
result = await runtime.step(result.newState);
// 产生事件: human_approve_required, tool_pending

// 4. 人工批准后执行工具
const toolCall = result.newState.pendingToolsCalling[0];
result = await runtime.step(result.newState, toolCall);
// 产生事件: tool_result

// 5. 最终响应
result = await runtime.step(result.newState);
// 产生事件: llm_start, llm_stream..., llm_result, done
```

## 完整对话流程

基于测试用例的完整对话流程示例：

```typescript
async function completeConversationFlow() {
  // 1. 初始化
  const agent = new MockAgent();
  agent.tools = {
    get_weather: async ({ city }) => ({
      temperature: 25,
      condition: 'sunny',
    }),
  };

  const runtime = new AgentRuntime(agent, {
    modelRuntime: async function* (payload) {
      const messages = payload.messages;
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.role === 'user') {
        yield { content: "I'll check the weather for you." };
        yield {
          tool_calls: [
            {
              id: 'call_weather',
              type: 'function',
              function: {
                name: 'get_weather',
                arguments: '{"city": "Beijing"}',
              },
            },
          ],
        };
      } else if (lastMessage.role === 'tool') {
        yield { content: 'The weather in Beijing is 25°C and sunny.' };
      }
    },
  });

  // 2. 用户提问
  let state = AgentRuntime.createInitialState({
    sessionId: 'test-session',
    messages: [{ role: 'user', content: "What's the weather in Beijing?" }],
  });

  // 3. LLM 处理用户问题
  let result = await runtime.step(state);
  // 事件: llm_start, llm_stream, llm_result (包含工具调用)

  // 4. Agent 决定需要人工批准
  result = await runtime.step(result.newState);
  // 事件: human_approve_required, tool_pending
  // 状态: waiting_for_human_input

  // 5. 人工批准并执行工具
  const toolCall = result.newState.pendingToolsCalling[0];
  result = await runtime.step(result.newState, toolCall);
  // 事件: tool_result
  // 消息: 添加工具结果消息

  // 6. LLM 处理工具结果
  result = await runtime.step(result.newState);
  // 事件: llm_start, llm_stream, llm_result
  // 最终响应: "The weather in Beijing is 25°C and sunny."
}
```

## 测试覆盖

### 构造器和执行器优先级

- ✅ 默认使用内置执行器
- ✅ 配置执行器覆盖内置执行器
- ✅ Agent 执行器具有最高优先级

### 步骤执行方法

- ✅ 直接执行已批准的工具调用
- ✅ 标准的 Agent runner -> 执行器流程
- ✅ 优雅的错误处理

### 内置执行器

- ✅ **LLM 执行器**: 要求 modelRuntime、流式响应、工具调用
- ✅ **工具执行器**: 工具执行和结果处理、未知工具错误
- ✅ **人机交互执行器**: 批准请求、提示输入、选择操作
- ✅ **完成执行器**: 标记对话完成

### 状态创建

- ✅ 不带消息的初始状态创建
- ✅ 带消息的初始状态创建

### 集成测试

- ✅ 完整的对话流程（用户提问 → LLM → 工具调用 → 人工批准 → 工具执行 → 最终响应）

## 架构优势

1. **事件驱动**: 所有操作都产生可追踪的事件，便于调试和审计
2. **模块化**: 执行器模式使得功能扩展和定制变得简单
3. **流式支持**: 原生支持流式 LLM 响应，提供更好的用户体验
4. **人机交互**: 内置支持多种人机交互模式，支持复杂的批准流程
5. **类型安全**: 完整的 TypeScript 类型定义，提供良好的开发体验
6. **测试友好**: 清晰的接口设计使得单元测试和集成测试都很容易编写

## 使用建议

1. **Agent 实现**: 专注于决策逻辑，通过事件历史做出智能决策
2. **工具注册**: 将所有可用工具注册到 Agent.tools 中
3. **错误处理**: 利用内置的错误处理机制，专注于业务逻辑
4. **事件监听**: 监听事件流来实现实时 UI 更新和日志记录
5. **状态管理**: 利用状态中的事件历史来实现会话恢复和重放功能

这个架构为构建复杂的 AI Agent 应用提供了强大而灵活的基础。
