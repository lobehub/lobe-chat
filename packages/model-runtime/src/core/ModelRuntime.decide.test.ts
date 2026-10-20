// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../types/error';
import { ModelRuntime, type ModelRuntimeHooks } from './ModelRuntime';

const getModelType = vi.hoisted(() => vi.fn());
vi.mock('../utils/getModelPricing', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getModelType,
}));

vi.mock('../providers/lobehub', () => ({
  LobeHubAI: class LobeHubAI {},
}));

const createMockRuntime = (hooks?: ModelRuntimeHooks) => {
  const mockRuntimeAI = { chat: vi.fn() } as any;
  return { runtime: new ModelRuntime(mockRuntimeAI, hooks), mockRuntimeAI };
};

const decidePayload = {
  model: 'typesafe/jev-1.13',
  questions: {
    refund: {
      criteria: { false: 'No refund requested.', true: 'Asks for money back.' },
      instructions: 'Is the customer asking for a refund?',
      type: 'predicate' as const,
    },
  },
  state: 'I was charged twice and want my money back.',
};

const decision = {
  answers: { refund: { probability: 0.99, type: 'predicate' } },
  model: 'typesafe/jev-1.13-20260917',
};

beforeEach(() => {
  getModelType.mockReset();
  getModelType.mockResolvedValue('decision');
});

describe('ModelRuntime decide hooks', () => {
  it('passes the response and provider usage to onDecideFinal after beforeDecide', async () => {
    const usage = { cost: 0.000_018, inputTextTokens: 436, totalInputTokens: 436 };
    const beforeDecide = vi.fn();
    const onDecideFinal = vi.fn();
    const onDecideComplete = vi.fn();
    const { runtime, mockRuntimeAI } = createMockRuntime({
      beforeDecide,
      onDecideComplete,
      onDecideFinal,
    });
    mockRuntimeAI.decide = vi.fn(async (_payload: any, options: any) => {
      await options.onUsage(usage);
      return decision;
    });

    const options = { user: 'u1' };
    const result = await runtime.decide(decidePayload, options);

    const expected = {
      ...decision,
      providerMetadata: { lobehub: { decisionMode: 'native' } },
      usage,
    };
    expect(result).toEqual(expected);
    expect(beforeDecide).toHaveBeenCalledWith(decidePayload, options);
    expect(onDecideFinal).toHaveBeenCalledWith(
      { latencyMs: expect.any(Number), response: expected, usage },
      { options, payload: decidePayload },
    );
    expect(onDecideComplete).toHaveBeenCalledWith(
      {
        latencyMs: expect.any(Number),
        mode: 'native',
        response: expected,
        success: true,
        usage,
      },
      { options, payload: decidePayload },
    );
  });

  it('calls onDecideError and onDecideComplete, then re-throws when the provider fails', async () => {
    const providerError = { errorType: 'ProviderBizError', error: { message: 'boom' } };
    const onDecideError = vi.fn();
    const onDecideFinal = vi.fn();
    const onDecideComplete = vi.fn();
    const { runtime, mockRuntimeAI } = createMockRuntime({
      onDecideComplete,
      onDecideError,
      onDecideFinal,
    });
    mockRuntimeAI.decide = vi.fn().mockRejectedValue(providerError);

    await expect(runtime.decide(decidePayload)).rejects.toBe(providerError);
    expect(onDecideFinal).not.toHaveBeenCalled();
    expect(onDecideError).toHaveBeenCalledWith(providerError, {
      options: undefined,
      payload: decidePayload,
    });
    expect(onDecideComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'ProviderBizError' }),
        mode: 'native',
        success: false,
      }),
      { options: undefined, payload: decidePayload },
    );
  });

  it('rejects instead of resolving undefined when the provider can neither decide nor emulate', async () => {
    getModelType.mockResolvedValue(undefined);
    const beforeDecide = vi.fn();
    const { runtime } = createMockRuntime({ beforeDecide });

    await expect(runtime.decide(decidePayload)).rejects.toMatchObject({
      errorType: AgentRuntimeErrorType.CapabilityNotSupported,
    });
    expect(beforeDecide).not.toHaveBeenCalled();
  });

  it('rejects a decision model on a provider without native decide instead of emulating', async () => {
    const { runtime, mockRuntimeAI } = createMockRuntime();
    mockRuntimeAI.generateObject = vi.fn();

    await expect(runtime.decide(decidePayload)).rejects.toMatchObject({
      errorType: AgentRuntimeErrorType.CapabilityNotSupported,
    });
    expect(mockRuntimeAI.generateObject).not.toHaveBeenCalled();
  });

  it('rejects an invalid request before any hook or provider call', async () => {
    const beforeDecide = vi.fn();
    const { runtime, mockRuntimeAI } = createMockRuntime({ beforeDecide });
    mockRuntimeAI.decide = vi.fn();

    await expect(
      runtime.decide({
        ...decidePayload,
        questions: { refund: { ...decidePayload.questions.refund, type: 'rating' as any } },
      }),
    ).rejects.toMatchObject({ errorType: AgentRuntimeErrorType.InvalidRequestFormat });
    expect(beforeDecide).not.toHaveBeenCalled();
    expect(mockRuntimeAI.decide).not.toHaveBeenCalled();
  });

  it('rejects a native response whose distribution does not sum to 1', async () => {
    const onDecideError = vi.fn();
    const { runtime, mockRuntimeAI } = createMockRuntime({ onDecideError });
    mockRuntimeAI.decide = vi.fn().mockResolvedValue({
      answers: {
        tone: {
          choice: 'calm',
          probabilities: { angry: 0.2, calm: 0.5 },
          type: 'choice',
        },
      },
      model: 'typesafe/jev-1.13',
    });

    await expect(
      runtime.decide({
        ...decidePayload,
        questions: {
          tone: {
            criteria: { angry: 'Hostile wording', calm: 'Neutral wording' },
            instructions: 'Tone?',
            type: 'choice',
          },
        },
      }),
    ).rejects.toMatchObject({
      error: { message: expect.stringContaining('probabilities sum to 0.7') },
      errorType: AgentRuntimeErrorType.ProviderBizError,
    });
    expect(onDecideError).toHaveBeenCalled();
  });
});

