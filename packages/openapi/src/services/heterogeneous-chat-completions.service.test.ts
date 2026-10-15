import { describe, expect, it, vi } from 'vitest';

import {
  encodeChatCompletionsStream,
  normalizeChatCompletionsRequest,
} from './heterogeneous-chat-completions.service';

vi.mock('@/server/modules/ModelRuntime', () => ({
  initModelRuntimeFromServerConfig: vi.fn(),
  resolveServerDefaultHeterogeneousModel: vi.fn(),
}));

const encode = async (events: Array<[string, unknown]>) => {
  const raw = events
    .map(([type, data]) => `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
    .join('');
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of new TextEncoder().encode(raw)) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    },
  });
  const output = await new Response(encodeChatCompletionsStream(stream, 'lobehub/model')).text();
  return output
    .split('\n')
    .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
    .map((line) => JSON.parse(line.slice(6)));
};

describe('Chat Completions heterogeneous relay', () => {
  it('retains tool definitions and continuation results without forwarding routing overrides', () => {
    const messages = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call-1',
            type: 'function',
            function: { name: 'read', arguments: '{"path":"proof.txt"}' },
          },
        ],
      },
      { role: 'tool', tool_call_id: 'call-1', content: 'proof' },
    ];
    const tools = [
      { type: 'function', function: { name: 'read', parameters: { type: 'object' } } },
    ];
    expect(
      normalizeChatCompletionsRequest(
        {
          messages,
          tools,
          model: 'untrusted',
          user: 'someone',
          provider: 'other',
          max_completion_tokens: 400,
          tool_choice: 'auto',
        },
        'server-alias',
      ),
    ).toEqual({
      messages,
      tools,
      model: 'server-alias',
      stream: true,
      max_tokens: 400,
      tool_choice: 'auto',
    });
  });

  it('ignores an invalid completion limit when a numeric max_tokens is supplied', () => {
    expect(
      normalizeChatCompletionsRequest(
        { messages: [], max_completion_tokens: 'invalid', max_tokens: 100 },
        'model',
      ).max_tokens,
    ).toBe(100);
  });

  it('streams split tool arguments, usage and Unicode text without losing call IDs', async () => {
    const tool = {
      index: 0,
      id: 'call-1',
      type: 'function',
      function: { name: 'read', arguments: '{"path":' },
    };
    const chunks = await encode([
      ['text', '读取'],
      ['tool_calls', [tool]],
      ['tool_calls', [{ index: 0, function: { arguments: '"proof.txt"}' } }]],
      ['stop', 'tool_calls'],
      ['usage', { totalInputTokens: 12, totalOutputTokens: 5, inputCachedTokens: 3 }],
    ]);
    expect(chunks[1].choices[0].delta.content).toBe('读取');
    expect(chunks[2].choices[0].delta.tool_calls).toEqual([tool]);
    expect(chunks[3].choices[0].delta.tool_calls[0].function.arguments).toBe('"proof.txt"}');
    expect(chunks[4].choices[0].finish_reason).toBe('tool_calls');
    expect(chunks[5].usage).toMatchObject({
      prompt_tokens: 12,
      completion_tokens: 5,
      total_tokens: 17,
      prompt_tokens_details: { cached_tokens: 3 },
    });
    expect(chunks.every((chunk) => chunk.model === 'lobehub/model')).toBe(true);
  });

  it('emits repeated runtime tool identity only once per call while preserving argument deltas', async () => {
    const call = {
      index: 0,
      id: 'call-1',
      type: 'function',
      function: { name: 'Read', arguments: '' },
    };
    const chunks = await encode([
      ['tool_calls', [call]],
      ['tool_calls', [{ ...call, function: { name: 'Read', arguments: '{"file_path":' } }]],
      ['tool_calls', [{ ...call, function: { name: 'Read', arguments: '"proof.txt"}' } }]],
      ['stop', 'tool_calls'],
    ]);
    const deltas = chunks.flatMap((chunk) => chunk.choices[0]?.delta.tool_calls ?? []);
    expect(deltas.map((delta) => delta.id ?? '').join('')).toBe('call-1');
    expect(deltas.map((delta) => delta.function.name ?? '').join('')).toBe('Read');
    expect(deltas.map((delta) => delta.function.arguments ?? '').join('')).toBe(
      '{"file_path":"proof.txt"}',
    );
  });

  it('preserves Gemini structured text and thought parts without treating images as text', async () => {
    const chunks = await encode([
      ['reasoning_part', { partType: 'text', content: 'Thinking' }],
      ['content_part', { partType: 'image', content: 'not text' }],
      ['content_part', { partType: 'text', content: 'Answer' }],
      ['stop', 'stop'],
    ]);
    expect(chunks[1].choices[0].delta).toEqual({ reasoning_content: 'Thinking' });
    expect(chunks[2].choices[0].delta).toEqual({ content: 'Answer' });
    expect(chunks).toHaveLength(4);
  });

  it.each(['refusal', 'content_filter', 'length'])(
    'preserves the terminal %s outcome',
    async (reason) => {
      const chunks = await encode([['stop', reason]]);
      expect(chunks.at(-1).choices[0].finish_reason).toBe(
        reason === 'length' ? 'length' : 'content_filter',
      );
    },
  );

  it('maps the uppercase Gemini MAX_TOKENS stop reason to length, even after tool calls', async () => {
    const chunks = await encode([
      ['tool_calls', [{ function: { arguments: '{"a"', name: 'Read' }, id: 'call_1', index: 0 }]],
      ['stop', 'MAX_TOKENS'],
    ]);
    expect(chunks.at(-1).choices[0].finish_reason).toBe('length');
  });

  it('does not convert failures or a truncated stream into successful completion', async () => {
    for (const events of [
      [['error', { message: 'upstream rejected' }]],
      [['text', 'partial']],
    ] as Array<Array<[string, unknown]>>) {
      const chunks = await encode(events);
      expect(chunks.at(-1).error.type).toBe('api_error');
      expect(chunks.some((chunk) => chunk.choices?.[0]?.finish_reason)).toBe(false);
    }
  });
});
