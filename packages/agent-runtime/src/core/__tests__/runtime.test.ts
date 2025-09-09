import { describe, expect, it, vi } from 'vitest';

import {
  Agent,
  AgentEventError,
  AgentState,
  RuntimeConfig,
  RuntimeContext,
  ToolsCalling,
} from '../../types';
import { AgentRuntime } from '../runtime';

// Mock Agent for testing
class MockAgent implements Agent {
  tools = {};
  executors = {};

  async runner(context: RuntimeContext, state: AgentState) {
    switch (context.phase) {
      case 'user_input':
        return { type: 'call_llm' as const, payload: { messages: state.messages } };
      case 'llm_result':
        const llmPayload = context.payload as { result: any; hasToolCalls: boolean };
        if (llmPayload.hasToolCalls) {
          return {
            type: 'request_human_approve' as const,
            pendingToolsCalling: llmPayload.result.tool_calls,
          };
        }
        return { type: 'finish' as const, reason: 'Done' };
      case 'tool_result':
        return { type: 'call_llm' as const, payload: { messages: state.messages } };
      default:
        return { type: 'finish' as const, reason: 'Done' };
    }
  }
}

// Helper function to create test context
function createTestContext(
  phase: RuntimeContext['phase'],
  payload?: any,
  sessionId: string = 'test-session',
): RuntimeContext {
  return {
    phase,
    payload,
    session: {
      sessionId,
      messageCount: 1,
      eventCount: 0,
      status: 'idle',
      stepCount: 0,
    },
  };
}

