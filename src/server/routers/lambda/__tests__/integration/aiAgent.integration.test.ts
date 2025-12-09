// @vitest-environment node
/**
 * AI Agent E2E Test - runByAgentId
 *
 * This test validates the full end-to-end flow of runByAgentId router:
 * 1. Call runByAgentId with agentId and prompt
 * 2. Router fetches agent config, creates tools, processes messages
 * 3. AgentRuntimeService creates operation and executes LLM call
 * 4. Verify the complete flow works correctly
 *
 * Mock Strategy (Minimal Mock Principle):
 * - Database: PGLite (via @lobechat/database/test-utils)
 * - AgentStateManager/StreamEventManager: In-memory implementations
 * - OpenAI: spyOn chat.completions.create prototype
 *
 * NOT mocked (using real implementations):
 * - model-bank
 * - Mecha (AgentToolsEngine, ContextEngineering)
 * - AgentRuntimeService
 * - AgentRuntimeCoordinator
 * - ModelRuntime
 */
import { LobeChatDatabase } from '@lobechat/database';
import { agents, messages, topics } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { and, eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { inMemoryAgentStateManager } from '@/server/modules/AgentRuntime/InMemoryAgentStateManager';
import { inMemoryStreamEventManager } from '@/server/modules/AgentRuntime/InMemoryStreamEventManager';

import { aiAgentRouter } from '../../aiAgent';
import { cleanupTestUser, createTestUser } from './setup';

// Set fake API key for testing to bypass OpenAI SDK validation
process.env.OPENAI_API_KEY = 'sk-test-fake-api-key-for-testing';

// Mock getServerDB to return our test database instance
let testDB: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(() => testDB),
}));

// Mock isEnableAgent to always return true for tests
vi.mock('@/app/(backend)/api/workflows/agent/isEnableAgent', () => ({
  isEnableAgent: vi.fn(() => true),
}));

// Mock AgentStateManager to use the exported singleton instance
vi.mock('@/server/modules/AgentRuntime/AgentStateManager', async () => {
  const { inMemoryAgentStateManager } =
    await import('@/server/modules/AgentRuntime/InMemoryAgentStateManager');
  return {
    AgentStateManager: class {
      constructor() {
        return inMemoryAgentStateManager;
      }
    },
  };
});

// Mock StreamEventManager to use the exported singleton instance
vi.mock('@/server/modules/AgentRuntime/StreamEventManager', async () => {
  const { inMemoryStreamEventManager } =
    await import('@/server/modules/AgentRuntime/InMemoryStreamEventManager');
  return {
    StreamEventManager: class {
      constructor() {
        return inMemoryStreamEventManager;
      }
    },
  };
});

// Variable to hold the mock for OpenAI Responses API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockResponsesCreate: any;

