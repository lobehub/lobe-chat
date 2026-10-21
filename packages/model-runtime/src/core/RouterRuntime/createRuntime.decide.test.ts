import { AgentRuntimeErrorType, RequestTrigger } from '@lobechat/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { LobeRuntimeAI } from '../BaseAI';
import { ModelRuntime } from '../ModelRuntime';
import { createRouterRuntime } from './createRuntime';

const getModelType = vi.hoisted(() => vi.fn());
vi.mock('../../utils/getModelPricing', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getModelType,
}));

vi.mock('../../providers/lobehub', () => ({
  LobeHubAI: class LobeHubAI {},
}));

describe('createRouterRuntime decide', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should route decide calls and record the lobehub route attempt', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const decision = {
      answers: { refund: { probability: 0.9, type: 'boolean' } },
      model: 'jev',
    };
    const mockDecide = vi.fn().mockResolvedValue(decision);

    class MockRuntime implements LobeRuntimeAI {
      decide = mockDecide;
    }

    const Runtime = createRouterRuntime({
      id: 'lobehub',
      routers: [
        {
          apiType: 'openai',
          models: ['typesafe/jev-1.13'],
          options: { id: 'channel-1' },
          runtime: MockRuntime as any,
        },
      ],
    });

    const runtime = new Runtime({ userId: 'user-1' });
    const metadata: Record<string, unknown> = { trigger: RequestTrigger.Api };

    await expect(
      runtime.decide(
        {
          model: 'typesafe/jev-1.13',
          questions: {
            refund: {
              criteria: { false: 'no', true: 'yes' },
              instructions: 'Refund request?',
              type: 'boolean',
            },
          },
          state: 'Give me my money back',
        },
        { metadata, user: 'user-1' },
      ),
    ).resolves.toEqual(decision);
    expect(metadata.routeAttempt).toEqual(expect.objectContaining({ success: true }));
  });

  it('should reject decide when the matched runtime cannot decide', async () => {
    class MockRuntime implements LobeRuntimeAI {}

    const Runtime = createRouterRuntime({
      id: 'test-runtime',
      routers: [
        {
          apiType: 'openai',
          models: ['typesafe/jev-1.13'],
          options: {},
          runtime: MockRuntime as any,
        },
      ],
    });

    await expect(
      new Runtime().decide({ model: 'typesafe/jev-1.13', questions: {}, state: 'x' }),
    ).rejects.toMatchObject({ errorType: AgentRuntimeErrorType.CapabilityNotSupported });
  });

  it('should emulate a chat model through the routed generateObject when wrapped in ModelRuntime', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    getModelType.mockResolvedValue('chat');
    const mockDecide = vi.fn();
    const mockGenerateObject = vi.fn().mockResolvedValue({
      q0: { evidence: 'Wants money back.', refused: false, value: 0.9 },
    });

    class MockRuntime implements LobeRuntimeAI {
      decide = mockDecide;
      generateObject = mockGenerateObject;
    }

    const Runtime = createRouterRuntime({
      id: 'lobehub',
      routers: [
        {
          apiType: 'openai',
          models: ['gpt-5-mini'],
          options: { id: 'channel-1' },
          runtime: MockRuntime as any,
        },
      ],
    });

    const runtime = new ModelRuntime(new Runtime({ userId: 'user-1' }));
    const metadata: Record<string, unknown> = { trigger: RequestTrigger.Api };

    const result = await runtime.decide(
      {
        model: 'gpt-5-mini',
        questions: {
          refund: {
            criteria: { false: 'no', true: 'yes' },
            instructions: 'Refund request?',
            type: 'boolean',
          },
        },
        state: 'Give me my money back',
      },
      { metadata },
    );

    expect(result.answers.refund).toEqual({ probability: 0.9, type: 'boolean' });
    expect(result.providerMetadata?.lobehub?.decisionMode).toBe('emulated');
    expect(mockDecide).not.toHaveBeenCalled();
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-5-mini' }),
      expect.objectContaining({ metadata }),
    );
    expect(metadata.routeAttempt).toEqual(expect.objectContaining({ success: true }));
  });
});
