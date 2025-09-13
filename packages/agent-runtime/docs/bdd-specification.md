# AgentRuntime BDD 规范文档

## 概述

本文档使用行为驱动开发（BDD）的方式描述 AgentRuntime 的预期行为。每个场景都使用 Given-When-Then 的格式，清晰地描述系统在不同条件下的表现。

---

## Feature: Agent Runtime 初始化和配置

### Scenario: 使用默认内置执行器创建运行时

**Given** 我有一个基本的 Agent 实现\
**When** 我创建一个不带配置的 AgentRuntime\
**Then** 运行时应该包含所有内置执行器\
**And** 执行器应该包括: call_llm, call_tool, finish, request_human_approve, request_human_prompt, request_human_select

```typescript
// 验证行为
const agent = new MockAgent();
const runtime = new AgentRuntime(agent);
const executors = runtime.executors; // 私有属性，测试时访问

expect(executors).toHaveProperty('call_llm');
expect(executors).toHaveProperty('call_tool');
expect(executors).toHaveProperty('finish');
```

### Scenario: 配置执行器覆盖内置执行器

**Given** 我有一个基本的 Agent 实现\
**And** 我有一个自定义的 finish 执行器\
**When** 我在配置中提供自定义执行器创建 AgentRuntime\
**Then** 自定义执行器应该覆盖对应的内置执行器\
**And** 其他内置执行器应该保持不变

```typescript
// 验证行为
const customFinish = vi.fn();
const config = { executors: { finish: customFinish } };
const runtime = new AgentRuntime(agent, config);

expect(runtime.executors.finish).toBe(customFinish);
```

### Scenario: Agent 执行器具有最高优先级

**Given** 我有一个带有自定义执行器的 Agent\
**And** 我在配置中也提供了同名的执行器\
**When** 我创建 AgentRuntime\
**Then** Agent 的执行器应该被使用\
**And** 配置中的执行器应该被忽略

```typescript
// 验证行为
const agentFinish = vi.fn();
const configFinish = vi.fn();
agent.executors = { finish: agentFinish };
const config = { executors: { finish: configFinish } };

const runtime = new AgentRuntime(agent, config);
expect(runtime.executors.finish).toBe(agentFinish);
```

---

## Feature: 步骤执行

### Scenario: 执行已批准的工具调用

**Given** 我有一个配置了工具的 Agent\
**And** 我有一个有效的工具调用请求\
**When** 我使用工具调用参数执行步骤\
**Then** 工具应该被直接执行\
**And** 应该产生工具结果事件\
**And** 工具消息应该被添加到状态中

```typescript
// 验证行为
const agent = new MockAgent();
agent.tools = { test_tool: vi.fn().mockResolvedValue({ result: 'success' }) };

const toolCall = {
  id: 'call_123',
  type: 'function',
  function: { name: 'test_tool', arguments: '{"input": "test"}' },
};

const result = await runtime.step(state, toolCall);

expect(result.events[0]).toMatchObject({
  type: 'tool_result',
  id: 'call_123',
  result: { result: 'success' },
});
```

### Scenario: 标准的 Agent 决策流程

**Given** 我有一个 Agent 和初始状态\
**When** 我执行步骤而不提供工具调用\
**Then** Agent 的 runner 方法应该被调用\
**And** 返回的指令应该被相应的执行器处理\
**And** 产生的事件应该被添加到状态历史中

```typescript
// 验证行为
const result = await runtime.step(state);

// Agent runner 被调用，返回指令，执行器处理指令
expect(result.events).toHaveLength(1);
expect(result.newState.events).toContain(result.events[0]);
```

### Scenario: 处理执行过程中的错误

**Given** 我有一个会抛出错误的 Agent\
**When** 我执行步骤\
**Then** 错误应该被捕获\
**And** 应该产生错误事件\
**And** 状态应该被设置为错误状态\
**And** 错误信息应该被保存在状态中

```typescript
// 验证行为
agent.runner = vi.fn().mockRejectedValue(new Error('Agent error'));

const result = await runtime.step(state);

expect(result.events[0]).toMatchObject({
  type: 'error',
  error: expect.any(Error),
});
expect(result.newState.status).toBe('error');
```

---

## Feature: LLM 调用执行器

