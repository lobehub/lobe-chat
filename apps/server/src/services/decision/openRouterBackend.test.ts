// @vitest-environment node
import { TRACING_SCENARIOS } from '@lobechat/const';
import type { DecisionQuestions } from '@lobechat/types';
import { RequestTrigger } from '@lobechat/types';
import { describe, expect, it, vi } from 'vitest';

import { OpenRouterDecisionBackend } from './openRouterBackend';
import { DecisionError } from './types';

const questions = {
  is_bug: {
    criteria: { false: 'A question.', true: 'Broken behavior.' },
    instructions: 'Is it a bug?',
    type: 'noul',
  },
  team: {
    criteria: { frontend: 'Rendering.', payments: 'Checkout.' },
    instructions: 'Which team?',
    type: 'choice',
  },
} satisfies DecisionQuestions;

const ctx = { scenario: TRACING_SCENARIOS.QuickNoteIntent, trigger: RequestTrigger.QuickNote };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

const okBody = {
  answers: {
    is_bug: { noul: 0.96, type: 'noul' },
    team: {
      choice: 'payments',
      confidence: 0.84,
      probabilities: { frontend: 0.16, payments: 0.84 },
      type: 'choice',
    },
  },
  id: 'gen-dec-1',
  model: 'typesafe/jev-1.13-20260917',
  provider: 'TypeSafe',
  usage: { cost: 0.00002, input_tokens: 476, output_tokens: 70 },
};

describe('OpenRouterDecisionBackend', () => {
  it('posts the request unchanged and maps the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(okBody));
    const backend = new OpenRouterDecisionBackend({
      apiKey: 'sk-or-test',
      fetch: fetchMock,
      model: 'typesafe/jev-1.13',
    });

    const result = await backend.decide(
      { questions, session_id: 'note-1', state: { ticket: 'blank checkout' } },
      ctx,
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/alpha/decisions');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'Authorization': 'Bearer sk-or-test',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(init.body)).toEqual({
      model: 'typesafe/jev-1.13',
      questions,
      session_id: 'note-1',
      state: { ticket: 'blank checkout' },
    });

    expect(result).toEqual({ ...okBody, backend: 'openrouter' });
  });

  it('lets the request override the model', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(okBody));
    const backend = new OpenRouterDecisionBackend({ apiKey: 'k', fetch: fetchMock, model: 'a' });

    await backend.decide({ model: 'b', questions, state: 'x' }, ctx);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe('b');
  });

  it('throws backend_error with the API message on a non-2xx response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ error: { code: 402, message: 'Insufficient credits' } }, 402),
      );
    const backend = new OpenRouterDecisionBackend({ apiKey: 'k', fetch: fetchMock, model: 'a' });

    const error = await backend.decide({ questions, state: 'x' }, ctx).catch((e) => e);

    expect(error).toBeInstanceOf(DecisionError);
    expect(error.reason).toBe('backend_error');
    expect(error.message).toContain('402: Insufficient credits');
  });

  it('throws invalid_output when an answer is missing or has the wrong type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ...okBody,
        answers: { is_bug: { score: 1, type: 'score' }, team: okBody.answers.team },
      }),
    );
    const backend = new OpenRouterDecisionBackend({ apiKey: 'k', fetch: fetchMock, model: 'a' });

    const error = await backend.decide({ questions, state: 'x' }, ctx).catch((e) => e);

    expect(error.reason).toBe('invalid_output');
    expect(error.message).toContain('"is_bug"');
  });

  it('fills id and provider when OpenRouter omits them', async () => {
    const { id: _id, provider: _provider, ...rest } = okBody;
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(rest));
    const backend = new OpenRouterDecisionBackend({ apiKey: 'k', fetch: fetchMock, model: 'a' });

    const result = await backend.decide({ questions, state: 'x' }, ctx);

    expect(result.id).toMatch(/^dec-/);
    expect(result.provider).toBe('openrouter');
  });
});
