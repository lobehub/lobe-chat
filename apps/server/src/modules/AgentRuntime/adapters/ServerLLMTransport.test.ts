// @vitest-environment node
import { ModelRuntime } from '@lobechat/model-runtime';
import { tracer as agentRuntimeTracer } from '@lobechat/observability-otel/modules/agent-runtime';
import { RequestTrigger } from '@lobechat/types';
import { describe, expect, it, vi } from 'vitest';

import { initModelRuntimeFromDB, resolveServerModel } from '@/server/modules/ModelRuntime';

import type { RuntimeExecutorContext } from '../context';
import { ServerLLMTransport } from './ServerLLMTransport';

vi.mock('@/server/modules/ModelRuntime', () => ({
  initModelRuntimeFromDB: vi.fn(),
  resolveServerModel: vi.fn(),
}));

vi.mock('../llmRelay/resolveLlmExecutionSite', () => ({
  resolveLlmExecutionSite: vi.fn(async () => ({ site: 'server' })),
}));

describe('ServerLLMTransport.stream · conversation affinity', () => {
  it('retains the conversation ID across compression requests and runtime recreation', async () => {
    const chat = vi.fn().mockImplementation(async () => new Response(''));
    vi.mocked(initModelRuntimeFromDB).mockImplementation(async () => new ModelRuntime({ chat }));

    for (const topicId of ['topic-1', 'topic-1', 'topic-2']) {
      const ctx = { topicId, userId: 'user-1' } as RuntimeExecutorContext;
      await new ServerLLMTransport(ctx).stream({
        messages: [],
        model: 'glm-5',
        provider: 'opencodecodingplan',
      });
    }

    expect(chat).toHaveBeenCalledTimes(3);
    expect(chat.mock.calls.map(([, options]) => options.metadata.topicId)).toEqual([
      'topic-1',
      'topic-1',
      'topic-2',
    ]);
  });

  it('tags compression requests with the context compression trigger', async () => {
    const chat = vi.fn().mockImplementation(async () => new Response(''));
    vi.mocked(initModelRuntimeFromDB).mockImplementation(async () => new ModelRuntime({ chat }));

    const ctx = { topicId: 'topic-1', userId: 'user-1' } as RuntimeExecutorContext;
    await new ServerLLMTransport(ctx).stream({
      messages: [],
      model: 'glm-5',
      provider: 'opencodecodingplan',
    });

    expect(chat.mock.calls[0][1].metadata.trigger).toBe(RequestTrigger.ContextCompression);
  });
});