### Scenario: 要求配置 modelRuntime

**Given** 我有一个会返回 call_llm 指令的 Agent\
**And** 我没有配置 modelRuntime\
**When** 我执行步骤\
**Then** 应该抛出错误\
**And** 错误消息应该提示需要 LLM provider

```typescript
// 验证行为
const result = await runtime.step(state);

expect(result.events[0].type).toBe('error');
expect(result.events[0].error.message).toContain('LLM provider is required');
```

### Scenario: 处理流式 LLM 响应

**Given** 我有一个配置了 modelRuntime 的运行时\
**And** modelRuntime 会产生流式响应\
**When** Agent 返回 call_llm 指令时\
**Then** 应该产生 llm_start 事件\
**And** 应该为每个流式块产生 llm_stream 事件\
**And** 应该产生包含完整内容的 llm_result 事件\
**And** 内容应该从所有流式块中累积

```typescript
// 验证行为
async function* mockModelRuntime(payload) {
  yield { content: 'Hello' };
  yield { content: ' world' };
  yield { content: '!' };
}

const result = await runtime.step(state);

expect(result.events).toHaveLength(5); // start + 3 streams + result
expect(result.events[0].type).toBe('llm_start');
expect(result.events[1].type).toBe('llm_stream');
expect(result.events[4]).toMatchObject({
  type: 'llm_result',
  result: { content: 'Hello world!', tool_calls: [] },
});
```

### Scenario: 处理包含工具调用的 LLM 响应

**Given** 我有一个配置了 modelRuntime 的运行时\
**And** modelRuntime 会返回工具调用\
**When** Agent 返回 call_llm 指令时\
**Then** 应该产生包含工具调用的 llm_result 事件\
**And** 工具调用信息应该被正确解析

```typescript
// 验证行为
async function* mockModelRuntime(payload) {
  yield { content: 'I need to use a tool' };
  yield {
    tool_calls: [
      {
        id: 'call_123',
        type: 'function',
        function: { name: 'test_tool', arguments: '{}' },
      },
    ],
  };
}

const result = await runtime.step(state);

expect(result.events).toContainEqual(
  expect.objectContaining({
    type: 'llm_result',
    result: expect.objectContaining({
      content: 'I need to use a tool',
      tool_calls: expect.arrayContaining([expect.objectContaining({ id: 'call_123' })]),
    }),
  }),
);
```

---

## Feature: 工具调用执行器

### Scenario: 成功执行工具并添加结果到消息

**Given** 我有一个注册了工具的 Agent\
**And** 我有一个有效的工具调用指令\
**When** 工具执行器被调用\
**Then** 工具应该被执行并传入正确的参数\
**And** 应该产生工具结果事件\
**And** 工具消息应该被添加到状态的消息列表中

```typescript
// 验证行为
agent.tools = { calculator: vi.fn().mockResolvedValue({ result: 42 }) };

const toolCall = {
  id: 'call_123',
  type: 'function',
  function: { name: 'calculator', arguments: '{"expression": "2+2"}' },
};

const result = await runtime.step(state, toolCall);

expect(agent.tools.calculator).toHaveBeenCalledWith({ expression: '2+2' });
expect(result.events[0]).toMatchObject({
  type: 'tool_result',
  id: 'call_123',
  result: { result: 42 },
});
expect(result.newState.messages).toContainEqual({
  role: 'tool',
  tool_call_id: 'call_123',
  content: '{"result":42}',
});
```

### Scenario: 处理未知工具错误

**Given** 我有一个没有注册特定工具的 Agent\
**And** 我有一个调用未知工具的指令\
**When** 工具执行器被调用\
**Then** 应该产生错误事件\
**And** 错误消息应该指出工具未找到

```typescript
// 验证行为
const toolCall = {
  id: 'call_123',
  type: 'function',
  function: { name: 'unknown_tool', arguments: '{}' },
};

const result = await runtime.step(state, toolCall);

expect(result.events[0].type).toBe('error');
expect(result.events[0].error.message).toContain('Tool not found: unknown_tool');
```

---

## Feature: 人机交互执行器

### Scenario: 处理人工批准请求

