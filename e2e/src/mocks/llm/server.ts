/**
 * Server-side LLM mock.
 *
 * Agent runs execute on the LobeHub server and stream to the browser over the
 * Agent Gateway, so the model call never passes through the page and a
 * browser-side interceptor cannot answer it. The E2E server is pointed at this
 * OpenAI-compatible endpoint instead (`DEEPSEEK_PROXY_URL`, the default
 * provider), and each test registers the replies it expects here.
 *
 * Cucumber runs scenarios in several worker processes against one app server,
 * so the endpoint is shared. It runs in its own detached process (`./serve.ts`),
 * started by the first worker that needs it, so no worker's exit can take it
 * down while the others are still running; every worker registers its replies
 * over HTTP. The process exits on its own once idle (`E2E_LLM_MOCK_IDLE_MS`).
 */
import { spawn } from 'node:child_process';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const LLM_MOCK_PORT = Number(process.env.E2E_LLM_MOCK_PORT || 3990);
export const LLM_MOCK_URL = `http://127.0.0.1:${LLM_MOCK_PORT}`;

export interface LLMMockReplyConfig {
  /** Delay before the first chunk, in ms */
  responseDelay: number;
  /** Characters per streamed chunk */
  streamChunkSize: number;
  /** Delay between chunks, in ms */
  streamDelay: number;
}

export interface LLMMockReply extends LLMMockReplyConfig {
  /** Lower-cased, trimmed user message (exact) or fragment (contains) */
  key: string;
  match: 'contains' | 'exact';
  response: string;
}

interface Registry {
  defaultReply: LLMMockReplyConfig & { response: string };
  /** Workers holding each reply; a reply is dropped once the last one clears it. */
  owners: Map<string, Set<string>>;
  replies: Map<string, LLMMockReply>;
}

const registry: Registry = {
  defaultReply: {
    response: 'Hello! I am a mock AI assistant. How can I help you today?',
    responseDelay: 100,
    streamChunkSize: 10,
    streamDelay: 20,
  },
  owners: new Map(),
  replies: new Map(),
};

/** This Cucumber worker; registrations and clears are scoped to it. */
const WORKER_ID = process.env.CUCUMBER_WORKER_ID ?? '0';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readBody = async (req: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
};

/** OpenAI message content can be a string or an array of typed parts. */
const textOf = (content: unknown): string => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content))
    return content
      .map((part) => (part && typeof part === 'object' && 'text' in part ? String(part.text) : ''))
      .join('');
  return '';
};

export const resolveReply = (messages: { content?: unknown; role?: string }[]) => {
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');
  const key = textOf(lastUser?.content).toLowerCase().trim();

  if (key) {
    const exact = registry.replies.get(`exact:${key}`);
    if (exact) return exact;
    for (const reply of registry.replies.values()) {
      if (reply.match === 'contains' && key.includes(reply.key)) return reply;
    }
  }

  return registry.defaultReply;
};

