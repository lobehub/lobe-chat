// @vitest-environment node
import type { LlmExecuteData } from '@lobechat/agent-gateway-client';
import { AgentRuntimeErrorType } from '@lobechat/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { llmRelayChunks } from '@/server/router-hono/agent/handlers/llmRelay';

import { LLM_RELAY_LEASE_HEADER } from '../protocol';
import { RelayModelRuntime } from '../RelayModelRuntime';
import { FakeRedis } from './fakeRedis';

let redis: FakeRedis;

vi.mock('@/server/modules/AgentRuntime/redis', () => ({
  getAgentRuntimeRedisClient: () => redis,
}));

const CALL_ID = 'op_1:0:g1:1';

const createStreamManager = () => {
  const events: { data: any; type: string }[] = [];
  return {
    events,
    manager: {
      publishStreamEvent: vi.fn(async (_operationId: string, event: any) => {
        events.push(event);
        return 'event-id';
      }),
    } as any,
  };
};

const createRuntime = (streamManager: any) =>
  new RelayModelRuntime({
    attempt: 1,
    callId: CALL_ID,
    deadlines: { claimMs: 2000, firstChunkMs: 2000, idleMs: 2000, totalMs: 5000 },
    operationId: 'op_1',
    preferredClientId: 'tab-a',
    provider: 'ollama',
    redis: redis as any,
    runtimeProvider: 'ollama',
    stepIndex: 0,
    streamManager,
    userId: 'user-1',
  });

const waitForExecute = async (events: { data: any; type: string }[]) => {
  await vi.waitFor(() => expect(events.some((e) => e.type === 'llm_execute')).toBe(true));
  return events.find((e) => e.type === 'llm_execute')!.data as LlmExecuteData;
};

/** Play the device: upload one batch for the call. */
const post = (lease: string, body: unknown) =>
  llmRelayChunks({
    json: (value: unknown, status = 200) => Response.json(value, { status }),
    req: {
      header: (name: string) => (name === LLM_RELAY_LEASE_HEADER ? lease : undefined),
      param: (name: string) => (name === 'callId' ? CALL_ID : undefined),
      raw: new Request('http://localhost/chunks', { body: JSON.stringify(body), method: 'POST' }),
    },
  } as any);

describe('RelayModelRuntime.decide', () => {
  beforeEach(() => {
    vi.stubEnv('KEY_VAULTS_SECRET', 'test-secret');
    redis = new FakeRedis();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('emulates decide on one relayed generateObject call', async () => {
    const { events, manager } = createStreamManager();
    const runtime = createRuntime(manager);
    const decisionPayload = {
      model: 'llama3',
      questions: {
        tone: {
          criteria: { calm: 'Neutral', upset: 'Upset' },
          instructions: 'Tone?',
          type: 'choice' as const,
        },
      },
      state: 'Thanks, all good',
    };

    const result = runtime.decide(decisionPayload);
    const execute = await waitForExecute(events);
    expect(execute.method).toBe('generateObject');
    await post(execute.leaseToken, {
      chunks: [
        {
          data: JSON.stringify({ q0: { evidence: 'Polite thanks.', refused: false, value: 'c0' } }),
          type: 'result_part',
        },
      ],
      clientId: 'tab-a',
      final: { reason: 'done' },
      seq: 1,
    });

    await expect(result).resolves.toEqual({
      answers: { tone: { choice: 'calm', type: 'choice' } },
      model: 'llama3',
      providerMetadata: {
        lobehub: { decisionMode: 'emulated', evidence: { tone: 'Polite thanks.' } },
      },
    });
  });

  it('rejects decide output that fails validation without reusing its call id', async () => {
    const { events, manager } = createStreamManager();
    const runtime = createRuntime(manager);

    const result = runtime.decide({
      model: 'llama3',
      questions: {
        keep: { criteria: ['No', 'Yes'], instructions: 'Keep?', type: 'score' as const },
      },
      state: 'note',
    });
    const execute = await waitForExecute(events);
    await post(execute.leaseToken, {
      chunks: [
        {
          data: JSON.stringify({ q0: { evidence: '', refused: false, value: 5 } }),
          type: 'result_part',
        },
      ],
      clientId: 'tab-a',
      final: { reason: 'done' },
      seq: 1,
    });

    await expect(result).rejects.toMatchObject({
      error: { message: expect.stringContaining('Invalid decision response') },
      errorType: AgentRuntimeErrorType.ProviderBizError,
    });
    expect(events.filter((e) => e.type === 'llm_execute')).toHaveLength(1);
  });
});
