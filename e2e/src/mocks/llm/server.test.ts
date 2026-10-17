import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';

import { buildOpenAIChunks, ensureLLMMockServer, LLM_MOCK_URL, registerLLMReplies } from './server';

const parseContent = (chunks: string[]) =>
  chunks
    .filter((chunk) => chunk.startsWith('data: {'))
    .map((chunk) => JSON.parse(chunk.slice(6)).choices[0].delta.content ?? '')
    .join('');

/** Ask the shared endpoint (a separate process) for a non-streamed reply. */
const complete = async (content: unknown) => {
  const res = await fetch(`${LLM_MOCK_URL}/v1/chat/completions`, {
    body: JSON.stringify({ messages: [{ content, role: 'user' }], stream: false }),
    method: 'POST',
  });
  return (await res.json()).choices[0].message.content as string;
};

describe('LLM mock endpoint', () => {
  afterAll(async () => {
    await registerLLMReplies({ clear: ['exact:hello server', 'contains:fragment'] });
  });

  it('keeps a reply another worker still holds when one worker clears it', async () => {
    const reply = {
      key: 'shared prompt',
      match: 'exact' as const,
      response: 'shared reply',
      responseDelay: 0,
      streamChunkSize: 5,
      streamDelay: 0,
    };
    await ensureLLMMockServer();
    await registerLLMReplies({ replies: [reply] });
    await fetch(`${LLM_MOCK_URL}/__e2e/llm/replies`, {
      body: JSON.stringify({ owner: 'other-worker', replies: [reply] }),
      method: 'POST',
    });

    await registerLLMReplies({ clear: ['exact:shared prompt'] });
    expect(await complete('shared prompt')).toBe('shared reply');

    await fetch(`${LLM_MOCK_URL}/__e2e/llm/replies`, {
      body: JSON.stringify({ clear: ['exact:shared prompt'], owner: 'other-worker' }),
      method: 'POST',
    });
    expect(await complete('shared prompt')).not.toBe('shared reply');
  });

  // Regression: the endpoint lived inside the first Cucumber worker and closed
  // when that worker finished, while slower workers still needed it.
  it('outlives the worker process that started it', async () => {
    const port = '3991';
    const url = `http://127.0.0.1:${port}`;
    const tsxEsm = pathToFileURL(createRequire(`${process.cwd()}/noop.js`).resolve('tsx/esm')).href;
    const serverModule = pathToFileURL(path.join(__dirname, 'server.ts')).href;
    // A short-lived "worker": starts the endpoint, then exits.
    execFileSync(
      process.execPath,
      [
        '--import',
        tsxEsm,
        '-e',
        `import(${JSON.stringify(serverModule)}).then((m) => m.ensureLLMMockServer()).then(() => process.exit(0))`,
      ],
      { env: { ...process.env, E2E_LLM_MOCK_PORT: port }, stdio: 'ignore', timeout: 30_000 },
    );

    try {
      expect((await fetch(`${url}/__e2e/health`)).ok).toBe(true);
    } finally {
      await fetch(`${url}/__e2e/shutdown`, { method: 'POST' }).catch(() => {});
    }
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
    expect(await complete([{ text: 'Hello Server', type: 'text' }])).toBe('registered reply');
    expect(await complete('with a fragment inside')).toBe('fragment reply');

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
