// @vitest-environment node
import { LobeChatDatabase } from '@lobechat/database';
import { agents, chatGroups, sessions, threads, topics } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { ThreadStatus, ThreadType } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiAgentRouter } from '../aiAgent';
import { cleanupTestUser, createTestUser } from './integration/setup';

// Mock getServerDB to return our test database instance
let testDB: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(() => testDB),
}));

// Mock AgentRuntimeService
const mockGetOperationStatus = vi.fn();
vi.mock('@/server/services/agentRuntime', () => ({
  AgentRuntimeService: vi.fn().mockImplementation(() => ({
    getOperationStatus: mockGetOperationStatus,
  })),
}));

// Mock AiAgentService
vi.mock('@/server/services/aiAgent', () => ({
  AiAgentService: vi.fn().mockImplementation(() => ({})),
}));

// Mock AiChatService
vi.mock('@/server/services/aiChat', () => ({
  AiChatService: vi.fn().mockImplementation(() => ({})),
}));

describe('aiAgentRouter.getTaskStatus', () => {
  let serverDB: LobeChatDatabase;
  let userId: string;
  let testAgentId: string;
  let testGroupId: string;
  let testTopicId: string;
  let testThreadId: string;

  beforeEach(async () => {
    serverDB = await getTestDB();
    testDB = serverDB;
    userId = await createTestUser(serverDB);

    // Create test agent
    const [agent] = await serverDB
      .insert(agents)
      .values({
        userId,
        title: 'Test SubAgent',
        model: 'gpt-4o-mini',
        provider: 'openai',
        systemRole: 'You are a helpful assistant.',
      })
      .returning();
    testAgentId = agent.id;

    // Create test session
    const [session] = await serverDB.insert(sessions).values({ userId, type: 'group' }).returning();

    // Create test group
    const [group] = await serverDB
      .insert(chatGroups)
      .values({
        userId,
        title: 'Test Group',
      })
      .returning();
    testGroupId = group.id;

    // Create test topic
    const [topic] = await serverDB
      .insert(topics)
      .values({
        userId,
        title: 'Test Topic',
        agentId: testAgentId,
        sessionId: session.id,
        groupId: testGroupId,
      })
      .returning();
    testTopicId = topic.id;

    // Create test thread with operationId in metadata
    const [thread] = (await serverDB
      .insert(threads)
      .values({
        userId,
        agentId: testAgentId,
        topicId: testTopicId,
        groupId: testGroupId,
        sourceMessageId: 'source-msg-1',
        type: ThreadType.Isolation,
        status: ThreadStatus.Processing,
        metadata: { operationId: 'op-test-123' },
      })
      .returning()) as any[];
    testThreadId = thread.id;

    // Reset mock
    mockGetOperationStatus.mockReset();
  });

  afterEach(async () => {
    await cleanupTestUser(serverDB, userId);
    vi.clearAllMocks();
  });

  const createTestContext = () => ({
    userId,
    jwtPayload: { userId },
  });

  describe('query by threadId', () => {
    it('should return task status when queried by threadId', async () => {
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'running',
          stepCount: 3,
          cost: { total: 0.05 },
          usage: { total_tokens: 1000 },
        },
        isCompleted: false,
        hasError: false,
        metadata: {},
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.getTaskStatus({
        threadId: testThreadId,
      });

      expect(result.status).toBe('processing');
      expect(result.stepCount).toBe(3);
      expect(result.cost).toEqual({ total: 0.05 });
      expect(mockGetOperationStatus).toHaveBeenCalledWith({
        operationId: 'op-test-123',
      });
    });

    it('should throw NOT_FOUND when thread does not exist', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      await expect(
        caller.getTaskStatus({
          threadId: 'non-existent-thread-id',
        }),
      ).rejects.toThrow('Thread not found');
    });

    it('should throw NOT_FOUND when thread has no operationId', async () => {
      // Create a thread without operationId
      const [threadWithoutOp] = (await serverDB
        .insert(threads)
        .values({
          userId,
          agentId: testAgentId,
          topicId: testTopicId,
          groupId: testGroupId,
          sourceMessageId: 'source-msg-2',
          type: ThreadType.Isolation,
          status: ThreadStatus.Active,
          metadata: {},
        })
        .returning()) as any[];

      const caller = aiAgentRouter.createCaller(createTestContext());

      await expect(
        caller.getTaskStatus({
          threadId: threadWithoutOp.id,
        }),
      ).rejects.toThrow('Operation ID not found in thread');
    });
  });

  describe('query by operationId', () => {
    it('should return task status when queried by operationId directly', async () => {
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'done',
          stepCount: 5,
          cost: { total: 0.1 },
          usage: { total_tokens: 2000 },
        },
        isCompleted: true,
        hasError: false,
        metadata: { lastActiveAt: '2024-01-01T00:00:00Z' },
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.getTaskStatus({
        operationId: 'op-direct-query',
      });

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBe('2024-01-01T00:00:00Z');
      expect(mockGetOperationStatus).toHaveBeenCalledWith({
        operationId: 'op-direct-query',
      });
    });

    it('should throw NOT_FOUND when operation does not exist', async () => {
      mockGetOperationStatus.mockRejectedValue(new Error('Operation not found'));

      const caller = aiAgentRouter.createCaller(createTestContext());

      await expect(
        caller.getTaskStatus({
          operationId: 'non-existent-op',
        }),
      ).rejects.toThrow('Operation not found: non-existent-op');
    });
  });

  describe('status mapping', () => {
    it.each([
      ['idle', 'processing'],
      ['running', 'processing'],
      ['waiting_for_human', 'processing'],
      ['done', 'completed'],
      ['error', 'failed'],
      ['interrupted', 'cancel'],
    ])(
      'should map operation status "%s" to task status "%s"',
      async (opStatus, expectedTaskStatus) => {
        mockGetOperationStatus.mockResolvedValue({
          currentState: {
            status: opStatus,
            stepCount: 1,
          },
          isCompleted: opStatus === 'done',
          hasError: opStatus === 'error',
          metadata: opStatus === 'done' ? { lastActiveAt: '2024-01-01T00:00:00Z' } : {},
        });

        const caller = aiAgentRouter.createCaller(createTestContext());

        const result = await caller.getTaskStatus({
          operationId: 'op-status-test',
        });

        expect(result.status).toBe(expectedTaskStatus);
      },
    );
  });

  describe('error handling', () => {
    it('should include error message when operation has error', async () => {
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'error',
          stepCount: 2,
          error: 'Tool execution failed',
        },
        isCompleted: false,
        hasError: true,
        metadata: {},
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.getTaskStatus({
        operationId: 'op-error-test',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Tool execution failed');
    });
  });

  describe('thread status sync', () => {
    it('should update thread status when task completes', async () => {
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'done',
          stepCount: 5,
        },
        isCompleted: true,
        hasError: false,
        metadata: { lastActiveAt: '2024-01-01T00:00:00Z' },
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      await caller.getTaskStatus({
        threadId: testThreadId,
      });

      // Verify thread status was updated
      const [updatedThread] = await serverDB
        .select()
        .from(threads)
        .where(eq(threads.id, testThreadId));

      expect(updatedThread.status).toBe(ThreadStatus.Completed);
      expect(updatedThread.metadata?.completedAt).toBeDefined();
    });

    it('should update thread status to failed when task fails', async () => {
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'error',
          stepCount: 2,
          error: 'Agent crashed',
        },
        isCompleted: false,
        hasError: true,
        metadata: {},
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      await caller.getTaskStatus({
        threadId: testThreadId,
      });

      // Verify thread status was updated
      const [updatedThread] = await serverDB
        .select()
        .from(threads)
        .where(eq(threads.id, testThreadId));

      expect(updatedThread.status).toBe(ThreadStatus.Failed);
      expect(updatedThread.metadata?.error).toBe('Agent crashed');
    });

    it('should update thread status to cancel when task is interrupted', async () => {
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'interrupted',
          stepCount: 1,
        },
        isCompleted: false,
        hasError: false,
        metadata: {},
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      await caller.getTaskStatus({
        threadId: testThreadId,
      });

      // Verify thread status was updated
      const [updatedThread] = await serverDB
        .select()
        .from(threads)
        .where(eq(threads.id, testThreadId));

      expect(updatedThread.status).toBe(ThreadStatus.Cancel);
    });

    it('should not update thread status when queried by operationId only', async () => {
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'done',
          stepCount: 5,
        },
        isCompleted: true,
        hasError: false,
        metadata: { lastActiveAt: '2024-01-01T00:00:00Z' },
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      await caller.getTaskStatus({
        operationId: 'op-test-123',
      });

      // Thread status should remain unchanged
      const [thread] = await serverDB.select().from(threads).where(eq(threads.id, testThreadId));

      expect(thread.status).toBe(ThreadStatus.Processing);
    });
  });

  describe('input validation', () => {
    it('should require at least one of threadId or operationId', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      await expect(caller.getTaskStatus({} as any)).rejects.toThrow();
    });
  });
});