describe('ModelRuntime decide emulation fallback', () => {
  const emulatedOutput = {
    q0: { evidence: 'Asks for money back.', refused: false, value: 0.93 },
  };

  it('emulates through generateObject for a chat model even when the provider decides natively', async () => {
    getModelType.mockResolvedValue('chat');
    const usage = { inputTextTokens: 300, outputTextTokens: 40, totalTokens: 340 };
    const onDecideFinal = vi.fn();
    const onGenerateObjectFinal = vi.fn();
    const beforeGenerateObject = vi.fn();
    const { runtime, mockRuntimeAI } = createMockRuntime({
      beforeGenerateObject,
      onDecideFinal,
      onGenerateObjectFinal,
    });
    mockRuntimeAI.decide = vi.fn();
    mockRuntimeAI.generateObject = vi.fn(async (_payload: any, options: any) => {
      await options.onUsage(usage);
      return emulatedOutput;
    });

    const onUsage = vi.fn();
    const result = await runtime.decide({ ...decidePayload, model: 'gpt-5-mini' }, { onUsage });

    expect(mockRuntimeAI.decide).not.toHaveBeenCalled();
    expect(result).toEqual({
      answers: { refund: { probability: 0.93, type: 'predicate' } },
      model: 'gpt-5-mini',
      providerMetadata: {
        lobehub: { decisionMode: 'emulated', evidence: { refund: 'Asks for money back.' } },
      },
      usage,
    });
    expect(onUsage).toHaveBeenCalledWith(usage);
    expect(onDecideFinal).toHaveBeenCalledWith(
      expect.objectContaining({ usage }),
      expect.anything(),
    );
    // The emulation is one decide call: generateObject hooks (billing, tracing) stay silent.
    expect(beforeGenerateObject).not.toHaveBeenCalled();
    expect(onGenerateObjectFinal).not.toHaveBeenCalled();
  });

  it('emulates when the provider has no native decide and the model is not listed', async () => {
    getModelType.mockResolvedValue(undefined);
    const { runtime, mockRuntimeAI } = createMockRuntime();
    mockRuntimeAI.generateObject = vi.fn().mockResolvedValue(emulatedOutput);

    const result = await runtime.decide({ ...decidePayload, model: 'llama3' });

    expect(result.providerMetadata?.lobehub?.decisionMode).toBe('emulated');
    expect(mockRuntimeAI.generateObject).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'llama3' }),
      expect.anything(),
    );
  });

  it('treats a failed model-bank lookup as an unlisted model', async () => {
    getModelType.mockRejectedValue(new Error('redis down'));
    const { runtime, mockRuntimeAI } = createMockRuntime();
    mockRuntimeAI.generateObject = vi.fn().mockResolvedValue(emulatedOutput);

    await expect(runtime.decide(decidePayload)).resolves.toMatchObject({
      providerMetadata: { lobehub: { decisionMode: 'emulated' } },
    });
  });

  it('honours mode: native for decision models model-bank does not list', async () => {
    getModelType.mockResolvedValue(undefined);
    const { runtime, mockRuntimeAI } = createMockRuntime();
    mockRuntimeAI.decide = vi.fn().mockResolvedValue(decision);
    mockRuntimeAI.generateObject = vi.fn();

    const result = await runtime.decide(decidePayload, { mode: 'native' });

    expect(result.providerMetadata?.lobehub?.decisionMode).toBe('native');
    expect(getModelType).not.toHaveBeenCalled();
    expect(mockRuntimeAI.generateObject).not.toHaveBeenCalled();
  });

  it('honours mode: emulated for a listed decision model', async () => {
    const { runtime, mockRuntimeAI } = createMockRuntime();
    mockRuntimeAI.decide = vi.fn();
    mockRuntimeAI.generateObject = vi.fn().mockResolvedValue(emulatedOutput);

    await runtime.decide(decidePayload, { mode: 'emulated' });

    expect(mockRuntimeAI.decide).not.toHaveBeenCalled();
    expect(mockRuntimeAI.generateObject).toHaveBeenCalledTimes(1);
  });
});
