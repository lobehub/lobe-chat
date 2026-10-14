import { afterAll, describe, expect, it } from 'vitest';

import {
  buildOpenAIChunks,
  ensureLLMMockServer,
  LLM_MOCK_URL,
  registerLLMReplies,
  resolveReply,
} from './server';

const parseContent = (chunks: string[]) =>
  chunks
    .filter((chunk) => chunk.startsWith('data: {'))
    .map((chunk) => JSON.parse(chunk.slice(6)).choices[0].delta.content ?? '')
    .join('');

describe('LLM mock endpoint', () => {
  afterAll(async () => {
    await registerLLMReplies({ clear: ['exact:hello server', 'contains:fragment'] });
  });

  it('streams the reply as OpenAI chat-completion chunks ending with [DONE]', () => {
    const chunks = buildOpenAIChunks('Hello, mock world!', 4, 'deepseek-v4-flash');

    expect(parseContent(chunks)).toBe('Hello, mock world!');
    expect(chunks.at(-1)).toBe('data: [DONE]\n\n');
    expect(JSON.parse(chunks.at(-2)!.slice(6)).choices[0].finish_reason).toBe('stop');
  });

  it('answers a server-side chat completion with the registered reply', async () => {
    await ensureLLMMockServer();
    await registerLLMReplies({
      replies: [
        {
          key: 'hello server',
          match: 'exact',
          response: 'registered reply',
          responseDelay: 0,
          streamChunkSize: 5,
          streamDelay: 0,
        },
        {
          key: 'fragment',
          match: 'contains',
          response: 'fragment reply',
          responseDelay: 0,
          streamChunkSize: 5,
          streamDelay: 0,
        },
      ],
    });

    // Message content arrives as typed parts from the server runtime.
    expect(
      resolveReply([{ content: [{ text: 'Hello Server', type: 'text' }], role: 'user' }]).response,
    ).toBe('registered reply');
    expect(resolveReply([{ content: 'with a fragment inside', role: 'user' }]).response).toBe(
      'fragment reply',
    );

    const res = await fetch(`${LLM_MOCK_URL}/v1/chat/completions`, {
      body: JSON.stringify({
        messages: [{ content: 'hello server', role: 'user' }],
        model: 'deepseek-v4-flash',
        stream: true,
      }),
      method: 'POST',
    });
    const text = await res.text();

    expect(res.headers.get('content-type')).toBe('text/event-stream');
    expect(parseContent(text.split(/(?<=\n\n)/))).toBe('registered reply');
  });
});