describe('AgentRuntime', () => {
  describe('Constructor and Executor Priority', () => {
    it('should use built-in executors by default', () => {
      const agent = new MockAgent();
      const runtime = new AgentRuntime(agent);

      // @ts-expect-error - accessing private property for testing
      const executors = runtime.executors;

      expect(executors).toHaveProperty('call_llm');
      expect(executors).toHaveProperty('call_tool');
      expect(executors).toHaveProperty('finish');
      expect(executors).toHaveProperty('request_human_approve');
    });

    it('should allow config executors to override built-in ones', () => {
      const agent = new MockAgent();
      const customFinish = vi.fn();

      const config: RuntimeConfig = {
        executors: {
          finish: customFinish,
        },
      };

      const runtime = new AgentRuntime(agent, config);

      // @ts-ignore
      expect(runtime.executors.finish).toBe(customFinish);
    });

    it('should give agent executors highest priority', () => {
      const agent = new MockAgent();
      const agentFinish = vi.fn();
      const configFinish = vi.fn();

      agent.executors = { finish: agentFinish };
      const config: RuntimeConfig = {
        executors: { finish: configFinish },
      };

      const runtime = new AgentRuntime(agent, config);

      // @ts-ignore
      expect(runtime.executors.finish).toBe(agentFinish);
    });
  });

  describe('step method', () => {
    it('should execute approved tool call directly', async () => {
      const agent = new MockAgent();
      agent.tools = {
        test_tool: vi.fn().mockResolvedValue({ result: 'success' }),
      };

      const runtime = new AgentRuntime(agent);
      const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

      const toolCall: ToolsCalling = {
        id: 'call_123',
        type: 'function',
        function: {
          name: 'test_tool',
          arguments: '{"input": "test"}',
        },
      };

      const result = await runtime.approveToolCall(state, toolCall);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toMatchObject({
        type: 'tool_result',
        id: 'call_123',
        result: { result: 'success' },
      });
      expect(result.newState.messages).toHaveLength(1);
      expect(result.newState.messages[0].role).toBe('tool');
    });

    it('should follow agent runner -> executor flow', async () => {
      const agent = new MockAgent();
      const runtime = new AgentRuntime(agent);
      const state = AgentRuntime.createInitialState({
        sessionId: 'test-session',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const result = await runtime.step(state);

      // Should call agent runner, get call_llm instruction, but fail due to no llmProvider
      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe('error');
      expect(result.newState.status).toBe('error');
    });

    it('should handle errors gracefully', async () => {
      const agent = new MockAgent();
      agent.runner = vi.fn().mockImplementation(() => Promise.reject(new Error('Agent error')));

      const runtime = new AgentRuntime(agent);
      const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

      const result = await runtime.step(state);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]).toMatchObject({
        type: 'error',
        error: expect.any(Error),
      });
      expect(result.newState.status).toBe('error');
      expect(result.newState.error).toBeInstanceOf(Error);
    });
  });

  describe('Built-in Executors', () => {
    describe('call_llm executor', () => {
      it('should require modelRuntime', async () => {
        const agent = new MockAgent();
        const runtime = new AgentRuntime(agent);
        const state = AgentRuntime.createInitialState({
          sessionId: 'test-session',
          messages: [{ role: 'user', content: 'Hello' }],
        });

        const result = await runtime.step(state);

        expect(result.events[0].type).toBe('error');
        expect((result.events[0] as AgentEventError).error.message).toContain(
          'LLM provider is required',
        );
      });

      it('should handle streaming LLM response', async () => {
        const agent = new MockAgent();

        async function* mockModelRuntime(payload: unknown) {
          yield { content: 'Hello' };
          yield { content: ' world' };
          yield { content: '!' };
        }

        const config: RuntimeConfig = {
          modelRuntime: mockModelRuntime,
        };

        const runtime = new AgentRuntime(agent, config);
        const state = AgentRuntime.createInitialState({
          sessionId: 'test-session',
          messages: [{ role: 'user', content: 'Hello' }],
        });

        const result = await runtime.step(state);

        expect(result.events).toHaveLength(5); // start + 3 streams + result
        expect(result.events[0]).toMatchObject({
          type: 'llm_start',
          payload: expect.anything(),
        });

        expect(result.events[1]).toMatchObject({
          type: 'llm_stream',
          chunk: { content: 'Hello' },
        });

        expect(result.events[4]).toMatchObject({
          type: 'llm_result',
          result: { content: 'Hello world!', tool_calls: [] },
        });

        // In the new architecture, call_llm executor doesn't add messages to state
        // It only returns events, messages should be handled by higher-level logic
        expect(result.newState.messages).toHaveLength(1); // Only user message
        expect(result.newState.status).toBe('running');
      });

      it('should handle LLM response with tool calls', async () => {
        const agent = new MockAgent();

        async function* mockModelRuntime(payload: unknown) {
          yield { content: 'I need to use a tool' };
          yield {
            tool_calls: [
              {
                id: 'call_123',
                type: 'function' as const,
                function: { name: 'test_tool', arguments: '{}' },
              },
            ],
          };
        }

        const config: RuntimeConfig = {
          modelRuntime: mockModelRuntime,
        };

        const runtime = new AgentRuntime(agent, config);
        const state = AgentRuntime.createInitialState({
          sessionId: 'test-session',
          messages: [{ role: 'user', content: 'Hello' }],
        });

        const result = await runtime.step(state);

        // In the new architecture, call_llm executor doesn't add messages to state
        // Check that the events contain the expected LLM result
        expect(result.events).toContainEqual(
          expect.objectContaining({
            type: 'llm_result',
            result: expect.objectContaining({
              content: 'I need to use a tool',
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: { name: 'test_tool', arguments: '{}' },
                },
              ],
            }),
          }),
        );
      });
    });

    describe('call_tool executor', () => {
      it('should execute tool and add result to messages', async () => {
        const agent = new MockAgent();
        agent.tools = {
          calculator: vi.fn().mockResolvedValue({ result: 42 }),
        };

        const runtime = new AgentRuntime(agent);
        const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

        const toolCall: ToolsCalling = {
          id: 'call_123',
          type: 'function',
          function: {
            name: 'calculator',
            arguments: '{"expression": "2+2"}',
          },
        };

        const result = await runtime.approveToolCall(state, toolCall);

        expect((agent.tools as any).calculator).toHaveBeenCalledWith({ expression: '2+2' });
        expect(result.events).toHaveLength(1);
        expect(result.events[0]).toMatchObject({
          type: 'tool_result',
          id: 'call_123',
          result: { result: 42 },
        });

        expect(result.newState.messages).toHaveLength(1);
        expect(result.newState.messages[0]).toMatchObject({
          role: 'tool',
          tool_call_id: 'call_123',
          content: '{"result":42}',
        });
      });

      it('should throw error for unknown tool', async () => {
        const agent = new MockAgent();
        const runtime = new AgentRuntime(agent);
        const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

        const toolCall: ToolsCalling = {
          id: 'call_123',
          type: 'function',
          function: {
            name: 'unknown_tool',
            arguments: '{}',
          },
        };

        const result = await runtime.approveToolCall(state, toolCall);

        expect(result.events[0].type).toBe('error');
        expect((result.events[0] as AgentEventError).error.message).toContain(
          'Tool not found: unknown_tool',
        );
      });
    });

    describe('human interaction executors', () => {
      it('should handle human approve request', async () => {
        const agent = new MockAgent();
        // Mock agent to return human approve instruction
        agent.runner = vi.fn().mockImplementation(() =>
          Promise.resolve({
            type: 'request_human_approve',
            pendingToolsCalling: [
              {
                id: 'call_123',
                type: 'function',
                function: { name: 'test_tool', arguments: '{}' },
              },
            ],
          }),
        );

        const runtime = new AgentRuntime(agent);
        const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

        const result = await runtime.step(state);

        expect(result.events).toHaveLength(2);
        expect(result.events[0]).toMatchObject({
          type: 'human_approve_required',
          sessionId: 'test-session',
        });
        expect(result.events[1]).toMatchObject({
          type: 'tool_pending',
        });

        expect(result.newState.status).toBe('waiting_for_human_input');
        expect(result.newState.pendingToolsCalling).toBeDefined();
      });

      it('should handle human prompt request', async () => {
        const agent = new MockAgent();
        agent.runner = vi.fn().mockImplementation(() =>
          Promise.resolve({
            type: 'request_human_prompt',
            prompt: 'Please provide input',
            metadata: { key: 'value' },
          }),
        );

        const runtime = new AgentRuntime(agent);
        const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

        const result = await runtime.step(state);

        expect(result.events).toHaveLength(1);
        expect(result.events[0]).toMatchObject({
          type: 'human_prompt_required',
          prompt: 'Please provide input',
          metadata: { key: 'value' },
          sessionId: 'test-session',
        });

        expect(result.newState.status).toBe('waiting_for_human_input');
        expect(result.newState.pendingHumanPrompt).toEqual({
          prompt: 'Please provide input',
          metadata: { key: 'value' },
        });
      });

      it('should handle human select request', async () => {
        const agent = new MockAgent();
        agent.runner = vi.fn().mockImplementation(() =>
          Promise.resolve({
            type: 'request_human_select',
            prompt: 'Choose an option',
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
            multi: false,
          }),
        );

        const runtime = new AgentRuntime(agent);
        const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

        const result = await runtime.step(state);

        expect(result.events).toHaveLength(1);
        expect(result.events[0]).toMatchObject({
          type: 'human_select_required',
          prompt: 'Choose an option',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
          multi: false,
          sessionId: 'test-session',
        });

        expect(result.newState.status).toBe('waiting_for_human_input');
      });
    });

    describe('finish executor', () => {
      it('should mark conversation as done', async () => {
        const agent = new MockAgent();
        agent.runner = vi.fn().mockImplementation(() =>
          Promise.resolve({
            type: 'finish',
            reason: 'Task completed',
          }),
        );

        const runtime = new AgentRuntime(agent);
        const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

        const result = await runtime.step(state);

        expect(result.events).toHaveLength(1);
        expect(result.events[0]).toMatchObject({
          type: 'done',
          finalState: expect.objectContaining({
            status: 'done',
          }),
          reason: 'Task completed',
        });

        expect(result.newState.status).toBe('done');
      });
    });
  });

  describe('createInitialState', () => {
    it('should create initial state without message', () => {
      const state = AgentRuntime.createInitialState({ sessionId: 'test-session' });

      expect(state).toMatchObject({
        sessionId: 'test-session',
        status: 'idle',
        messages: [],
        stepCount: 0,
        createdAt: expect.any(String),
        lastModified: expect.any(String),
      });
    });

    it('should create initial state with message', () => {
      const state = AgentRuntime.createInitialState({
        sessionId: 'test-session',
        messages: [{ role: 'user', content: 'Hello world' }],
      });

      expect(state.messages).toHaveLength(1);
      expect(state.messages[0]).toMatchObject({
        role: 'user',
        content: 'Hello world',
      });
      expect(state.stepCount).toBe(0);
    });

    it('should create initial state with custom stepCount', () => {
      const state = AgentRuntime.createInitialState({
        sessionId: 'test-session',
        stepCount: 5,
      });

      expect(state.stepCount).toBe(5);
    });

    it('should create initial state with maxSteps limit', () => {
      const state = AgentRuntime.createInitialState({
        sessionId: 'test-session',
        maxSteps: 10,
      });

      expect(state.maxSteps).toBe(10);
      expect(state.stepCount).toBe(0);
    });
  });

  describe('Step Count Tracking', () => {
    it('should increment stepCount on each step execution', async () => {
      const agent = new MockAgent();
      const runtime = new AgentRuntime(agent);

      let state = AgentRuntime.createInitialState({ sessionId: 'test-session' });
      expect(state.stepCount).toBe(0);

      // First step
      const result1 = await runtime.step(state, createTestContext('user_input'));
      expect(result1.newState.stepCount).toBe(1);

      // Second step
      const result2 = await runtime.step(result1.newState, createTestContext('user_input'));
      expect(result2.newState.stepCount).toBe(2);
    });

    it('should respect maxSteps limit', async () => {
      const agent = new MockAgent();
      // Add a mock modelRuntime to avoid LLM provider error
      const runtime = new AgentRuntime(agent, {
        modelRuntime: async function* () {
          yield { content: 'test response' };
        },
      });

      const state = AgentRuntime.createInitialState({
        sessionId: 'test-session',
        maxSteps: 3, // 允许 3 步
      });

      // First step - should work
      const result1 = await runtime.step(state, createTestContext('user_input'));
      expect(result1.newState.stepCount).toBe(1);
      expect(result1.newState.status).not.toBe('error');

      // Second step - should work
      const result2 = await runtime.step(result1.newState, createTestContext('user_input'));
      expect(result2.newState.stepCount).toBe(2);
      expect(result2.newState.status).not.toBe('error');

      // Third step - should work (at limit)
      const result3 = await runtime.step(result2.newState, createTestContext('user_input'));
      expect(result3.newState.stepCount).toBe(3);
      expect(result3.newState.status).not.toBe('error');

      // Fourth step - should finish due to maxSteps
      const result4 = await runtime.step(result3.newState, createTestContext('user_input'));
      expect(result4.newState.stepCount).toBe(4);
      expect(result4.newState.status).toBe('done');
      expect(result4.events[0]).toMatchObject({
        type: 'done',
        finalState: expect.objectContaining({
          status: 'done',
        }),
        reason: 'Maximum steps exceeded: 3',
      });
    });

    it('should include stepCount in session context', async () => {
      const agent = new MockAgent();
      // Mock agent to check the context it receives
      const runnerSpy = vi.spyOn(agent, 'runner');

      const runtime = new AgentRuntime(agent);
      const state = AgentRuntime.createInitialState({
        sessionId: 'test-session',
        stepCount: 5, // Start with step 5
        messages: [{ role: 'user', content: 'test' }],
      });

      // Don't provide context, let runtime create it with updated stepCount
      await runtime.step(state);

      // Check that agent received correct stepCount in context
      expect(runnerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          session: expect.objectContaining({
            stepCount: 6, // Should be incremented
          }),
        }),
        expect.any(Object),
      );
    });
  });

  describe('Integration Tests', () => {
    it('should complete a full conversation flow', async () => {
      const agent = new MockAgent();
      agent.tools = {
        get_weather: vi.fn().mockResolvedValue({
          temperature: 25,
          condition: 'sunny',
        }),
      };

      // Mock agent behavior for different states
      agent.runner = vi.fn().mockImplementation((context: RuntimeContext, state: AgentState) => {
        switch (context.phase) {
          case 'user_input':
            return Promise.resolve({ type: 'call_llm', payload: { messages: state.messages } });
          case 'llm_result':
            const llmPayload = context.payload as { result: any; hasToolCalls: boolean };
            if (llmPayload.hasToolCalls) {
              return Promise.resolve({
                type: 'request_human_approve',
                pendingToolsCalling: llmPayload.result.tool_calls,
              });
            }
            return Promise.resolve({ type: 'finish', reason: 'Done' });
          case 'tool_result':
            return Promise.resolve({ type: 'call_llm', payload: { messages: state.messages } });
          default:
            return Promise.resolve({ type: 'finish', reason: 'Done' });
        }
      });

      async function* mockModelRuntime(payload: unknown) {
        const messages = (payload as any).messages;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
          yield { content: "I'll check the weather for you." };
          yield {
            tool_calls: [
              {
                id: 'call_weather',
                type: 'function' as const,
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
      }

      const runtime = new AgentRuntime(agent, {
        modelRuntime: mockModelRuntime,
      });

      // Step 1: User asks question
      let state = AgentRuntime.createInitialState({
        sessionId: 'test-session',
        messages: [{ role: 'user', content: "What's the weather in Beijing?" }],
      });
      let result = await runtime.step(state);

      // Should get LLM response with tool call (status is 'running' after LLM execution)
      expect(result.newState.status).toBe('running');
      // In new architecture, call_llm doesn't add messages to state
      expect(result.newState.messages).toHaveLength(1); // Only user message
      // Check events contain the tool call result
      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: 'llm_result',
          result: expect.objectContaining({
            tool_calls: expect.arrayContaining([
              expect.objectContaining({
                id: 'call_weather',
                type: 'function',
              }),
            ]),
          }),
        }),
      );

      // Step 1.5: Agent processes assistant message with tool calls using nextContext
      result = await runtime.step(result.newState, result.nextContext);

      // Now should request human approval
      expect(result.newState.status).toBe('waiting_for_human_input');
      expect(result.newState.pendingToolsCalling).toHaveLength(1);

      // Step 2: Approve and execute tool call
      const toolCall = result.newState.pendingToolsCalling![0];
      result = await runtime.approveToolCall(result.newState, toolCall);

      // Should have executed tool
      expect((agent.tools as any).get_weather).toHaveBeenCalledWith({ city: 'Beijing' });
      expect(result.newState.messages).toHaveLength(2); // user + tool result (call_tool executor adds tool message)

      // Step 3: LLM processes tool result using nextContext
      result = await runtime.step(result.newState, result.nextContext);

      // Should get final response in events
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
});