**Given** 我有一个返回 request_human_approve 指令的 Agent\
**And** 指令包含待批准的工具调用列表\
**When** 人工批准执行器被调用\
**Then** 应该产生 human_approve_required 事件\
**And** 应该产生 tool_pending 事件\
**And** 状态应该被设置为 waiting_for_human_input\
**And** 待批准的工具调用应该被保存在状态中

```typescript
// 验证行为
agent.runner = vi.fn().mockResolvedValue({
  type: 'request_human_approve',
  pendingToolsCalling: [
    { id: 'call_123', type: 'function', function: { name: 'test_tool', arguments: '{}' } },
  ],
});

const result = await runtime.step(state);

expect(result.events).toHaveLength(2);
expect(result.events[0]).toMatchObject({
  type: 'human_approve_required',
  sessionId: 'test-session',
});
expect(result.events[1].type).toBe('tool_pending');
expect(result.newState.status).toBe('waiting_for_human_input');
```

### Scenario: 处理人工输入提示请求

**Given** 我有一个返回 request_human_prompt 指令的 Agent\
**And** 指令包含提示消息和元数据\
**When** 人工提示执行器被调用\
**Then** 应该产生 human_prompt_required 事件\
**And** 事件应该包含会话 ID、提示消息和元数据\
**And** 状态应该被设置为 waiting_for_human_input

```typescript
// 验证行为
agent.runner = vi.fn().mockResolvedValue({
  type: 'request_human_prompt',
  prompt: 'Please provide input',
  metadata: { key: 'value' },
});

const result = await runtime.step(state);

expect(result.events[0]).toMatchObject({
  type: 'human_prompt_required',
  prompt: 'Please provide input',
  metadata: { key: 'value' },
  sessionId: 'test-session',
});
expect(result.newState.status).toBe('waiting_for_human_input');
```

### Scenario: 处理人工选择请求

**Given** 我有一个返回 request_human_select 指令的 Agent\
**And** 指令包含选项列表和选择配置\
**When** 人工选择执行器被调用\
**Then** 应该产生 human_select_required 事件\
**And** 事件应该包含所有选项和配置信息\
**And** 状态应该被设置为 waiting_for_human_input

```typescript
// 验证行为
agent.runner = vi.fn().mockResolvedValue({
  type: 'request_human_select',
  prompt: 'Choose an option',
  options: [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ],
  multi: false,
});

const result = await runtime.step(state);

expect(result.events[0]).toMatchObject({
  type: 'human_select_required',
  prompt: 'Choose an option',
  options: expect.arrayContaining([
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ]),
  multi: false,
  sessionId: 'test-session',
});
```

---

## Feature: 完成执行器

### Scenario: 标记对话为完成状态

**Given** 我有一个返回 finish 指令的 Agent\
**When** 完成执行器被调用\
**Then** 应该产生 done 事件\
**And** 事件应该包含最终状态\
**And** 状态应该被设置为 done

```typescript
// 验证行为
agent.runner = vi.fn().mockResolvedValue({
  type: 'finish',
  reason: 'Task completed',
});

const result = await runtime.step(state);

expect(result.events[0]).toMatchObject({
  type: 'done',
  finalState: expect.objectContaining({ status: 'done' }),
});
expect(result.newState.status).toBe('done');
```

---

## Feature: 状态创建

### Scenario: 创建不带消息的初始状态

**Given** 我提供一个会话 ID\
**When** 我调用 createInitialState\
**Then** 应该返回包含会话 ID 的初始状态\
**And** 消息列表应该为空\
**And** 状态应该为 idle\
**And** 应该设置创建时间和最后修改时间

```typescript
// 验证行为
const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

expect(state).toMatchObject({
  sessionId: 'test-session',
  status: 'idle',
  messages: [],
  createdAt: expect.any(String),
  lastModified: expect.any(String),
});
```

### Scenario: 创建带消息的初始状态

**Given** 我提供一个会话 ID 和初始消息\
**When** 我调用 createInitialState\
**Then** 应该返回包含指定消息的初始状态\
**And** 消息应该被正确设置

```typescript
// 验证行为
const state = AgentRuntime.createInitialState({
  sessionId: 'test-session',
  messages: [{ role: 'user', content: 'Hello world' }],
});

expect(state.messages).toHaveLength(1);
expect(state.messages[0]).toMatchObject({
  role: 'user',
  content: 'Hello world',
});
```

