# AgentRuntime 使用指南

## 快速开始

### 1. 基本使用

```typescript
import { AgentRuntime } from '@lobehub/agent-runtime';

// 1. 定义 Agent（大脑）
class MyAgent {
  tools = {
    get_time: async () => new Date().toISOString(),
    calculate: async ({ expression }) => eval(expression),
  };

  async runner(state) {
    const lastMessage = state.messages.at(-1);

    if (lastMessage?.role === 'user') {
      // 用户提问时调用 LLM
      return {
        type: 'call_llm',
        payload: { messages: state.messages },
      };
    }

    // 其他情况结束对话
    return { type: 'finish', reason: 'Done' };
  }
}

// 2. 创建运行时
const runtime = new AgentRuntime(new MyAgent(), {
  modelRuntime: async function* (payload) {
    // 这里接入你的 LLM 服务
    yield { content: 'Hello! How can I help you?' };
  },
});

// 3. 执行对话
const state = AgentRuntime.createInitialState({
  sessionId: 'user-123',
  messages: [{ role: 'user', content: 'Hello!' }],
});

const result = await runtime.step(state);
console.log(result.events); // 查看产生的事件
```

### 2. 流式 LLM 集成

```typescript
// OpenAI 集成示例
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: 'your-api-key' });

const runtime = new AgentRuntime(agent, {
  modelRuntime: async function* (payload) {
    const { messages } = payload;

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield { content: delta.content };
      }
      if (delta?.tool_calls) {
        yield { tool_calls: delta.tool_calls };
      }
    }
  },
});
```

### 3. 工具调用

```typescript
class ToolAgent {
  tools = {
    // 简单工具
    get_weather: async ({ city }) => {
      // 调用天气 API
      return { temperature: 25, condition: 'sunny' };
    },

    // 复杂工具
    search_web: async ({ query, limit = 5 }) => {
      // 调用搜索 API
      return { results: [] };
    },
  };

  async runner(state) {
    const lastEvent = state.events.at(-1);

    // 如果 LLM 返回了工具调用，请求人工批准
    if (lastEvent?.type === 'llm_result' && lastEvent.result?.tool_calls) {
      return {
        type: 'request_human_approve',
        pendingToolsCalling: lastEvent.result.tool_calls,
      };
    }

    // 其他逻辑...
  }
}
```

### 4. 人机交互

```typescript
class InteractiveAgent {
  async runner(state) {
    const lastMessage = state.messages.at(-1);

    if (lastMessage?.content.includes('choose')) {
      // 需要用户选择
      return {
        type: 'request_human_select',
        prompt: 'Please choose an option:',
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ],
        multi: false,
      };
    }

    if (lastMessage?.content.includes('input')) {
      // 需要用户输入
      return {
        type: 'request_human_prompt',
        prompt: 'Please provide more details:',
        metadata: { context: 'user_info' },
      };
    }

    // 默认调用 LLM
    return {
      type: 'call_llm',
      payload: { messages: state.messages },
    };
  }
}
```

## 高级用法

### 1. 自定义执行器

```typescript
// 在配置中提供自定义执行器
const runtime = new AgentRuntime(agent, {
  executors: {
    // 自定义 LLM 执行器
    call_llm: async (instruction, state) => {
      const events = [];
      const newState = { ...state };

      // 自定义 LLM 调用逻辑
      events.push({ type: 'llm_start', payload: instruction.payload });

      // 你的自定义逻辑...

      return { events, newState };
    },
  },
});

// 或者在 Agent 中提供（优先级更高）
class CustomAgent {
  executors = {
    finish: async (instruction, state) => {
      // 自定义完成逻辑
      return {
        events: [{ type: 'done', finalState: state }],
        newState: { ...state, status: 'completed' },
      };
    },
  };
}
```

### 2. 事件监听和处理

```typescript
async function runWithEventHandling() {
  let state = AgentRuntime.createInitialState({
    sessionId: 'session-1',
    messages: [{ role: 'user', content: 'Hello' }],
  });

  while (state.status !== 'done') {
    const result = await runtime.step(state);

    // 处理不同类型的事件
    for (const event of result.events) {
      switch (event.type) {
        case 'llm_stream':
          console.log('LLM chunk:', event.chunk.content);
          break;

        case 'human_approve_required':
          console.log('需要人工批准:', event.pendingToolsCalling);
          // 这里可以显示 UI 让用户批准
          break;

        case 'tool_result':
          console.log('工具执行结果:', event.result);
          break;

        case 'error':
          console.error('执行错误:', event.error);
          return; // 退出循环
      }
    }

    state = result.newState;

    // 如果需要人工输入，等待用户操作
    if (state.status === 'waiting_for_human_input') {
      // 这里需要实现用户交互逻辑
      break;
    }
  }
}
```

### 3. 会话恢复

