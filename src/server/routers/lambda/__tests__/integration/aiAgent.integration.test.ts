// @vitest-environment node
import { LobeChatDatabase } from '@lobechat/database';
import { agents, messages, topics } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { and, eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { inMemoryAgentStateManager } from '@/server/modules/AgentRuntime/InMemoryAgentStateManager';
import { inMemoryStreamEventManager } from '@/server/modules/AgentRuntime/InMemoryStreamEventManager';
import { ToolExecutionService } from '@/server/services/toolExecution';

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

// AgentRuntimeService must be dynamically imported after mocks are set up
let AgentRuntimeService: typeof import('@/server/services/agentRuntime').AgentRuntimeService;

/**
 * Helper to create a mock OpenAI Responses API stream from an array of chunks.
 * This creates an async iterable with tee() method that matches the OpenAI SDK response format.
 */
const createMockResponsesStream = <T>(chunks: T[]) => {
  const createAsyncIterator = () => ({
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
    toReadableStream: () =>
      new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      }),
  });

  const mainIterator = createAsyncIterator();
  return Object.assign(mainIterator, {
    tee: () => [createAsyncIterator(), createAsyncIterator()],
  });
};

describe('AI Agent E2E Test - execAgent', () => {
  let serverDB: LobeChatDatabase;
  let userId: string;
  let testAgentId: string;

  // Helper to create mock streaming response for OpenAI Responses API
  const createMockResponsesAPIStream = (content: string = 'Hello! How can I help you today?') => {
    const responseId = `resp_${Date.now()}`;
    const itemId = `msg_${Date.now()}`;

    const chunks = [
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

    return createMockResponsesStream(chunks);
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

    // Dynamically import AgentRuntimeService after mocks are set up
    const agentRuntimeModule = await import('@/server/services/agentRuntime');
    AgentRuntimeService = agentRuntimeModule.AgentRuntimeService;
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

  describe('Basic execAgent Flow', () => {
    it('should create operation successfully with prompt', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());
      const prompt = "What's the weather of Hangzhou?";

      const result = await caller.execAgent({ agentId: testAgentId, prompt });

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

      const result = await caller.execAgent({
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

      await caller.execAgent({
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

      const result = await caller.execAgent({
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
        caller.execAgent({
          agentId: 'non-existent-agent-id',
          prompt: 'Hello',
        }),
      ).rejects.toThrow();
    });
  });

  describe('autoStart behavior', () => {
    it('should have autoStarted=true by default', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.execAgent({
        agentId: testAgentId,
        prompt: 'Hello',
      });

      expect(result.autoStarted).toBe(true);
    });

    it('should respect autoStart=false', async () => {
      const caller = aiAgentRouter.createCaller(createTestContext());

      const result = await caller.execAgent({
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

      const result = await caller.execAgent({
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
      const createResult = await caller.execAgent({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'What is the weather in Hangzhou?',
      });

      expect(createResult.success).toBe(true);
      expect(createResult.operationId).toBeDefined();

      // Now execute synchronously using the service
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

      const createResult = await caller.execAgent({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'How are you?',
      });

      // Execute
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

      const createResult = await caller.execAgent({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'Test model verification',
      });

      const service = new AgentRuntimeService(serverDB, userId, {
        queueService: null,
      });

      const finalState = await service.executeSync(createResult.operationId, { maxSteps: 5 });
      expect(finalState.status).toBe('done');

      // Verify OpenAI Responses API was called with the correct model from state.modelRuntimeConfig
      expect(mockResponsesCreate).toHaveBeenCalled();
      const callArgs = mockResponsesCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-5-pro');
      expect(callArgs.input).toBeDefined();
      expect(Array.isArray(callArgs.input)).toBe(true);
    });

    it('should set correct parentId on assistant message (user message -> assistant message)', async () => {
      // Setup mock response
      const responseContent = 'Response for parentId verification';
      mockResponsesCreate.mockResolvedValue(createMockResponsesAPIStream(responseContent) as any);

      const caller = aiAgentRouter.createCaller(createTestContext());

      const createResult = await caller.execAgent({
        agentId: testAgentId,
        autoStart: false,
        prompt: 'Test parentId chain',
      });

      // Execute
      const service = new AgentRuntimeService(serverDB, userId, {
        queueService: null,
      });

      const finalState = await service.executeSync(createResult.operationId, { maxSteps: 5 });
      expect(finalState.status).toBe('done');

      // Get all messages from database
      const allMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.agentId, testAgentId));

      // Find user and assistant messages
      const userMessage = allMessages.find((m) => m.role === 'user');
      const assistantMessage = allMessages.find((m) => m.role === 'assistant');

      expect(userMessage).toBeDefined();
      expect(assistantMessage).toBeDefined();

      // Verify parentId chain: assistant message should have user message as parent
      expect(assistantMessage?.parentId).toBe(userMessage?.id);
    });
  });

  describe('Tool Calling Flow with lobe-web-browsing', () => {
    let testAgentWithToolsId: string;

    // Helper to create mock streaming response with tool calls
    const createMockResponsesAPIStreamWithTools = () => {
      const responseId = `resp_${Date.now()}`;
      const msgItemId = `msg_${Date.now()}`;
      const toolCallId = `call_${Date.now()}`;

      const chunks = [
        {
          type: 'response.created',
          response: {
            id: responseId,
            object: 'response',
            created_at: Math.floor(Date.now() / 1000),
            status: 'in_progress',
            model: 'gpt-5-pro',
            output: [],
          },
        },
        {
          type: 'response.output_item.added',
          output_index: 0,
          item: {
            id: msgItemId,
            type: 'message',
            status: 'in_progress',
            content: [],
            role: 'assistant',
          },
        },
        {
          type: 'response.output_text.delta',
          item_id: msgItemId,
          output_index: 0,
          content_index: 0,
          delta: '让我搜索一下杭州的天气信息。',
        },
        // Function call via response.output_item.added with type: 'function_call'
        {
          type: 'response.output_item.added',
          output_index: 1,
          item: {
            type: 'function_call',
            call_id: toolCallId,
            name: 'lobe-web-browsing____search____builtin',
            arguments: JSON.stringify({ query: '杭州天气' }),
          },
        },
        {
          type: 'response.completed',
          response: {
            id: responseId,
            object: 'response',
            created_at: Math.floor(Date.now() / 1000),
            status: 'completed',
            model: 'gpt-5-pro',
            output: [
              {
                id: msgItemId,
                type: 'message',
                status: 'completed',
                content: [{ type: 'output_text', text: '让我搜索一下杭州的天气信息。' }],
                role: 'assistant',
              },
              {
                type: 'function_call',
                call_id: toolCallId,
                name: 'lobe-web-browsing____search____builtin',
                arguments: JSON.stringify({ query: '杭州天气' }),
              },
            ],
            usage: {
              input_tokens: 50,
              output_tokens: 30,
              total_tokens: 80,
            },
          },
        },
      ];

      return createMockResponsesStream(chunks);
    };

    // Helper to create mock final response (after tool execution)
    const createMockFinalResponseStream = () => {
      const responseId = `resp_final_${Date.now()}`;
      const msgItemId = `msg_final_${Date.now()}`;
      const finalContent = '根据搜索结果，杭州今天天气晴朗，气温约15-22°C，适合外出活动。';

      const chunks = [
        {
          type: 'response.created',
          response: {
            id: responseId,
            object: 'response',
            created_at: Math.floor(Date.now() / 1000),
            status: 'in_progress',
            model: 'gpt-5-pro',
            output: [],
          },
        },
        {
          type: 'response.output_item.added',
          output_index: 0,
          item: {
            id: msgItemId,
            type: 'message',
            status: 'in_progress',
            content: [],
            role: 'assistant',
          },
        },
        {
          type: 'response.output_text.delta',
          item_id: msgItemId,
          output_index: 0,
          content_index: 0,
          delta: finalContent,
        },
        {
          type: 'response.output_item.done',
          output_index: 0,
          item: {
            id: msgItemId,
            type: 'message',
            status: 'completed',
            content: [{ type: 'output_text', text: finalContent }],
            role: 'assistant',
          },
        },
        {
          type: 'response.completed',
          response: {
            id: responseId,
            object: 'response',
            created_at: Math.floor(Date.now() / 1000),
            status: 'completed',
            model: 'gpt-5-pro',
            output: [
              {
                id: msgItemId,
                type: 'message',
                status: 'completed',
                content: [{ type: 'output_text', text: finalContent }],
                role: 'assistant',
              },
            ],
            usage: {
              input_tokens: 100,
              output_tokens: 50,
              total_tokens: 150,
            },
          },
        },
      ];

      return createMockResponsesStream(chunks);
    };

    beforeEach(async () => {
      // Create test agent with lobe-web-browsing plugin
      const [agentWithTools] = await serverDB
        .insert(agents)
        .values({
          model: 'gpt-5-pro',
          plugins: ['lobe-web-browsing'],
          provider: 'openai',
          systemRole: 'You are a helpful assistant that can search the web.',
          title: 'Test Assistant with Web Browsing',
          userId,
        })
        .returning();
      testAgentWithToolsId = agentWithTools.id;
    });

    it('should execute tool call flow: LLM -> search tool -> LLM -> finish', async () => {
      // Setup mock responses:
      // 1st call: Returns tool call for search
      // 2nd call: Returns final response after tool execution
      let callCount = 0;
      mockResponsesCreate.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(createMockResponsesAPIStreamWithTools() as any);
        }
        return Promise.resolve(createMockFinalResponseStream() as any);
      });

      // Mock ToolExecutionService.prototype.executeTool using spyOn
      const mockExecuteTool = vi.spyOn(ToolExecutionService.prototype, 'executeTool');
      mockExecuteTool.mockResolvedValue({
        content: JSON.stringify({
          results: [
            {
              title: '杭州天气预报',
              snippet: '杭州今天天气晴，气温15-22°C',
              url: 'https://weather.com/hangzhou',
            },
          ],
        }),
        error: null,
        executionTime: 500,
        state: {},
        success: true,
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      // Create operation with autoStart=false
      const createResult = await caller.execAgent({
        agentId: testAgentWithToolsId,
        autoStart: false,
        prompt: '杭州天气如何',
      });

      expect(createResult.success).toBe(true);
      expect(createResult.operationId).toBeDefined();

      // Execute
      const service = new AgentRuntimeService(serverDB, userId, {
        queueService: null,
      });

      const finalState = await service.executeSync(createResult.operationId, {
        maxSteps: 10,
      });

      // Verify execution completed
      expect(finalState.status).toBe('done');

      // Verify messages in database
      const allMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.agentId, testAgentWithToolsId));

      // Debug: log all messages
      // console.log('All messages:', allMessages.map(m => ({ role: m.role, content: m.content?.slice(0, 50), tool_call_id: m.tool_call_id })));

      // Should have: user message, assistant message (with tool call), tool message (if tool was called), assistant message (final)
      expect(allMessages.length).toEqual(4);

      // Verify user message
      const userMessage = allMessages.find((m) => m.role === 'user');
      expect(userMessage).toBeDefined();
      expect(userMessage?.content).toBe('杭州天气如何');

      // Verify assistant messages exist
      const assistantMessages = allMessages.filter((m) => m.role === 'assistant');
      expect(assistantMessages.length).toBeGreaterThanOrEqual(1);

      // Check if tool was called (it may not be called if tool manifest is not set up correctly)
      const toolMessage = allMessages.find((m) => m.role === 'tool');

      expect(toolMessage).toBeDefined();

      if (mockExecuteTool.mock.calls.length > 0) {
        // Tool was called, verify tool message exists
        const toolCallArgs = mockExecuteTool.mock.calls[0][0];
        expect(toolCallArgs.identifier).toBe('lobe-web-browsing');
        expect(toolCallArgs.apiName).toBe('search');

        // Note: tool_call_id may be undefined in current mock setup
        // This is tracked for future improvement
      }

      // Cleanup
      mockExecuteTool.mockRestore();
    });

    it('should create correct parentId chain: user -> assistant -> tool', async () => {
      // Setup mock responses
      let callCount = 0;
      mockResponsesCreate.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(createMockResponsesAPIStreamWithTools() as any);
        }
        return Promise.resolve(createMockFinalResponseStream() as any);
      });

      // Mock ToolExecutionService.prototype.executeTool using spyOn
      const mockExecuteTool = vi.spyOn(ToolExecutionService.prototype, 'executeTool');
      mockExecuteTool.mockResolvedValue({
        content: 'Search results for Hangzhou weather',
        error: null,
        executionTime: 100,
        state: {},
        success: true,
      });

      const caller = aiAgentRouter.createCaller(createTestContext());

      const createResult = await caller.execAgent({
        agentId: testAgentWithToolsId,
        autoStart: false,
        prompt: '杭州天气如何',
      });

      const service = new AgentRuntimeService(serverDB, userId, {
        queueService: null,
      });

      const finalState = await service.executeSync(createResult.operationId, {
        maxSteps: 10,
      });

      expect(finalState.status).toBe('done');

      // Verify parentId chain
      const allMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.agentId, testAgentWithToolsId));

      const userMessage = allMessages.find((m) => m.role === 'user');
      const firstAssistantMessage = allMessages.find(
        (m) => m.role === 'assistant' && m.parentId === userMessage?.id,
      );
      const toolMessage = allMessages.find((m) => m.role === 'tool');

      expect(userMessage).toBeDefined();
      expect(firstAssistantMessage).toBeDefined();

      // First assistant message should have user message as parent
      expect(firstAssistantMessage?.parentId).toBe(userMessage?.id);

      // Tool message should have assistant message as parent
      if (toolMessage) {
        expect(toolMessage.parentId).toBe(firstAssistantMessage?.id);
      }

      // Cleanup
      mockExecuteTool.mockRestore();
    });
  });
});
