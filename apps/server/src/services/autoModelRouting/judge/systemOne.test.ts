// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSystemOneJudge } from './systemOne';

const judge = createSystemOneJudge({
  apiKey: 'sk-test',
  baseURL: 'https://judge.example/v1/',
  model: 'jev-latest',
});

describe('createSystemOneJudge', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks typed routing questions and maps the answers to signals', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          answers: {
            difficulty: { confidence: 0.82, score: 2, type: 'score' },
            needs_reasoning: { noul: 0.9, type: 'noul' },
            topic_shift: { noul: 0.1, type: 'noul' },
          },
          usage: { input_tokens: 120, output_tokens: 0 },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const signals = await judge.judge({ state: 'USER: prove it' }, new AbortController().signal);

    expect(signals).toEqual({
      confidence: 0.82,
      difficulty: 2,
      needsReasoning: 0.9,
      source: 'judge',
      topicShift: 0.1,
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://judge.example/v1/systemone');
    expect(init.headers.Authorization).toBe('Bearer sk-test');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ model: 'jev-latest', state: 'USER: prove it' });
    expect(body.questions.difficulty).toMatchObject({ type: 'score' });
    expect(body.questions.difficulty.criteria).toHaveLength(3);
    expect(body.questions.needs_reasoning.type).toBe('noul');
  });

  it('clamps an out-of-range score', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ answers: { difficulty: { score: 7 } } }))),
    );

    const signals = await judge.judge({ state: 'x' }, new AbortController().signal);
    expect(signals.difficulty).toBe(2);
  });

  it('throws on an HTTP error so the router can fall back', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 401 })));

    await expect(judge.judge({ state: 'x' }, new AbortController().signal)).rejects.toThrow('401');
  });
});
