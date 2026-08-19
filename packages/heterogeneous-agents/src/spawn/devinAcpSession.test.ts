import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import type { AgentStreamEvent } from '@lobechat/agent-gateway-client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AskUserBridge } from '../askUser/AskUserBridge';
import { AcpRpcResponseError } from './acpStdioClient';
import {
  buildDevinAcpArgs,
  buildDevinAcpPrompt,
  DevinAcpSession,
  type DevinAcpSessionOptions,
  isDevinAcpSessionNotFoundError,
} from './devinAcpSession';

const { spawnMock } = vi.hoisted(() => ({ spawnMock: vi.fn() }));

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, spawn: spawnMock };
});

interface RpcMessage {
  error?: { code: number; data?: unknown; message: string };
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
}

const createAcpProcess = ({
  initializeResult,
  loadError,
  permissionRequest = false,
}: {
  initializeResult?: Record<string, unknown>;
  loadError?: { code: number; data?: unknown; message: string };
  permissionRequest?: boolean;
} = {}) => {
  const child = new EventEmitter() as ChildProcess;
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const requests: RpcMessage[] = [];
  let promptRequest: RpcMessage | undefined;
  const send = (message: Record<string, unknown>) =>
    stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`);

  Object.assign(child, {
    kill: vi.fn(() => true),
    killed: false,
    pid: 987_654,
    stderr,
    stdin: {
      once: vi.fn(),
      write: vi.fn((chunk: string) => {
        const message = JSON.parse(chunk.trim()) as RpcMessage;
        requests.push(message);
        queueMicrotask(() => {
          switch (message.method) {
            case 'initialize': {
              send({
                id: message.id,
                result:
                  initializeResult ??
                  ({
                    agentCapabilities: {
                      loadSession: true,
                      promptCapabilities: { image: true },
                    },
                    authMethods: [{ id: 'devin-browser', name: 'Log in with browser' }],
                    protocolVersion: 1,
                  } satisfies Record<string, unknown>),
              });
              return;
            }
            case 'authenticate': {
              send({ id: message.id, result: {} });
              return;
            }
            case 'session/new': {
              send({
                id: message.id,
                result: {
                  configOptions: [
                    {
                      category: 'model',
                      currentValue: 'claude-sonnet-4-6-thinking',
                      id: 'model',
                      name: 'Model',
                    },
                  ],
                  sessionId: 'devin-session-1',
                },
              });
              return;
            }
            case 'session/load': {
              send(
                loadError ? { error: loadError, id: message.id } : { id: message.id, result: {} },
              );
              return;
            }
            case 'session/prompt': {
              promptRequest = message;
              send({
                method: 'session/update',
                params: {
                  sessionId: 'devin-session-1',
                  update: {
                    _meta: { 'cognition.ai/inferenceToolName': 'exec' },
                    kind: 'execute',
                    rawInput: { command: 'pwd' },
                    sessionUpdate: 'tool_call',
                    title: 'Ran command',
                    toolCallId: 'tool-1',
                  },
                },
              });
              send({
                method: 'session/update',
                params: {
                  sessionId: 'devin-session-1',
                  update: {
                    content: [{ content: { text: '/workspace', type: 'text' }, type: 'content' }],
                    sessionUpdate: 'tool_call_update',
                    status: 'completed',
                    toolCallId: 'tool-1',
                  },
                },
              });
              send({
                method: 'session/update',
                params: {
                  sessionId: 'devin-session-1',
                  update: {
                    content: { text: 'Done', type: 'text' },
                    sessionUpdate: 'agent_message_chunk',
                  },
                },
              });
              if (permissionRequest) {
                send({
                  id: 'permission-1',
                  method: 'session/request_permission',
                  params: {
                    options: [
                      { kind: 'allow_once', name: 'Allow', optionId: 'allow_once' },
                      {
                        kind: 'allow_always',
                        name: 'Allow for this session',
                        optionId: 'allow_session',
                      },
                      { kind: 'reject_once', name: 'Reject', optionId: 'reject_once' },
                    ],
                    sessionId: 'devin-session-1',
                    toolCall: {
                      _meta: { 'cognition.ai/editableCommand': 'printf test' },
                      toolCallId: 'tool-1',
                    },
                  },
                });
              } else {
                send({ id: message.id, result: { stopReason: 'end_turn' } });
              }
              return;
            }
          }

          if (message.id === 'permission-1' && message.result && promptRequest) {
            send({ id: promptRequest.id, result: { stopReason: 'end_turn' } });
          }
        });
        return true;
      }),
    },
    stdout,
  });

  return { child, requests };
};

const createSessionOptions = (
  overrides: Partial<DevinAcpSessionOptions> = {},
): DevinAcpSessionOptions => ({
  args: ['--model', 'sonnet'],
  clientVersion: '1.2.3',
  commandPath: 'devin',
  cwd: '/workspace',
  env: process.env,
  onEvents: vi.fn(),
  onModel: vi.fn(),
  onRawMessage: vi.fn(),
  onRuntimeStatus: vi.fn(),
  onSessionId: vi.fn(),
  onStderr: vi.fn(),
  operationId: 'operation-1',
  prompt: [{ text: 'hello', type: 'text' }],
  sessionId: 'session-1',
  ...overrides,
});

afterEach(() => {
  vi.restoreAllMocks();
  spawnMock.mockReset();
});

describe('Devin ACP helpers', () => {
  it('places the ACP subcommand before provider arguments', () => {
    expect(buildDevinAcpArgs(['--model', 'sonnet'])).toEqual(['acp', '--model', 'sonnet']);
  });

  it('builds text and image prompt blocks', async () => {
    await expect(
      buildDevinAcpPrompt([
        { text: 'inspect this', type: 'text' },
        {
          source: { data: 'aGVsbG8=', mediaType: 'image/png', type: 'base64' },
          type: 'image',
        },
      ]),
    ).resolves.toEqual([
      { text: 'inspect this', type: 'text' },
      { data: 'aGVsbG8=', mimeType: 'image/png', type: 'image' },
    ]);
  });

  it('recognizes Devin session-not-found RPC errors', () => {
    expect(
      isDevinAcpSessionNotFoundError(
        new AcpRpcResponseError('session/load', {
          code: -32_016,
          data: { 'cognition.ai/errorKind': 'session_not_found' },
          message: 'Session not found',
        }),
      ),
    ).toBe(true);
    expect(
      isDevinAcpSessionNotFoundError(
        new AcpRpcResponseError('session/prompt', {
          code: -32_016,
          message: 'Session not found',
        }),
      ),
    ).toBe(false);
  });
});

describe('DevinAcpSession', () => {
  it('authenticates, starts a session, normalizes tools, and streams the response', async () => {
    const fake = createAcpProcess();
    spawnMock.mockReturnValue(fake.child);
    vi.spyOn(process, 'kill').mockImplementation(() => true);
    const options = createSessionOptions();
    const events: AgentStreamEvent[] = [];
    options.onEvents = (batch) => {
      events.push(...batch);
    };

    await new DevinAcpSession(options).run();

    expect(spawnMock).toHaveBeenCalledWith(
      'devin',
      ['acp', '--model', 'sonnet'],
      expect.objectContaining({ cwd: '/workspace', stdio: ['pipe', 'pipe', 'pipe'] }),
    );
    expect(fake.requests.map(({ method }) => method).filter(Boolean)).toEqual([
      'initialize',
      'authenticate',
      'session/new',
      'session/prompt',
    ]);
    expect(options.onSessionId).toHaveBeenCalledWith('devin-session-1');
    expect(options.onModel).toHaveBeenCalledWith('claude-sonnet-4-6-thinking');
    expect(events).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          toolCalling: expect.objectContaining({ apiName: 'exec', id: 'tool-1' }),
        }),
        type: 'tool_start',
      }),
    );
    expect(events).toContainEqual(
      expect.objectContaining({
        data: { chunkType: 'text', content: 'Done' },
        type: 'stream_chunk',
      }),
    );
    expect(events).toContainEqual(expect.objectContaining({ type: 'agent_runtime_end' }));
    expect(options.onRuntimeStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: 'closed', transport: 'devin-acp' }),
    );
  });

  it('loads a saved session and preserves the structured not-found error', async () => {
    const success = createAcpProcess();
    spawnMock.mockReturnValueOnce(success.child);
    vi.spyOn(process, 'kill').mockImplementation(() => true);
    const options = createSessionOptions({ resumeSessionId: 'saved-session' });

    await new DevinAcpSession(options).run();

    expect(success.requests.find(({ method }) => method === 'session/load')?.params).toEqual({
      cwd: '/workspace',
      mcpServers: [],
      sessionId: 'saved-session',
    });
    expect(options.onSessionId).toHaveBeenCalledWith('saved-session');

    const missing = createAcpProcess({
      loadError: {
        code: -32_016,
        data: { 'cognition.ai/errorKind': 'session_not_found' },
        message: 'Session not found',
      },
    });
    spawnMock.mockReturnValueOnce(missing.child);

    await expect(
      new DevinAcpSession(createSessionOptions({ resumeSessionId: 'missing-session' })).run(),
    ).rejects.toSatisfy(isDevinAcpSessionNotFoundError);
    expect(missing.requests.some(({ method }) => method === 'session/prompt')).toBe(false);
  });

  it('requires an explicit user choice before granting permission', async () => {
    const fake = createAcpProcess({ permissionRequest: true });
    spawnMock.mockReturnValue(fake.child);
    vi.spyOn(process, 'kill').mockImplementation(() => true);
    const bridge = new AskUserBridge('operation-1');
    const run = new DevinAcpSession(createSessionOptions({ askUserBridge: bridge })).run();
    const intervention = await bridge.events()[Symbol.asyncIterator]().next();

    expect(intervention.value).toMatchObject({
      data: {
        apiName: 'askUserQuestion',
        toolCallId: 'devin-permission-permission-1-tool-1',
      },
      type: 'agent_intervention_request',
    });
    expect(JSON.parse(intervention.value!.data.arguments)).toEqual({
      questions: [
        {
          header: 'Permission required',
          multiSelect: false,
          options: [{ label: 'Allow' }, { label: 'Allow for this session' }, { label: 'Reject' }],
          question: 'printf test',
        },
      ],
    });
    bridge.resolve(intervention.value!.data.toolCallId, {
      result: { 'printf test': 'Allow for this session' },
    });
    await run;

    expect(fake.requests.find(({ id }) => id === 'permission-1')?.result).toEqual({
      outcome: { optionId: 'allow_session', outcome: 'selected' },
    });
  });

  it('cancels permission requests when no intervention bridge is available', async () => {
    const fake = createAcpProcess({ permissionRequest: true });
    spawnMock.mockReturnValue(fake.child);
    vi.spyOn(process, 'kill').mockImplementation(() => true);

    await new DevinAcpSession(createSessionOptions()).run();

    expect(fake.requests.find(({ id }) => id === 'permission-1')?.result).toEqual({
      outcome: { outcome: 'cancelled' },
    });
  });
});