---

## Feature: 完整对话流程

### Scenario: 完成一个包含工具调用的完整对话流程

**Given** 我有一个配置了天气工具的 Agent\
**And** Agent 能够根据状态做出智能决策\
**And** 我有一个配置了 modelRuntime 的运行时\
**When** 用户询问天气信息\
**Then** 系统应该调用 LLM 处理用户问题\
**And** LLM 应该返回需要调用天气工具的响应\
**And** Agent 应该请求人工批准工具调用\
**And** 在人工批准后应该执行天气工具\
**And** 最后应该调用 LLM 生成包含天气信息的最终响应

```typescript
// 验证行为 - 完整流程测试
describe('Complete conversation flow', () => {
  it('should handle user question -> LLM -> tool approval -> tool execution -> final response', async () => {
    // Step 1: 用户提问
    let state = AgentRuntime.createInitialState({
      sessionId: 'test-session',
      messages: [{ role: 'user', content: "What's the weather in Beijing?" }],
    });

    let result = await runtime.step(state);

    // 验证 LLM 调用和工具调用响应
    expect(result.newState.status).toBe('running');
    expect(result.events).toContainEqual(expect.objectContaining({ type: 'llm_result' }));

    // Step 2: Agent 处理 LLM 结果并请求人工批准
    result = await runtime.step(result.newState);
    expect(result.newState.status).toBe('waiting_for_human_input');
    expect(result.newState.pendingToolsCalling).toHaveLength(1);

    // Step 3: 人工批准并执行工具
    const toolCall = result.newState.pendingToolsCalling[0];
    result = await runtime.step(result.newState, toolCall);
    expect(agent.tools.get_weather).toHaveBeenCalledWith({ city: 'Beijing' });

    // Step 4: LLM 处理工具结果生成最终响应
    result = await runtime.step(result.newState);
    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: 'llm_result',
        result: expect.objectContaining({
          content: expect.stringContaining('25°C and sunny'),
        }),
      }),
    );
  });
});
```

---

## 业务规则

### Rule: 执行器优先级

**规则**: Agent 提供的执行器 > 配置中的执行器 > 内置执行器\
**原因**: 允许最大化的自定义能力，同时保持向后兼容性

### Rule: 事件累积

**规则**: 每次步骤执行产生的事件都必须被添加到状态的事件历史中\
**原因**: 保持完整的执行轨迹，支持调试、审计和状态重放

### Rule: 状态不可变性

**规则**: 每次步骤执行都应该返回新的状态对象，而不是修改原状态\
**原因**: 保证状态的不可变性，避免意外的副作用

### Rule: 错误处理

**规则**: 所有执行器错误都应该被转换为错误事件，而不是让异常传播\
**原因**: 保持系统的稳定性和可预测性

### Rule: 会话隔离

**规则**: 每个状态必须包含唯一的 sessionId\
**原因**: 支持多会话并发处理和状态隔离

---

## 验收标准

### 对于开发人员

- [ ] 所有 BDD 场景都有对应的自动化测试
- [ ] 测试覆盖率达到 100%
- [ ] 所有公共 API 都有明确的行为定义
- [ ] 错误情况都有明确的处理和测试

### 对于产品人员

- [ ] 系统行为符合业务预期
- [ ] 人机交互流程清晰可控
- [ ] 错误处理对用户友好
- [ ] 性能满足实际使用需求

### 对于测试人员

- [ ] 所有场景都可以独立验证
- [ ] 测试数据和期望结果明确
- [ ] 边界条件和异常情况都有覆盖
- [ ] 集成测试验证端到端流程

---

## 总结

这个 BDD 规范文档定义了 AgentRuntime 的预期行为，确保：

1. **清晰的行为定义**: 每个功能都有明确的 Given-When-Then 描述
2. **完整的场景覆盖**: 从基本功能到复杂集成流程
3. **可验证的标准**: 每个场景都有对应的验证代码
4. **业务价值导向**: 关注用户和业务需求，而不仅仅是技术实现

通过遵循这些 BDD 规范，我们确保 AgentRuntime 不仅在技术上正确实现，更重要的是满足实际业务需求和用户期望。
