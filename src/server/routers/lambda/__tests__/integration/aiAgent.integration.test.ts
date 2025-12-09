// @vitest-environment node
/**
 * AI Agent E2E Test - runByAgentId
 *
 * This test validates the full end-to-end flow of runByAgentId router:
 * 1. Call runByAgentId with agentId and prompt
 * 2. Router fetches agent config, creates tools, processes messages
 * 3. AgentRuntimeService creates operation
 * 4. Verify the complete flow works correctly
 *
 * Mock Strategy (Minimal Mock Principle):
 * - Database: PGLite (via @lobechat/database/test-utils)
 * - AgentStateManager/StreamEventManager: In-memory implementations
 *
 * NOT mocked (using real implementations):
 * - model-bank
 * - Mecha (AgentToolsEngine, ContextEngineering)
 * - AgentRuntimeService
 * - AgentRuntimeCoordinator
 */
import { LobeChatDatabase } from '@lobechat/database';
import { agents, messages, topics } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiAgentRouter } from '../../aiAgent';
import { cleanupTestUser, createTestUser } from './setup';

// Mock getServerDB to return our test database instance
let testDB: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(() => testDB),
}));

// Mock isEnableAgent to always return true for tests
vi.mock('@/app/(backend)/api/workflows/agent/isEnableAgent', () => ({
  isEnableAgent: vi.fn(() => true),
}));

// Mock AgentStateManager and StreamEventManager to use in-memory implementations
vi.mock('@/server/modules/AgentRuntime/AgentStateManager', async () => {
  const { InMemoryAgentStateManager } =
    await import('@/server/modules/AgentRuntime/InMemoryAgentStateManager');

  return { AgentStateManager: InMemoryAgentStateManager };
});

vi.mock('@/server/modules/AgentRuntime/StreamEventManager', async () => {
  const { InMemoryStreamEventManager } =
    await import('@/server/modules/AgentRuntime/InMemoryStreamEventManager');

  return { StreamEventManager: InMemoryStreamEventManager };
});

describe('AI Agent E2E Test - runByAgentId', () => {
  let serverDB: LobeChatDatabase;
  let userId: string;
  let testAgentId: string;

  beforeEach(async () => {
    // Setup test database
    serverDB = await getTestDB();
    testDB = serverDB;
    userId = await createTestUser(serverDB);

    // Create test agent with gpt-5 (stable model for testing)
    const [agent] = await serverDB
      .insert(agents)
      .values({
        model: 'gpt-5',
        provider: 'openai',
        systemRole: 'You are a helpful weather assistant.',
        title: 'Weather Assistant',
        userId,
      })
      .returning();
    testAgentId = agent.id;
  });

  afterEach(async () => {
    await cleanupTestUser(serverDB, userId);
    vi.clearAllMocks();
  });

  const createTestContext = () => ({
    jwtPayload: { userId },
    userId,
  });

  describe('Basic runByAgentId Flow', () => {
    it('should create operation successfully with prompt', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());
      const prompt = 'What\'s the weather of Hangzhou?';

      const result = await caller.runByAgentId({ agentId: testAgentId, prompt });

      expect(result.success).toBe(true);
      expect(result.operationId).toBeDefined();
      expect(result.operationId).toMatch(/^agent_/);

      // Verify topic was created
      const createdTopics = await serverDB
        .select()
        .from(topics)
        .where(eq(topics.agentId, testAgentId));
      expect(createdTopics).toHaveLength(1);
      expect(createdTopics[0].title).toBe(prompt);

      // Verify two messages were created (user message + assistant message placeholder)
      const createdMessages = await serverDB
        .select()
        .from(messages)
        .where(and(eq(messages.agentId, testAgentId), eq(messages.topicId, createdTopics[0].id)));

      expect(createdMessages).toHaveLength(2);

      // Verify message roles
      const userMessage = createdMessages.find((m) => m.role === 'user');
      const assistantMessage = createdMessages.find((m) => m.role === 'assistant');
      expect(userMessage).toBeDefined();
      expect(userMessage?.content).toBe(prompt);
      expect(assistantMessage).toBeDefined();
      expect(assistantMessage?.parentId).toBe(userMessage?.id);
    });

    it('should create a new topic when topicId is not provided', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.runByAgentId({
        agentId: testAgentId,
        prompt: 'Hello, how are you?',
      });

      expect(result.success).toBe(true);

      // Verify a topic was created
      const createdTopics = await serverDB
        .select()
        .from(topics)
        .where(eq(topics.agentId, testAgentId));

      expect(createdTopics).toHaveLength(1);
      expect(createdTopics[0].title).toBe('Hello, how are you?');
    });

    it('should truncate long prompt for topic title', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());
      const longPrompt =
        'This is a very long prompt that exceeds fifty characters and should be truncated for the topic title';

      await caller.runByAgentId({
        agentId: testAgentId,
        prompt: longPrompt,
      });

      const createdTopics = await serverDB
        .select()
        .from(topics)
        .where(eq(topics.agentId, testAgentId));

      expect(createdTopics).toHaveLength(1);
      expect(createdTopics[0].title).toBe(longPrompt.slice(0, 50) + '...');
    });

    it('should reuse existing topic when topicId is provided', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      // Create an existing topic
      const [existingTopic] = await serverDB
        .insert(topics)
        .values({ agentId: testAgentId, title: 'Existing Topic', userId })
        .returning();

      const result = await caller.runByAgentId({
        agentId: testAgentId,
        appContext: { topicId: existingTopic.id },
        prompt: 'Follow up question',
      });

      expect(result.success).toBe(true);

      // Verify no new topic was created
      const allTopics = await serverDB.select().from(topics).where(eq(topics.agentId, testAgentId));
      expect(allTopics).toHaveLength(1);
      expect(allTopics[0].id).toBe(existingTopic.id);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when agent does not exist', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      await expect(
        caller.runByAgentId({
          agentId: 'non-existent-agent-id',
          prompt: 'Hello',
        }),
      ).rejects.toThrow();
    });
  });

  describe('autoStart behavior', () => {
    it('should have autoStarted=true by default', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.runByAgentId({
        agentId: testAgentId,
        prompt: 'Hello',
      });

      expect(result.autoStarted).toBe(true);
    });

    it('should respect autoStart=false', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.runByAgentId({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'Hello',
      });

      expect(result.success).toBe(true);
      expect(result.autoStarted).toBe(false);
    });
  });

  describe('appContext handling', () => {
    it('should include threadId in operation when provided', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.runByAgentId({
        agentId: testAgentId,
        appContext: {
          threadId: 'test-thread-id',
        },
        prompt: 'Test prompt',
      });

      expect(result.success).toBe(true);
      expect(result.operationId).toBeDefined();
    });
  });
});