```typescript
// 从持久化的状态恢复会话
function restoreSession(savedState) {
  // 重新创建 runtime
  const runtime = new AgentRuntime(agent, config);

  // 从保存的状态继续
  return runtime.step(savedState);
}

// 保存会话状态
function saveSession(state) {
  // 状态包含完整的事件历史，可以用于恢复
  localStorage.setItem('session', JSON.stringify(state));
}
```

### 4. 批量处理

```typescript
async function batchProcess(userQueries) {
  const results = [];

  for (const query of userQueries) {
    const state = AgentRuntime.createInitialState({
      sessionId: `batch-${Date.now()}`,
      messages: [{ role: 'user', content: query }],
    });

    let result = await runtime.step(state);

    // 处理到完成或需要人工干预
    while (result.newState.status === 'running') {
      result = await runtime.step(result.newState);
    }

    results.push(result);
  }

  return results;
}
```

## 最佳实践

### 1. Agent 设计

```typescript
class WellDesignedAgent {
  constructor(private config) {}

  tools = {
    // 工具应该是纯函数，易于测试
    calculate: async ({ expression }) => {
      try {
        return { result: eval(expression) };
      } catch (error) {
        return { error: error.message };
      }
    },
  };

  async runner(state) {
    // 基于状态和事件历史做决策
    const lastMessage = state.messages.at(-1);
    const lastEvent = state.events.at(-1);

    // 清晰的决策逻辑
    if (this.shouldCallLLM(state)) {
      return { type: 'call_llm', payload: this.buildLLMPayload(state) };
    }

    if (this.shouldRequestApproval(state)) {
      return { type: 'request_human_approve', pendingToolsCalling: [] };
    }

    return { type: 'finish', reason: 'Task completed' };
  }

  private shouldCallLLM(state) {
    // 决策逻辑
    return state.messages.at(-1)?.role === 'user';
  }

  private buildLLMPayload(state) {
    // 构建 LLM 输入
    return {
      messages: state.messages,
      temperature: this.config.temperature || 0.7,
    };
  }
}
```

### 2. 错误处理

```typescript
class RobustAgent {
  async runner(state) {
    try {
      // 业务逻辑
      return await this.makeDecision(state);
    } catch (error) {
      // Agent 内部错误处理
      console.error('Agent decision error:', error);
      return {
        type: 'finish',
        reason: `Error: ${error.message}`,
      };
    }
  }

  tools = {
    risky_operation: async (args) => {
      try {
        return await this.performRiskyOperation(args);
      } catch (error) {
        // 工具级别错误处理
        return { error: error.message, success: false };
      }
    },
  };
}
```

### 3. 测试策略

```typescript
// 单元测试 Agent
describe('MyAgent', () => {
  it('should call LLM for user messages', async () => {
    const agent = new MyAgent();
    const state = {
      messages: [{ role: 'user', content: 'Hello' }],
      events: [],
    };

    const instruction = await agent.runner(state);
    expect(instruction.type).toBe('call_llm');
  });
});

// 集成测试 Runtime
describe('AgentRuntime Integration', () => {
  it('should complete conversation flow', async () => {
    const runtime = new AgentRuntime(agent, config);
    let state = AgentRuntime.createInitialState({
      sessionId: 'test',
      messages: [{ role: 'user', content: 'Hello' }],
    });

    const result = await runtime.step(state);
    expect(result.events).toContainEqual(expect.objectContaining({ type: 'llm_start' }));
  });
});
```

## 常见问题

### Q: 如何处理长时间运行的工具？

A: 使用流式响应和进度事件：

```typescript
tools = {
  long_running_task: async function* (args) {
    yield { type: 'progress', message: 'Starting task...' };

    for (let i = 0; i < 100; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      yield { type: 'progress', percent: i };
    }

    yield { type: 'result', data: 'Task completed' };
  },
};
```

### Q: 如何实现条件分支？

A: 在 Agent.runner 中基于状态做决策：

```typescript
async runner(state) {
  const userIntent = this.analyzeIntent(state.messages.at(-1));

  switch (userIntent) {
    case 'weather':
      return { type: 'call_tool', toolCall: this.buildWeatherCall() };
    case 'calculation':
      return { type: 'call_tool', toolCall: this.buildCalculationCall() };
    default:
      return { type: 'call_llm', payload: { messages: state.messages } };
  }
}
```

### Q: 如何实现多轮对话？

A: 利用状态中的消息历史和事件历史：

```typescript
async runner(state) {
  const conversationContext = this.buildContext(state);

  if (conversationContext.isMultiTurn) {
    return {
      type: 'call_llm',
      payload: {
        messages: state.messages,
        context: conversationContext
      }
    };
  }

  // 单轮处理逻辑
}
```

这个使用指南涵盖了 AgentRuntime 的主要使用场景和最佳实践，帮助开发者快速上手并构建强大的 AI Agent 应用。
