import { describe, expect, it, vi } from 'vitest';

import type { Agent, AgentRuntimeContext, AgentState, Usage } from '../../types';
import { getLlmCallCount, withLlmAttemptCount } from '../../utils/llmCalls';
import { AgentRuntime } from '../runtime';

const createContext = (): AgentRuntimeContext => ({
  payload: {},
  phase: 'user_input',
  session: {
    messageCount: 1,
    sessionId: 'test-op',
    status: 'idle',
    stepCount: 0,
  },
});

const createAgent = (): Agent =>
  ({
    executors: {},
    modelRuntime: async function* () {
      yield { content: 'ok' };
    },
    runner: async (context: AgentRuntimeContext) =>
      context.phase === 'user_input'
        ? { payload: { messages: [] }, type: 'call_llm' }
        : { reason: 'completed', reasonDetail: 'Done', type: 'finish' },
    tools: {},
  }) as unknown as Agent;

const createUsage = (apiCalls: number): Usage => ({
  humanInteraction: {
    approvalRequests: 0,
    promptRequests: 0,
    selectRequests: 0,
    totalWaitingTimeMs: 0,
  },
  llm: {
    apiCalls,
    processingTimeMs: 0,
    tokens: { input: 0, output: 0, total: 0 },
  },
  tools: { byTool: [], totalCalls: 0, totalTimeMs: 0 },
});

describe('llmCalls metric', () => {
  it('increments llmCalls for LLM work but not for a finish-only step', async () => {
    const runtime = new AgentRuntime(createAgent());
    const state = AgentRuntime.createInitialState({
      messages: [{ content: 'hi', role: 'user' }],
      operationId: 'test-op',
    });

    const first = await runtime.step(state, createContext());
    expect(first.newState.stepCount).toBe(1);
    expect(first.newState.llmCalls).toBe(1);

    const second = await runtime.step(first.newState, first.nextContext);
    // `finish` is not a real execution step and not an LLM call either.
    expect(second.newState.stepCount).toBe(1);
    expect(second.newState.llmCalls).toBe(1);
  });

  it('counts provider attempts when the LLM call fails terminally', async () => {
    const runtime = new AgentRuntime(createAgent());
    // @ts-expect-error - accessing a private property for testing
    runtime.executors.call_llm = vi
      .fn()
      .mockRejectedValue(withLlmAttemptCount(new Error('provider down'), 3));

    const state = AgentRuntime.createInitialState({ operationId: 'test-op' });
    const result = await runtime.step(state, createContext());

    expect(result.newState.status).toBe('error');
    expect(result.newState.usage?.llm.apiCalls).toBe(3);
    expect(result.newState.llmCalls).toBe(3);
  });

  it('reads the explicit llmCalls field before falling back to usage', () => {
    const state = { llmCalls: 5, usage: createUsage(2) } as AgentState;
    expect(getLlmCallCount(state)).toBe(5);

    expect(getLlmCallCount({ usage: createUsage(2) })).toBe(2);
    expect(getLlmCallCount(null)).toBe(0);
  });
});