/** OpenAI chat-completions SSE chunks for `content`. */
export const buildOpenAIChunks = (content: string, chunkSize: number, model: string) => {
  const id = `chatcmpl-e2e-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);
  const frame = (delta: object, finishReason: string | null = null, extra: object = {}) =>
    `data: ${JSON.stringify({
      choices: [{ delta, finish_reason: finishReason, index: 0 }],
      created,
      id,
      model,
      object: 'chat.completion.chunk',
      ...extra,
    })}\n\n`;

  const chunks = [frame({ content: '', role: 'assistant' })];
  for (let i = 0; i < content.length; i += Math.max(1, chunkSize)) {
    chunks.push(frame({ content: content.slice(i, i + chunkSize) }));
  }
  chunks.push(
    frame({}, 'stop', {
      usage: { completion_tokens: 50, prompt_tokens: 10, total_tokens: 60 },
    }),
    'data: [DONE]\n\n',
  );
  return chunks;
};

const handleChatCompletion = async (req: IncomingMessage, res: ServerResponse) => {
  const body = JSON.parse((await readBody(req)) || '{}') as {
    messages?: { content?: unknown; role?: string }[];
    model?: string;
    stream?: boolean;
  };
  const reply = resolveReply(body.messages ?? []);
  const model = body.model || 'mock-model';

  if (body.stream === false) {
    await sleep(reply.responseDelay);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        choices: [
          {
            finish_reason: 'stop',
            index: 0,
            message: { content: reply.response, role: 'assistant' },
          },
        ],
        created: Math.floor(Date.now() / 1000),
        id: `chatcmpl-e2e-${Date.now()}`,
        model,
        object: 'chat.completion',
        usage: { completion_tokens: 50, prompt_tokens: 10, total_tokens: 60 },
      }),
    );
    return;
  }

  res.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
  });
  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  await sleep(reply.responseDelay);
  const chunks = buildOpenAIChunks(reply.response, reply.streamChunkSize, model);
  for (let index = 0; index < chunks.length && !closed; index += 1) {
    res.write(chunks[index]);
    if (index < chunks.length - 1) await sleep(reply.streamDelay);
  }
  res.end();
};

const handleRegister = async (req: IncomingMessage, res: ServerResponse) => {
  const payload = JSON.parse((await readBody(req)) || '{}') as {
    clear?: string[];
    defaultReply?: Registry['defaultReply'];
    owner?: string;
    replies?: LLMMockReply[];
  };
  const owner = payload.owner ?? WORKER_ID;
  // Workers share this endpoint: a clear only releases the caller's hold, so
  // one worker's cleanup cannot drop a reply another worker is still using.
  for (const key of payload.clear ?? []) {
    const owners = registry.owners.get(key);
    owners?.delete(owner);
    if (!owners?.size) {
      registry.owners.delete(key);
      registry.replies.delete(key);
    }
  }
  if (payload.defaultReply) registry.defaultReply = payload.defaultReply;
  for (const reply of payload.replies ?? []) {
    const key = `${reply.match}:${reply.key}`;
    registry.replies.set(key, reply);
    registry.owners.set(key, (registry.owners.get(key) ?? new Set()).add(owner));
  }
  res.writeHead(204);
  res.end();
};

const handle = async (req: IncomingMessage, res: ServerResponse) => {
  const path = new URL(req.url ?? '/', LLM_MOCK_URL).pathname;

  try {
    if (req.method === 'POST' && path.endsWith('/chat/completions'))
      return await handleChatCompletion(req, res);
    if (req.method === 'POST' && path === '/__e2e/llm/replies')
      return await handleRegister(req, res);
    if (req.method === 'GET' && path.endsWith('/models')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: [], object: 'list' }));
      return;
    }
    if (req.method === 'POST' && path === '/__e2e/shutdown') {
      res.writeHead(204);
      res.end(() => process.exit(0));
      return;
    }
    if (req.method === 'GET' && path === '/__e2e/health') {
      res.writeHead(200);
      res.end('ok');
      return;
    }
    res.writeHead(404);
    res.end();
  } catch (error) {
    console.error('[llm-mock] request failed:', error);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
};

const IDLE_MS = Number(process.env.E2E_LLM_MOCK_IDLE_MS || 10 * 60_000);

/**
 * Serve the endpoint in the current process (the body of `./serve.ts`). Exits
 * the process after `E2E_LLM_MOCK_IDLE_MS` without requests, and quietly when
 * another process already owns the port.
 */
export const serveLLMMock = () => {
  let idleTimer: NodeJS.Timeout | undefined;
  const armIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => process.exit(0), IDLE_MS);
  };
  const server = createServer((req, res) => {
    armIdle();
    void handle(req, res);
  });
  server.once('error', (error: NodeJS.ErrnoException) => {
    process.exit(error.code === 'EADDRINUSE' ? 0 : 1);
  });
  server.listen(LLM_MOCK_PORT, '127.0.0.1', armIdle);
};

const isServing = async () => {
  try {
    return (await fetch(`${LLM_MOCK_URL}/__e2e/health`)).ok;
  } catch {
    return false;
  }
};

const spawnMockProcess = () => {
  const require = createRequire(path.join(process.cwd(), 'noop.js'));
  const child = spawn(
    process.execPath,
    ['--import', pathToFileURL(require.resolve('tsx/esm')).href, path.join(__dirname, 'serve.ts')],
    { detached: true, env: process.env, stdio: 'ignore' },
  );
  child.unref();
};

let starting: Promise<void> | undefined;

/**
 * Make sure the shared endpoint is up, starting its process when nobody
 * serves the port yet. Safe to call from every worker: concurrent starters
 * race for the port and the losers exit.
 */
export const ensureLLMMockServer = (): Promise<void> => {
  starting ??= (async () => {
    if (await isServing()) return;
    spawnMockProcess();
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (await isServing()) {
        console.log(`   ✓ LLM mock endpoint listening on ${LLM_MOCK_URL}`);
        return;
      }
      await sleep(150);
    }
    throw new Error(`LLM mock endpoint did not start on ${LLM_MOCK_URL}`);
  })().catch((error) => {
    starting = undefined;
    throw error;
  });
  return starting;
};

/** Send replies (and the default) to the shared endpoint. */
export const registerLLMReplies = async (payload: {
  clear?: string[];
  defaultReply?: Registry['defaultReply'];
  replies?: LLMMockReply[];
}) => {
  await ensureLLMMockServer();
  const res = await fetch(`${LLM_MOCK_URL}/__e2e/llm/replies`, {
    body: JSON.stringify({ ...payload, owner: WORKER_ID }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  if (!res.ok) throw new Error(`LLM mock registration failed: ${res.status}`);
};
