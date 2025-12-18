// @vitest-environment node
import { LobeChatDatabase } from '@lobechat/database';
import { agents, chatGroups, sessions, threads, topics } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { ThreadStatus, ThreadType } from '@lobechat/types';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiAgentRouter } from '../../aiAgent';
import { cleanupTestUser, createTestUser } from './setup';

// Mock getServerDB to return our test database instance
let testDB: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(() => testDB),
}));

// Mock isEnableAgent to always return true for tests
vi.mock('@/app/(backend)/api/agent/isEnableAgent', () => ({
  isEnableAgent: vi.fn(() => true),
}));

// Mock AiAgentService - controls task execution behavior
const mockExecGroupSubAgentTask = vi.fn();
vi.mock('@/server/services/aiAgent', () => ({
  AiAgentService: vi.fn().mockImplementation(() => ({
    execGroupSubAgentTask: mockExecGroupSubAgentTask,
  })),
}));

// Mock AgentRuntimeService - controls operation status
const mockGetOperationStatus = vi.fn();
vi.mock('@/server/services/agentRuntime', () => ({
  AgentRuntimeService: vi.fn().mockImplementation(() => ({
    getOperationStatus: mockGetOperationStatus,
  })),
}));

// Mock AiChatService
vi.mock('@/server/services/aiChat', () => ({
  AiChatService: vi.fn().mockImplementation(() => ({})),
}));

