import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { enqueueAgentSignalSourceEvent } from '@/server/services/agentSignal';

import { selfFeedbackIntentRuntime } from '../selfFeedbackIntent';

vi.mock('@/server/services/agentSignal', () => ({
  enqueueAgentSignalSourceEvent: vi.fn(),
}));

const counters = new Map<string, number>();
const redis = {
  decr: vi.fn(async (key: string) => {
    const next = (counters.get(key) ?? 0) - 1;
    counters.set(key, next);
    return next;
  }),
  expire: vi.fn(async () => 1),
  incr: vi.fn(async (key: string) => {
    const next = (counters.get(key) ?? 0) + 1;
    counters.set(key, next);
    return next;
  }),
};

interface AgentSignalRedisTestGlobal {
  __agentSignalRedisClient?: typeof redis | null;
}

const createInput = () => ({
  action: 'refine' as const,
  confidence: 0.91,
  evidenceRefs: [{ id: 'msg-1', type: 'message' as const }],
  kind: 'skill' as const,
  reason: 'The release workflow correction should become reusable.',
  summary: 'Refine the release workflow skill.',
});

describe('selfFeedbackIntentRuntime', () => {
  afterEach(() => {
    (globalThis as AgentSignalRedisTestGlobal).__agentSignalRedisClient = undefined;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    counters.clear();
    (globalThis as AgentSignalRedisTestGlobal).__agentSignalRedisClient = redis;
    vi.mocked(enqueueAgentSignalSourceEvent).mockResolvedValue({
      accepted: true,
      scopeKey: 'topic:topic-1',
      workflowRunId: 'workflow-1',
    });
  });

  /**
   * @example
   * The runtime accepts a declaration through the enqueue boundary without mutating resources.
   */
  it('calls the enqueue boundary and returns accepted JSON content', async () => {
    const runtime = selfFeedbackIntentRuntime.factory({ toolManifestMap: {} });

    const result = await runtime.declareSelfFeedbackIntent(createInput(), {
      agentId: 'agent-1',
      operationId: 'operation-1',
      toolCallId: 'tool-call-1',
      toolManifestMap: {},
      topicId: 'topic-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    expect(JSON.parse(result.content)).toEqual({
      accepted: true,
      reason: null,
      sourceId: 'self-feedback-intent:user-1:agent-1:operation:operation-1:tool-call-1',
      strength: 'strong',
    });
    expect(enqueueAgentSignalSourceEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          agentId: 'agent-1',
          operationId: 'operation-1',
          toolCallId: 'tool-call-1',
          topicId: 'topic-1',
          userId: 'user-1',
        }),
        sourceId: 'self-feedback-intent:user-1:agent-1:operation:operation-1:tool-call-1',
        sourceType: 'agent.self_feedback_intent.declared',
      }),
      { agentId: 'agent-1', userId: 'user-1' },
    );
  });

  /**
   * @example
   * Missing runtime identity context returns a tool failure instead of enqueueing a source.
   */
  it('returns failure content when required context is missing', async () => {
    const runtime = selfFeedbackIntentRuntime.factory({ toolManifestMap: {} });

    const result = await runtime.declareSelfFeedbackIntent(createInput(), {
      agentId: 'agent-1',
      toolManifestMap: {},
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    expect(JSON.parse(result.content)).toEqual({
      accepted: false,
      reason: 'missing_context',
      required: ['agentId', 'userId', 'topicId'],
    });
    expect(enqueueAgentSignalSourceEvent).not.toHaveBeenCalled();
  });

  /**
   * @example
   * Rejected declarations still return a successful tool result so the agent can continue.
   */
  it('returns success true with accepted false for rejected service results', async () => {
    const runtime = selfFeedbackIntentRuntime.factory({ toolManifestMap: {} });

    const result = await runtime.declareSelfFeedbackIntent(
      { ...createInput(), confidence: 1.25 },
      {
        agentId: 'agent-1',
        toolManifestMap: {},
        topicId: 'topic-1',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(true);
    expect(JSON.parse(result.content)).toEqual({
      accepted: false,
      reason: 'invalid_confidence',
      sourceId: null,
      strength: 'weak',
    });
    expect(enqueueAgentSignalSourceEvent).not.toHaveBeenCalled();
  });

  /**
   * @example
   * The fourth accepted declaration across runtime factory calls returns rate_limited.
   */
  it('preserves declaration rate-limit state across runtime factory calls', async () => {
    for (const toolCallId of ['tool-call-1', 'tool-call-2', 'tool-call-3']) {
      const runtime = selfFeedbackIntentRuntime.factory({ toolManifestMap: {} });

      await expect(
        runtime.declareSelfFeedbackIntent(createInput(), {
          agentId: 'agent-1',
          toolCallId,
          toolManifestMap: {},
          topicId: 'topic-rate-limit',
          userId: 'user-1',
        }),
      ).resolves.toMatchObject({ success: true });
    }

    const runtime = selfFeedbackIntentRuntime.factory({ toolManifestMap: {} });
    const result = await runtime.declareSelfFeedbackIntent(createInput(), {
      agentId: 'agent-1',
      toolCallId: 'tool-call-4',
      toolManifestMap: {},
      topicId: 'topic-rate-limit',
      userId: 'user-1',
    });

    expect(JSON.parse(result.content)).toEqual({
      accepted: false,
      reason: 'rate_limited',
      sourceId: null,
      strength: 'strong',
    });
    expect(enqueueAgentSignalSourceEvent).toHaveBeenCalledTimes(3);
  });

  /**
   * @example
   * The declaration limit is read from Redis, so it holds across server processes.
   */
  it('enforces the declaration limit from the shared Redis counter', async () => {
    counters.set('agent-signal:declaration-limit:user-1:agent-1:topic:topic-shared', 3);
    const runtime = selfFeedbackIntentRuntime.factory({ toolManifestMap: {} });

    const result = await runtime.declareSelfFeedbackIntent(createInput(), {
      agentId: 'agent-1',
      toolCallId: 'tool-call-from-another-process',
      toolManifestMap: {},
      topicId: 'topic-shared',
      userId: 'user-1',
    });

    expect(JSON.parse(result.content)).toMatchObject({ accepted: false, reason: 'rate_limited' });
    expect(enqueueAgentSignalSourceEvent).not.toHaveBeenCalled();
  });

  /**
   * @example
   * Without Redis the limit cannot be enforced, so declarations are rejected (fail closed).
   */
  it('rejects declarations when Redis is unavailable', async () => {
    (globalThis as AgentSignalRedisTestGlobal).__agentSignalRedisClient = null;
    const runtime = selfFeedbackIntentRuntime.factory({ toolManifestMap: {} });

    const result = await runtime.declareSelfFeedbackIntent(createInput(), {
      agentId: 'agent-1',
      toolCallId: 'tool-call-no-redis',
      toolManifestMap: {},
      topicId: 'topic-no-redis',
      userId: 'user-1',
    });

    expect(JSON.parse(result.content)).toMatchObject({ accepted: false, reason: 'rate_limited' });
    expect(enqueueAgentSignalSourceEvent).not.toHaveBeenCalled();
  });
});
