// @vitest-environment node
import { TRACING_SCENARIOS } from '@lobechat/const';
import { DECISION_FUNCTION_NAME, DECISION_PROMPT_VERSION } from '@lobechat/prompts';
import type { DecisionQuestions } from '@lobechat/types';
import { RequestTrigger } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { extractDecisionArguments, ToolChoiceDecisionBackend } from './toolChoiceBackend';
import { DecisionError } from './types';

const questions = {
  changed: { instructions: 'Did the meaning change?', type: 'noul' },
  intent: {
    criteria: { delegate: 'Hand off.', keep: 'Store.' },
    instructions: 'What should happen?',
    type: 'choice',
  },
} satisfies DecisionQuestions;

const validArgs = {
  changed: { evidence: '"due Friday" was added', level: 4 },
  intent: { evidence: '"research this"', scores: { delegate: 3, keep: 1 } },
};

const ctx = { scenario: TRACING_SCENARIOS.QuickNoteIntent, trigger: RequestTrigger.QuickNote };

describe('ToolChoiceDecisionBackend', () => {
  const generateObject = vi.fn();
  const resolveModel = vi.fn();
  const backend = new ToolChoiceDecisionBackend({ generator: { generateObject }, resolveModel });

  beforeEach(() => {
    generateObject.mockReset();
    resolveModel.mockReset();
    resolveModel.mockResolvedValue({ model: 'mini-model', provider: 'mini-provider' });
  });

  it('forces a single submit_decisions call and converts the answers', async () => {
    generateObject.mockImplementation(async (_payload, options) => {
      await options.onUsage({ cost: 0.001, totalInputTokens: 100, totalOutputTokens: 20 });
      return [{ arguments: JSON.stringify(validArgs), name: DECISION_FUNCTION_NAME }];
    });

    const result = await backend.decide({ questions, state: 'research this, due Friday' }, ctx);

    expect(generateObject).toHaveBeenCalledTimes(1);
    const [payload, options] = generateObject.mock.calls[0];
    expect(payload.model).toBe('mini-model');
    expect(payload.provider).toBe('mini-provider');
    expect(payload.schema).toBeUndefined();
    expect(payload.tools).toHaveLength(1);
    expect(payload.tools[0].function.name).toBe(DECISION_FUNCTION_NAME);
    expect(options.metadata).toEqual({ trigger: RequestTrigger.QuickNote });
    expect(options.tracing).toMatchObject({
      promptVersion: DECISION_PROMPT_VERSION,
      scenario: 'quick_note_intent',
      schemaName: DECISION_FUNCTION_NAME,
    });

    expect(result).toMatchObject({
      answers: {
        changed: { evidence: '"due Friday" was added', noul: 1, type: 'noul' },
        intent: {
          choice: 'delegate',
          confidence: 0.75,
          probabilities: { delegate: 0.75, keep: 0.25 },
          scores: { delegate: 3, keep: 1 },
          type: 'choice',
        },
      },
      backend: 'tool_choice',
      model: 'mini-model',
      provider: 'mini-provider',
      usage: { cost: 0.001, input_tokens: 100, output_tokens: 20 },
    });
    expect(result.id).toMatch(/^dec-/);
  });

  it('falls back to JSON schema output when the model returns no tool call', async () => {
    generateObject.mockResolvedValueOnce([]).mockResolvedValueOnce(validArgs);

    const result = await backend.decide({ questions, state: 'x' }, ctx);

    expect(generateObject).toHaveBeenCalledTimes(2);
    const [payload, options] = generateObject.mock.calls[1];
    expect(payload.tools).toBeUndefined();
    expect(payload.schema.name).toBe(DECISION_FUNCTION_NAME);
    expect(options.tracing.metadata).toEqual({ decisionMode: 'json_schema' });
    expect(result.answers.intent.choice).toBe('delegate');
  });

  it('falls back to JSON schema output when the forced tool call is rejected', async () => {
    generateObject
      .mockRejectedValueOnce(new Error('tool_choice is not supported'))
      .mockResolvedValueOnce(`Here you go:\n\`\`\`json\n${JSON.stringify(validArgs)}\n\`\`\``);

    const result = await backend.decide({ questions, state: 'x' }, ctx);

    expect(generateObject).toHaveBeenCalledTimes(2);
    expect(result.answers.changed.noul).toBe(1);
  });

  it('falls back when the runtime reports the capability as unsupported', async () => {
    generateObject
      .mockRejectedValueOnce({ error: {}, errorType: 'CapabilityNotSupported', provider: 'x' })
      .mockResolvedValueOnce(validArgs);

    const result = await backend.decide({ questions, state: 'x' }, ctx);

    expect(generateObject).toHaveBeenCalledTimes(2);
    expect(result.answers.intent.choice).toBe('delegate');
  });

  it.each([
    ['InvalidProviderAPIKey'],
    ['InsufficientQuota'],
    ['RateLimitExceeded'],
    ['QuotaLimitReached'],
    ['ProviderNetworkError'],
  ])('rethrows %s without a JSON-schema retry', async (errorType) => {
    const error = { error: { message: 'boom' }, errorType, provider: 'x' };
    generateObject.mockRejectedValueOnce(error);

    await expect(backend.decide({ questions, state: 'x' }, ctx)).rejects.toBe(error);
    expect(generateObject).toHaveBeenCalledTimes(1);
  });

  it('rethrows a generic provider error that does not mention tools', async () => {
    const error = { error: { message: 'budget exceeded' }, errorType: 'ProviderBizError' };
    generateObject.mockRejectedValueOnce(error);

    await expect(backend.decide({ questions, state: 'x' }, ctx)).rejects.toBe(error);
    expect(generateObject).toHaveBeenCalledTimes(1);
  });

  it('falls back on a generic provider error that rejects the tools field', async () => {
    generateObject
      .mockRejectedValueOnce({
        error: { message: 'this model does not support tool use' },
        errorType: 'ProviderBizError',
      })
      .mockResolvedValueOnce(validArgs);

    await backend.decide({ questions, state: 'x' }, ctx);

    expect(generateObject).toHaveBeenCalledTimes(2);
  });

  it('does not fall back when the caller aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    generateObject.mockRejectedValueOnce(new Error('aborted'));

    await expect(
      backend.decide({ questions, state: 'x' }, { ...ctx, signal: controller.signal }),
    ).rejects.toThrow('aborted');
    expect(generateObject).toHaveBeenCalledTimes(1);
  });

  it('retries once in the same mode when the output fails validation', async () => {
    generateObject
      .mockResolvedValueOnce([
        { arguments: { ...validArgs, changed: { evidence: '', level: 9 } }, name: 'x' },
      ])
      .mockResolvedValueOnce([{ arguments: validArgs, name: DECISION_FUNCTION_NAME }]);

    const result = await backend.decide({ questions, state: 'x' }, ctx);

    expect(generateObject).toHaveBeenCalledTimes(2);
    expect(generateObject.mock.calls[1][0].tools).toHaveLength(1);
    expect(result.answers.changed.noul).toBe(1);
  });

  it('throws invalid_output when the retry is still invalid', async () => {
    generateObject.mockResolvedValue([
      { arguments: { changed: { level: 1 } }, name: DECISION_FUNCTION_NAME },
    ]);

    const error = await backend.decide({ questions, state: 'x' }, ctx).catch((e) => e);

    expect(error).toBeInstanceOf(DecisionError);
    expect(error.reason).toBe('invalid_output');
    expect(generateObject).toHaveBeenCalledTimes(2);
  });

  it('reports zero usage without cost when the runtime reports none', async () => {
    generateObject.mockResolvedValue([{ arguments: validArgs, name: DECISION_FUNCTION_NAME }]);

    const result = await backend.decide({ questions, state: 'x' }, ctx);

    expect(result.usage).toEqual({ input_tokens: 0, output_tokens: 0 });
  });
});

describe('extractDecisionArguments', () => {
  it('prefers the submit_decisions call among several tool calls', () => {
    expect(
      extractDecisionArguments([
        { arguments: { a: 1 }, name: 'other' },
        { arguments: '{"b":2}', name: DECISION_FUNCTION_NAME },
      ]),
    ).toEqual({ b: 2 });
  });

  it('returns undefined for an empty tool-call list or unparsable text', () => {
    expect(extractDecisionArguments([])).toBeUndefined();
    expect(extractDecisionArguments('no json here')).toBeUndefined();
  });
});
