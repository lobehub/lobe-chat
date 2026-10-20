// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenRouterAI } from '../openrouter';
import { LobeMinimaxAI } from './index';

const requests: { body: any; url: string }[] = [];
const mockTransport = () => {
  requests.length = 0;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    requests.push({ body: await request.json(), url: request.url });
    if (requests.at(-1)!.body.stream) {
      return new Response(
        'data: ' +
          JSON.stringify({
            id: 'offline',
            choices: [{ index: 0, delta: { content: 'ok' }, finish_reason: null }],
          }) +
          '\n\ndata: [DONE]\n\n',
        { headers: { 'Content-Type': 'text/event-stream' } },
      );
    }
    return Response.json({
      choices: [{ finish_reason: 'stop', index: 0, message: { content: 'ok', role: 'assistant' } }],
      content: [{ text: 'ok', type: 'text' }],
      id: 'offline-response',
      model: requests.at(-1)!.body.model,
      object: 'chat.completion',
      role: 'assistant',
      stop_reason: 'end_turn',
      type: 'message',
      usage: {
        completion_tokens: 1,
        input_tokens: 1,
        output_tokens: 1,
        prompt_tokens: 1,
        total_tokens: 2,
      },
    });
  });
};
const payload = {
  max_tokens: 4096,
  messages: [{ content: 'hello', role: 'user' as const }],
  model: 'MiniMax-M3.1-Flash',
  responseMode: 'json' as const,
  stream: false,
};

afterEach(() => vi.restoreAllMocks());

describe('MiniMax serialized SDK requests', () => {
  it('streams the default Flash request through the real SDK', async () => {
    mockTransport();
    const response = await new LobeMinimaxAI({ apiKey: 'offline-test' }).chat({
      ...payload,
      stream: true,
      responseMode: undefined,
    });
    expect(await response.text()).toContain('ok');
    expect(requests[0].body.reasoning_effort).toBe('max');
    expect(requests[0].body.stream).toBe(true);
  });
  it.each([
    [undefined, 'openai', 'https://api.minimaxi.com/v1/chat/completions'],
    ['https://api.minimax.io/v1', 'openai', 'https://api.minimax.io/v1/chat/completions'],
    [
      'https://api.minimaxi.com/anthropic',
      'anthropic',
      'https://api.minimaxi.com/anthropic/v1/messages',
    ],
    [
      'https://api.minimax.io/anthropic',
      'anthropic',
      'https://api.minimax.io/anthropic/v1/messages',
    ],
    ['https://proxy.example/v1', 'openai', 'https://proxy.example/v1/chat/completions'],
  ] as const)('sends valid Flash parameters through %s (%s)', async (baseURL, sdkType, url) => {
    mockTransport();
    const runtime = new LobeMinimaxAI({ apiKey: 'offline-test', baseURL, sdkType });
    await runtime.chat({ ...payload, reasoning_effort: 'none', thinking: { type: 'disabled' } });
    expect(requests).toHaveLength(1);
    const request = requests[0];
    expect(request.url).toBe(url);
    expect(request.body.model).toBe(payload.model);
    expect(request.body.thinking).toEqual({ type: 'adaptive' });
    expect(
      sdkType === 'anthropic' ? request.body.output_config.effort : request.body.reasoning_effort,
    ).toBe('max');
    expect(request.body.service_tier).toBeUndefined();
    expect(
      sdkType === 'anthropic' ? request.body.max_tokens : request.body.max_completion_tokens,
    ).toBe(4096);
  });

  it.each(['low', 'medium', 'high', 'xhigh', 'max'] as const)(
    'preserves explicit Flash effort %s',
    async (reasoning_effort) => {
      mockTransport();
      await new LobeMinimaxAI({ apiKey: 'offline-test' }).chat({ ...payload, reasoning_effort });
      expect(requests[0].body.reasoning_effort).toBe(reasoning_effort);
    },
  );

  it.each(['MiniMax-M3', 'MiniMax-M2.7', 'private-model'])(
    'preserves saved/custom model ID %s',
    async (model) => {
      mockTransport();
      await new LobeMinimaxAI({ apiKey: 'offline-test' }).chat({
        ...payload,
        model,
        thinking: { type: 'disabled' },
      });
      expect(requests[0].body.model).toBe(model);
      expect(requests[0].body.thinking).toEqual({ type: 'disabled' });
    },
  );

  it('preserves explicit model mapping, image content and tool history', async () => {
    mockTransport();
    const runtime = new LobeMinimaxAI({
      apiKey: 'offline-test',
      modelIdMapping: { 'MiniMax-M3.1-Flash': 'private-flash-deployment' },
    });
    await runtime.chat({
      ...payload,
      messages: [
        {
          content: [{ type: 'image_url', image_url: { url: 'https://example.com/image.png' } }],
          role: 'user',
        },
        {
          content: '',
          role: 'assistant',
          tool_calls: [
            { id: 'call-1', type: 'function', function: { name: 'lookup', arguments: '{}' } },
          ],
        },
        { content: 'result', role: 'tool', tool_call_id: 'call-1' },
      ],
    });
    expect(requests[0].body.model).toBe('private-flash-deployment');
    expect(requests[0].body.messages[0].content[0].image_url.url).toBe(
      'https://example.com/image.png',
    );
    expect(requests[0].body.messages[1].tool_calls[0].id).toBe('call-1');
    expect(requests[0].body.messages[2].tool_call_id).toBe('call-1');
  });

  it('uses the verified OpenRouter free route and mandatory reasoning', async () => {
    mockTransport();
    await new LobeOpenRouterAI({ apiKey: 'offline-test' }).chat({
      ...payload,
      model: 'minimax/minimax-m3.1-flash:free',
      thinking: { type: 'disabled' },
    });
    expect(requests[0].url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(requests[0].body.model).toBe('minimax/minimax-m3.1-flash:free');
    expect(requests[0].body.reasoning).toEqual({ effort: 'max' });
  });
});