describe('Agent Task Integration', () => {
  let serverDB: LobeChatDatabase;
  let userId: string;
  let testAgentId: string;
  let testAgent2Id: string;
  let testGroupId: string;
  let testTopicId: string;

  beforeEach(async () => {
    serverDB = await getTestDB();
    testDB = serverDB;
    userId = await createTestUser(serverDB);

    // Create test agents
    const [agent1] = await serverDB
      .insert(agents)
      .values({
        userId,
        title: 'Test SubAgent 1',
        model: 'gpt-4o-mini',
        provider: 'openai',
        systemRole: 'You are a helpful assistant.',
      })
      .returning();
    testAgentId = agent1.id;

    const [agent2] = await serverDB
      .insert(agents)
      .values({
        userId,
        title: 'Test SubAgent 2',
        model: 'gpt-4o-mini',
        provider: 'openai',
        systemRole: 'You are another helpful assistant.',
      })
      .returning();
    testAgent2Id = agent2.id;

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

    // Reset mocks
    mockExecGroupSubAgentTask.mockReset();
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

  describe('complete task execution lifecycle', () => {
    it('should complete full task execution lifecycle', async () => {
      const threadId = 'thread-lifecycle-test';
      const operationId = 'op-lifecycle-test';

      // Setup: Create thread in DB to simulate service behavior
      await serverDB.insert(threads).values({
        id: threadId,
        userId,
        agentId: testAgentId,
        topicId: testTopicId,
        groupId: testGroupId,
        sourceMessageId: 'parent-msg-1',
        type: ThreadType.Isolation,
        status: ThreadStatus.Processing,
        metadata: { operationId },
      });

      // 1. Mock service to return success
      mockExecGroupSubAgentTask.mockResolvedValue({
        assistantMessageId: 'assistant-msg-1',
        operationId,
        success: true,
        threadId,
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      // Create task
      const createResult = await caller.execGroupSubAgentTask({
        agentId: testAgentId,
        groupId: testGroupId,
        instruction: 'Test instruction',
        parentMessageId: 'parent-msg-1',
        topicId: testTopicId,
      });

      expect(createResult.success).toBe(true);
      expect(createResult.threadId).toBe(threadId);
      expect(createResult.operationId).toBe(operationId);

      // 2. Query status (processing)
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'running',
          stepCount: 2,
        },
        isCompleted: false,
        hasError: false,
        metadata: {},
      });

      const processingStatus = await caller.getTaskStatus({
        threadId,
      });

      expect(processingStatus.status).toBe('processing');
      expect(processingStatus.stepCount).toBe(2);

      // 3. Simulate task completion
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'done',
          stepCount: 5,
          cost: { total: 0.05 },
          usage: { total_tokens: 1500 },
        },
        isCompleted: true,
        hasError: false,
        metadata: { lastActiveAt: '2024-01-01T12:00:00Z' },
      });

      const completedStatus = await caller.getTaskStatus({
        threadId,
      });

      expect(completedStatus.status).toBe('completed');
      expect(completedStatus.stepCount).toBe(5);
      expect(completedStatus.completedAt).toBe('2024-01-01T12:00:00Z');

      // 4. Verify Thread status was synced
      const [thread] = await serverDB.select().from(threads).where(eq(threads.id, threadId));

      expect(thread.status).toBe(ThreadStatus.Completed);
      expect(thread.metadata?.completedAt).toBeDefined();
    });
  });

  describe('task interrupt flow', () => {
    it('should interrupt running task', async () => {
      const threadId = 'thread-interrupt-test';
      const operationId = 'op-interrupt-test';

      // Setup: Create thread in DB
      await serverDB.insert(threads).values({
        id: threadId,
        userId,
        agentId: testAgentId,
        topicId: testTopicId,
        groupId: testGroupId,
        sourceMessageId: 'parent-msg-2',
        type: ThreadType.Isolation,
        status: ThreadStatus.Processing,
        metadata: { operationId },
      });

      // 1. Create task
      mockExecGroupSubAgentTask.mockResolvedValue({
        assistantMessageId: 'assistant-msg-2',
        operationId,
        success: true,
        threadId,
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      const createResult = await caller.execGroupSubAgentTask({
        agentId: testAgentId,
        groupId: testGroupId,
        instruction: 'Long running task',
        parentMessageId: 'parent-msg-2',
        topicId: testTopicId,
      });

      expect(createResult.success).toBe(true);

      // 2. Interrupt task
      const interruptResult = await caller.interruptTask({
        threadId,
      });

      expect(interruptResult.success).toBe(true);
      expect(interruptResult.threadId).toBe(threadId);

      // 3. Mock status to return interrupted
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'interrupted',
          stepCount: 1,
        },
        isCompleted: false,
        hasError: false,
        metadata: {},
      });

      const statusResult = await caller.getTaskStatus({
        threadId,
      });

      expect(statusResult.status).toBe('cancel');

      // 4. Verify Thread status
      const [thread] = await serverDB.select().from(threads).where(eq(threads.id, threadId));

      expect(thread.status).toBe(ThreadStatus.Cancel);
      expect(thread.metadata?.completedAt).toBeDefined();
    });
  });

  describe('task failure handling', () => {
    it('should handle task failure during creation', async () => {
      const threadId = 'thread-fail-test';
      const operationId = 'op-fail-test';

      // Setup: Create thread in DB with failed status
      await serverDB.insert(threads).values({
        id: threadId,
        userId,
        agentId: testAgentId,
        topicId: testTopicId,
        groupId: testGroupId,
        sourceMessageId: 'parent-msg-3',
        type: ThreadType.Isolation,
        status: ThreadStatus.Failed,
        metadata: { operationId, error: 'Agent execution failed' },
      });

      // Mock service to return failure
      mockExecGroupSubAgentTask.mockResolvedValue({
        assistantMessageId: 'assistant-msg-3',
        error: 'Agent execution failed',
        operationId,
        success: false,
        threadId,
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      const createResult = await caller.execGroupSubAgentTask({
        agentId: testAgentId,
        groupId: testGroupId,
        instruction: 'Failing task',
        parentMessageId: 'parent-msg-3',
        topicId: testTopicId,
      });

      expect(createResult.success).toBe(false);
      expect(createResult.error).toBe('Agent execution failed');
      expect(createResult.threadId).toBe(threadId);

      // Verify Thread status
      const [thread] = await serverDB.select().from(threads).where(eq(threads.id, threadId));

      expect(thread.status).toBe(ThreadStatus.Failed);
      expect(thread.metadata?.error).toBe('Agent execution failed');
    });

    it('should handle task failure during execution', async () => {
      const threadId = 'thread-exec-fail-test';
      const operationId = 'op-exec-fail-test';

      // Setup: Create thread in DB
      await serverDB.insert(threads).values({
        id: threadId,
        userId,
        agentId: testAgentId,
        topicId: testTopicId,
        groupId: testGroupId,
        sourceMessageId: 'parent-msg-4',
        type: ThreadType.Isolation,
        status: ThreadStatus.Processing,
        metadata: { operationId },
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      // Mock operation status to return error
      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'error',
          stepCount: 3,
          error: 'Tool execution timeout',
        },
        isCompleted: false,
        hasError: true,
        metadata: {},
      });

      const statusResult = await caller.getTaskStatus({
        threadId,
      });

      expect(statusResult.status).toBe('failed');
      expect(statusResult.error).toBe('Tool execution timeout');

      // Verify Thread status was synced
      const [thread] = await serverDB.select().from(threads).where(eq(threads.id, threadId));

      expect(thread.status).toBe(ThreadStatus.Failed);
      expect(thread.metadata?.error).toBe('Tool execution timeout');
    });
  });

  describe('concurrent task execution', () => {
    it('should handle concurrent task execution', async () => {
      const threadId1 = 'thread-concurrent-1';
      const threadId2 = 'thread-concurrent-2';
      const operationId1 = 'op-concurrent-1';
      const operationId2 = 'op-concurrent-2';

      // Setup: Create threads in DB
      await serverDB.insert(threads).values([
        {
          id: threadId1,
          userId,
          agentId: testAgentId,
          topicId: testTopicId,
          groupId: testGroupId,
          sourceMessageId: 'parent-msg-5',
          type: ThreadType.Isolation,
          status: ThreadStatus.Processing,
          metadata: { operationId: operationId1 },
        },
        {
          id: threadId2,
          userId,
          agentId: testAgent2Id,
          topicId: testTopicId,
          groupId: testGroupId,
          sourceMessageId: 'parent-msg-5',
          type: ThreadType.Isolation,
          status: ThreadStatus.Processing,
          metadata: { operationId: operationId2 },
        },
      ]);

      // Mock service to return different results for each call
      let callCount = 0;
      mockExecGroupSubAgentTask.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            assistantMessageId: 'assistant-msg-5',
            operationId: operationId1,
            success: true,
            threadId: threadId1,
          });
        }
        return Promise.resolve({
          assistantMessageId: 'assistant-msg-6',
          operationId: operationId2,
          success: true,
          threadId: threadId2,
        });
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      // Execute tasks concurrently
      const [task1, task2] = await Promise.all([
        caller.execGroupSubAgentTask({
          agentId: testAgentId,
          groupId: testGroupId,
          instruction: 'Task 1',
          parentMessageId: 'parent-msg-5',
          topicId: testTopicId,
        }),
        caller.execGroupSubAgentTask({
          agentId: testAgent2Id,
          groupId: testGroupId,
          instruction: 'Task 2',
          parentMessageId: 'parent-msg-5',
          topicId: testTopicId,
        }),
      ]);

      // Verify both tasks created successfully
      expect(task1.success).toBe(true);
      expect(task2.success).toBe(true);
      expect(task1.threadId).not.toBe(task2.threadId);
      expect(task1.operationId).not.toBe(task2.operationId);

      // Verify threads exist in DB
      const threadsInDB = await serverDB
        .select()
        .from(threads)
        .where(eq(threads.topicId, testTopicId));

      expect(threadsInDB.length).toBe(2);
    });
  });

  describe('query task by different identifiers', () => {
    it('should query task status by both threadId and operationId', async () => {
      const threadId = 'thread-query-test';
      const operationId = 'op-query-test';

      // Setup: Create thread in DB
      await serverDB.insert(threads).values({
        id: threadId,
        userId,
        agentId: testAgentId,
        topicId: testTopicId,
        groupId: testGroupId,
        sourceMessageId: 'parent-msg-6',
        type: ThreadType.Isolation,
        status: ThreadStatus.Processing,
        metadata: { operationId },
      });

      mockGetOperationStatus.mockResolvedValue({
        currentState: {
          status: 'running',
          stepCount: 2,
        },
        isCompleted: false,
        hasError: false,
        metadata: {},
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      // Query by threadId
      const statusByThread = await caller.getTaskStatus({
        threadId,
      });

      // Query by operationId
      const statusByOp = await caller.getTaskStatus({
        operationId,
      });

      // Both should return same status
      expect(statusByThread.status).toBe('processing');
      expect(statusByOp.status).toBe('processing');
      expect(statusByThread.stepCount).toBe(statusByOp.stepCount);
    });
  });
});