describe('AI Agent E2E Test - runByAgentId', () => {
  let serverDB: LobeChatDatabase;
  let userId: string;
  let testAgentId: string;

  // Helper to create mock streaming response for OpenAI Responses API
  const createMockResponsesAPIStream = (content: string = 'Hello! How can I help you today?') => {
    const responseId = `resp_${Date.now()}`;
    const itemId = `msg_${Date.now()}`;

    // Create Responses API event chunks
    const createChunks = () => [
      {
        response: {
          created_at: Math.floor(Date.now() / 1000),
          id: responseId,
          model: 'gpt-5-pro',
          object: 'response',
          output: [],
          status: 'in_progress',
        },
        type: 'response.created',
      },
      {
        content_index: 0,
        delta: content,
        item_id: itemId,
        output_index: 0,
        type: 'response.output_text.delta',
      },
      {
        content_index: 0,
        item_id: itemId,
        output_index: 0,
        text: content,
        type: 'response.output_text.done',
      },
      {
        response: {
          created_at: Math.floor(Date.now() / 1000),
          id: responseId,
          model: 'gpt-5-pro',
          object: 'response',
          output: [
            {
              content: [{ text: content, type: 'output_text' }],
              role: 'assistant',
              type: 'message',
            },
          ],
          status: 'completed',
          usage: {
            input_tokens: 20,
            output_tokens: 10,
            total_tokens: 30,
          },
        },
        type: 'response.completed',
      },
    ];

    // Factory to create fresh async iterator (since each iterator can only be consumed once)
    const createAsyncIterator = () => ({
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of createChunks()) {
          yield chunk;
        }
      },
      toReadableStream: () =>
        new ReadableStream({
          start(controller) {
            for (const chunk of createChunks()) {
              controller.enqueue(chunk);
            }
            controller.close();
          },
        }),
    });

    // Main iterator with tee method
    const mainIterator = createAsyncIterator();

    // Add tee method that returns two independent iterators
    return Object.assign(mainIterator, {
      tee: () => [createAsyncIterator(), createAsyncIterator()],
    });
  };

  beforeEach(async () => {
    // Setup test database
    serverDB = await getTestDB();
    testDB = serverDB;
    userId = await createTestUser(serverDB);

    // Create test agent with gpt-5-pro (uses Responses API)
    const [agent] = await serverDB
      .insert(agents)
      .values({
        model: 'gpt-5-pro',
        provider: 'openai',
        systemRole: 'You are a helpful assistant.',
        title: 'Test Assistant',
        userId,
      })
      .returning();
    testAgentId = agent.id;

    // Setup spyOn for OpenAI Responses API prototype
    // gpt-5-pro is in responsesAPIModels, so it will use responses.create
    mockResponsesCreate = vi.spyOn(OpenAI.Responses.prototype, 'create');
  });

  afterEach(async () => {
    await cleanupTestUser(serverDB, userId);
    vi.clearAllMocks();
    vi.restoreAllMocks();

    // Clear singleton instances for next test
    inMemoryAgentStateManager.clear();
    inMemoryStreamEventManager.clear();
  });

  const createTestContext = () => ({
    jwtPayload: { userId },
    userId,
  });

  describe('Basic runByAgentId Flow', () => {
    it('should create operation successfully with prompt', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());
      const prompt = "What's the weather of Hangzhou?";

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

      // Verify only user message was created (assistant message is created by RuntimeExecutor)
      const createdMessages = await serverDB
        .select()
        .from(messages)
        .where(and(eq(messages.agentId, testAgentId), eq(messages.topicId, createdTopics[0].id)));

      expect(createdMessages).toHaveLength(1);

      // Verify user message
      const userMessage = createdMessages.find((m) => m.role === 'user');
      expect(userMessage).toBeDefined();
      expect(userMessage?.content).toBe(prompt);
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

  describe('Full LLM Execution with executeSync', () => {
    it('should execute LLM call using state.modelRuntimeConfig fallback', async () => {
      // Setup mock response for this specific test
      const responseContent = 'The weather in Hangzhou is sunny today.';
      mockResponsesCreate.mockResolvedValue(createMockResponsesAPIStream(responseContent) as any);

      const caller = aiAgentRouter.createCaller(createTestContext());

      // First create the operation with autoStart=false
      const createResult = await caller.runByAgentId({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'What is the weather in Hangzhou?',
      });

      expect(createResult.success).toBe(true);
      expect(createResult.operationId).toBeDefined();

      // Now execute synchronously using the service
      const { AgentRuntimeService } = await import('@/server/services/agentRuntime');
      const service = new AgentRuntimeService(serverDB, userId, {
        queueService: null, // Disable queue for sync execution
      });

      const finalState = await service.executeSync(createResult.operationId, {
        maxSteps: 5,
      });

      // Verify the execution completed
      expect(finalState.status).toBe('done');

      // Verify OpenAI responses.create was called (Responses API)
      expect(mockResponsesCreate).toHaveBeenCalled();

      // Verify the model was correctly passed (from state.modelRuntimeConfig fallback)
      const callArgs = mockResponsesCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-5-pro');
    });

    it('should save assistant response content to database after execution', async () => {
      // Setup mock response for this specific test
      const responseContent = 'I am doing great, thank you for asking!';
      mockResponsesCreate.mockResolvedValue(createMockResponsesAPIStream(responseContent) as any);

      const caller = aiAgentRouter.createCaller(createTestContext());

      const createResult = await caller.runByAgentId({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'How are you?',
      });

      // Execute
      const { AgentRuntimeService } = await import('@/server/services/agentRuntime');
      const service = new AgentRuntimeService(serverDB, userId, {
        queueService: null,
      });

      const finalState = await service.executeSync(createResult.operationId, { maxSteps: 5 });

      // Verify the execution completed
      expect(finalState.status).toBe('done');

      // Verify assistant message content is in the final state messages
      const assistantMessage = finalState.messages.find(
        (m: { role: string }) => m.role === 'assistant',
      );
      expect(assistantMessage).toBeDefined();
      expect(assistantMessage.content).toBe(responseContent);

      // Also verify the database was updated
      // Note: Router creates a placeholder assistant message, then RuntimeExecutor creates another one with content
      const allMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.agentId, testAgentId));

      // Find the assistant message that has content (created by RuntimeExecutor)
      const dbAssistantMessageWithContent = allMessages.find((m) => m.role === 'assistant');
      expect(dbAssistantMessageWithContent).toBeDefined();
      expect(dbAssistantMessageWithContent?.content).toBe(responseContent);
    });

    it('should verify OpenAI responses.create was called with correct model', async () => {
      // Setup mock response for this specific test
      const responseContent = 'Test response for model verification';
      mockResponsesCreate.mockResolvedValue(createMockResponsesAPIStream(responseContent) as any);

      const caller = aiAgentRouter.createCaller(createTestContext());

      const createResult = await caller.runByAgentId({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'Test model verification',
      });

      const { AgentRuntimeService } = await import('@/server/services/agentRuntime');
      const service = new AgentRuntimeService(serverDB, userId, {
        queueService: null,
      });

      const finalState = await service.executeSync(createResult.operationId, { maxSteps: 5 });

      console.log(finalState);
      expect(finalState.status).toBe('done');

      // Verify OpenAI Responses API was called with the correct model from state.modelRuntimeConfig
      expect(mockResponsesCreate).toHaveBeenCalled();
      const callArgs = mockResponsesCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-5-pro');
      expect(callArgs.input).toBeDefined();
      expect(Array.isArray(callArgs.input)).toBe(true);
    });
  });
});