describe('ServerLLMTransport.stream · deployment name', () => {
  it('carries the frozen card deployment name for a compression model equal to the run model', async () => {
    const chat = vi.fn().mockImplementation(async () => new Response(''));
    vi.mocked(initModelRuntimeFromDB).mockImplementation(async () => new ModelRuntime({ chat }));

    const ctx = {
      loadAgentState: vi.fn(async () => ({
        modelRuntimeConfig: {
          model: 'deepseek-v4-pro-ga',
          modelFacts: {
            cards: [
              {
                deploymentName: 'deepseek-v4-pro-ga-260813',
                id: 'deepseek-v4-pro-ga',
                providerId: 'volcengine',
              },
            ],
            model: 'deepseek-v4-pro-ga',
            provider: 'volcengine',
          },
          provider: 'volcengine',
        },
      })),
      operationId: 'op-1',
      stepIndex: 0,
      topicId: 'topic-1',
      userId: 'user-1',
    } as unknown as RuntimeExecutorContext;

    await new ServerLLMTransport(ctx).stream({
      messages: [],
      model: 'deepseek-v4-pro-ga',
      provider: 'volcengine',
    });

    expect(chat.mock.calls[0][0].deploymentName).toBe('deepseek-v4-pro-ga-260813');
  });

  it('resolves the deployment catalog live for a compression model outside the frozen cards', async () => {
    const chat = vi.fn().mockImplementation(async () => new Response(''));
    vi.mocked(initModelRuntimeFromDB).mockImplementation(async () => new ModelRuntime({ chat }));
    vi.mocked(resolveServerModel).mockResolvedValue({
      deploymentName: 'deepseek-v4-pro-ga-260813',
      model: 'deepseek-v4-pro-ga',
      provider: 'volcengine',
    });

    const ctx = {
      loadAgentState: vi.fn(async () => ({
        modelRuntimeConfig: {
          cards: [],
          model: 'other-model',
          modelFacts: { cards: [], model: 'other-model', provider: 'volcengine' },
          provider: 'volcengine',
        },
      })),
      operationId: 'op-1',
      stepIndex: 0,
      topicId: 'topic-1',
      userId: 'user-1',
    } as unknown as RuntimeExecutorContext;

    await new ServerLLMTransport(ctx).stream({
      messages: [],
      model: 'deepseek-v4-pro-ga',
      provider: 'volcengine',
    });

    expect(resolveServerModel).toHaveBeenCalledWith('volcengine', 'deepseek-v4-pro-ga');
    expect(chat.mock.calls[0][0].deploymentName).toBe('deepseek-v4-pro-ga-260813');
  });

  it('keeps the bare model id when the deployment catalog cannot resolve it', async () => {
    const chat = vi.fn().mockImplementation(async () => new Response(''));
    vi.mocked(initModelRuntimeFromDB).mockImplementation(async () => new ModelRuntime({ chat }));
    vi.mocked(resolveServerModel).mockRejectedValue(
      new Error('The selected server model is not available'),
    );

    const ctx = {
      loadAgentState: vi.fn(async () => undefined),
      operationId: 'op-1',
      stepIndex: 0,
      topicId: 'topic-1',
      userId: 'user-1',
    } as unknown as RuntimeExecutorContext;

    await new ServerLLMTransport(ctx).stream({
      messages: [],
      model: 'some-unknown-model',
      provider: 'volcengine',
    });

    expect(chat.mock.calls[0][0].deploymentName).toBeUndefined();
  });

  it('does not touch deploymentName for providers outside the deployment catalog', async () => {
    const chat = vi.fn().mockImplementation(async () => new Response(''));
    vi.mocked(initModelRuntimeFromDB).mockImplementation(async () => new ModelRuntime({ chat }));

    const ctx = {
      loadAgentState: vi.fn(async () => undefined),
      operationId: 'op-1',
      stepIndex: 0,
      topicId: 'topic-1',
      userId: 'user-1',
    } as unknown as RuntimeExecutorContext;

    await new ServerLLMTransport(ctx).stream({
      messages: [],
      model: 'gpt-4',
      provider: 'openai',
    });

    expect(chat.mock.calls[0][0].deploymentName).toBeUndefined();
  });
});

describe('ServerLLMTransport.createTrace · streaming mode', () => {
  it('records the streaming mode the built context resolved, not the operation default', () => {
    const startSpan = vi.spyOn(agentRuntimeTracer, 'startSpan');
    const ctx = { operationId: 'op-1', stepIndex: 0, userId: 'user-1' } as RuntimeExecutorContext;

    new ServerLLMTransport(ctx).createTrace({
      assistantMessageId: 'msg-1',
      context: {
        messages: [],
        modelParameters: { stream: false },
        replayAssistantReasoning: false,
      },
      model: 'gpt-4',
      provider: 'openai',
    });

    expect(startSpan).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        attributes: expect.objectContaining({ 'gen_ai.request.stream': false }),
      }),
    );

    // An explicit operation-level stream is already folded into the context;
    // without any context the operation value still applies.
    new ServerLLMTransport({ ...ctx, stream: false }).createTrace({
      assistantMessageId: 'msg-2',
      model: 'gpt-4',
      provider: 'openai',
    });
    expect(startSpan).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        attributes: expect.objectContaining({ 'gen_ai.request.stream': false }),
      }),
    );
  });
});
