import { describe, expect, it, vi } from 'vitest';

import { StreamEventManager } from '../StreamEventManager';

// Mock Redis client
const mockRedis = {
  del: vi.fn(),
  expire: vi.fn(),
  keys: vi.fn(),
  quit: vi.fn(),
  xadd: vi.fn(),
  xread: vi.fn(),
  xrevrange: vi.fn(),
};

vi.mock('@/libs/redis', () => ({
  getRedisClient: () => mockRedis,
}));

describe('StreamEventManager', () => {
  let streamManager: StreamEventManager;

  beforeEach(() => {
    vi.clearAllMocks();
    streamManager = new StreamEventManager();
  });

  describe('publishAgentRuntimeInit', () => {
    it('should publish agent runtime init event with correct data', async () => {
      const sessionId = 'test-session-id';
      const metadata = {
        agentConfig: { test: true },
        createdAt: '2024-01-01T00:00:00.000Z',
        modelRuntimeConfig: { model: 'gpt-4' },
        status: 'idle',
        totalCost: 0,
        totalSteps: 0,
        userId: 'user-123',
      };

      mockRedis.xadd.mockResolvedValue('event-id-123');

      const result = await streamManager.publishAgentRuntimeInit(sessionId, metadata);

      expect(result).toBe('event-id-123');
      expect(mockRedis.xadd).toHaveBeenCalledWith(
        `agent_runtime_stream:${sessionId}`,
        'MAXLEN',
        '~',
        '1000',
        '*',
        'type',
        'agent_runtime_init',
        'stepIndex',
        '0',
        'sessionId',
        sessionId,
        'data',
        JSON.stringify(metadata),
        'timestamp',
        expect.any(String),
      );
    });
  });

  describe('publishAgentRuntimeEnd', () => {
    it('should publish agent runtime end event with correct data', async () => {
      const sessionId = 'test-session-id';
      const stepIndex = 5;
      const finalState = {
        cost: { total: 100 },
        status: 'done',
        stepCount: 5,
      };

      mockRedis.xadd.mockResolvedValue('event-id-456');

      const result = await streamManager.publishAgentRuntimeEnd(sessionId, stepIndex, finalState);

      expect(result).toBe('event-id-456');
      expect(mockRedis.xadd).toHaveBeenCalledWith(
        `agent_runtime_stream:${sessionId}`,
        'MAXLEN',
        '~',
        '1000',
        '*',
        'type',
        'agent_runtime_end',
        'stepIndex',
        '5',
        'sessionId',
        sessionId,
        'data',
        JSON.stringify({
          finalState,
          phase: 'execution_complete',
          reason: 'completed',
          reasonDetail: 'Agent runtime completed successfully',
          sessionId,
        }),
        'timestamp',
        expect.any(String),
      );
    });

    it('should accept custom reason and reasonDetail', async () => {
      const sessionId = 'test-session-id';
      const stepIndex = 3;
      const finalState = { status: 'error' };
      const reason = 'error';
      const reasonDetail = 'Agent failed due to timeout';

      mockRedis.xadd.mockResolvedValue('event-id-789');

      await streamManager.publishAgentRuntimeEnd(
        sessionId,
        stepIndex,
        finalState,
        reason,
        reasonDetail,
      );

      expect(mockRedis.xadd).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        sessionId,
        'data',
        JSON.stringify({
          finalState,
          phase: 'execution_complete',
          reason,
          reasonDetail,
          sessionId,
        }),
        expect.any(String),
        expect.any(String),
      );
    });
  });
});
