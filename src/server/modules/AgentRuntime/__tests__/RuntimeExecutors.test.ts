import type { AgentState } from '@lobechat/agent-runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RuntimeExecutorContext, createRuntimeExecutors } from '../RuntimeExecutors';

// Mock dependencies
vi.mock('@/server/modules/ModelRuntime', () => ({
  initModelRuntimeWithUserPayload: vi.fn(() => ({
    chat: vi.fn().mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield { type: 'text', text: 'Hello' };
      },
    }),
  })),
}));

vi.mock('@lobechat/model-runtime', () => ({
  consumeStreamUntilDone: vi.fn().mockResolvedValue(undefined),
}));

describe('RuntimeExecutors', () => {
  let mockMessageModel: any;
  let mockStreamManager: any;
  let mockToolExecutionService: any;
  let ctx: RuntimeExecutorContext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMessageModel = {
      create: vi.fn().mockResolvedValue({ id: 'msg-123' }),
      update: vi.fn().mockResolvedValue({}),
    };

    mockStreamManager = {
      publishStreamChunk: vi.fn().mockResolvedValue('event-1'),
      publishStreamEvent: vi.fn().mockResolvedValue('event-2'),
    };

    mockToolExecutionService = {
      executeTool: vi.fn().mockResolvedValue({
        content: 'Tool result',
        error: null,
        executionTime: 100,
        state: {},
        success: true,
      }),
    };

    ctx = {
      messageModel: mockMessageModel,
      operationId: 'op-123',
      stepIndex: 0,
      streamManager: mockStreamManager,
      toolExecutionService: mockToolExecutionService,
      userId: 'user-123',
      userPayload: {},
    };
  });

  // Helper to create a valid mock usage object
  const createMockUsage = () => ({
    humanInteraction: {
      approvalRequests: 0,
      promptRequests: 0,
      selectRequests: 0,
      totalWaitingTimeMs: 0,
    },
    llm: {
      apiCalls: 0,
      processingTimeMs: 0,
      tokens: { input: 0, output: 0, total: 0 },
    },
    tools: {
      byTool: [],
      totalCalls: 0,
      totalTimeMs: 0,
    },
  });

  // Helper to create a valid mock cost object
  const createMockCost = () => ({
    calculatedAt: new Date().toISOString(),
    currency: 'USD',
    llm: {
      byModel: [],
      currency: 'USD',
      total: 0,
    },
    tools: {
      byTool: [],
      currency: 'USD',
      total: 0,
    },
    total: 0,
  });

  describe('call_llm executor', () => {
    const createMockState = (overrides?: Partial<AgentState>): AgentState => ({
      cost: createMockCost(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      maxSteps: 100,
      messages: [],
      metadata: {
        agentId: 'agent-123',
        threadId: 'thread-123',
        topicId: 'topic-123',
      },
      modelRuntimeConfig: {
        model: 'gpt-4',
        provider: 'openai',
      },
      operationId: 'op-123',
      status: 'running',
      stepCount: 0,
      toolManifestMap: {},
      usage: createMockUsage(),
      ...overrides,
    });

    it('should pass parentId from payload.parentId to messageModel.create', async () => {
      const executors = createRuntimeExecutors(ctx);
      const state = createMockState();

      const instruction = {
        payload: {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-4',
          parentId: 'parent-msg-123',
          provider: 'openai',
          tools: [],
        },
        type: 'call_llm' as const,
      };

      await executors.call_llm!(instruction, state);

      expect(mockMessageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: 'parent-msg-123',
        }),
      );
    });

    it('should pass parentId from payload.parentMessageId to messageModel.create', async () => {
      const executors = createRuntimeExecutors(ctx);
      const state = createMockState();

      const instruction = {
        payload: {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-4',
          parentMessageId: 'parent-msg-456',
          provider: 'openai',
          tools: [],
        },
        type: 'call_llm' as const,
      };

      await executors.call_llm!(instruction, state);

      expect(mockMessageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: 'parent-msg-456',
        }),
      );
    });

    it('should prefer parentId over parentMessageId when both are provided', async () => {
      const executors = createRuntimeExecutors(ctx);
      const state = createMockState();

      const instruction = {
        payload: {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-4',
          parentId: 'parent-id-preferred',
          parentMessageId: 'parent-message-id-fallback',
          provider: 'openai',
          tools: [],
        },
        type: 'call_llm' as const,
      };

      await executors.call_llm!(instruction, state);

      expect(mockMessageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: 'parent-id-preferred',
        }),
      );
    });

    it('should pass undefined parentId when neither parentId nor parentMessageId is provided', async () => {
      const executors = createRuntimeExecutors(ctx);
      const state = createMockState();

      const instruction = {
        payload: {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-4',
          provider: 'openai',
          tools: [],
        },
        type: 'call_llm' as const,
      };

      await executors.call_llm!(instruction, state);

      expect(mockMessageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: undefined,
        }),
      );
    });

    it('should use model and provider from state.modelRuntimeConfig as fallback', async () => {
      const executors = createRuntimeExecutors(ctx);
      const state = createMockState({
        modelRuntimeConfig: {
          model: 'gpt-3.5-turbo',
          provider: 'openai',
        },
      });

      const instruction = {
        payload: {
          messages: [{ content: 'Hello', role: 'user' }],
          parentId: 'parent-123',
          tools: [],
        },
        type: 'call_llm' as const,
      };

      await executors.call_llm!(instruction, state);

      expect(mockMessageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          provider: 'openai',
        }),
      );
    });
  });

  describe('call_tool executor', () => {
    const createMockState = (overrides?: Partial<AgentState>): AgentState => ({
      cost: createMockCost(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      maxSteps: 100,
      messages: [],
      metadata: {
        agentId: 'agent-123',
        threadId: 'thread-123',
        topicId: 'topic-123',
      },
      operationId: 'op-123',
      status: 'running',
      stepCount: 0,
      toolManifestMap: {},
      usage: createMockUsage(),
      ...overrides,
    });

    it('should pass parentId (parentMessageId) to messageModel.create for tool message', async () => {
      const executors = createRuntimeExecutors(ctx);
      const state = createMockState();

      const instruction = {
        payload: {
          parentMessageId: 'assistant-msg-123',
          toolCalling: {
            apiName: 'search',
            arguments: '{}',
            id: 'tool-call-1',
            identifier: 'web-search',
            type: 'default' as const,
          },
        },
        type: 'call_tool' as const,
      };

      await executors.call_tool!(instruction, state);

      expect(mockMessageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentId: 'assistant-msg-123',
          role: 'tool',
          tool_call_id: 'tool-call-1',
        }),
      );
    });

    it('should include all required fields when creating tool message', async () => {
      const executors = createRuntimeExecutors(ctx);
      const state = createMockState();

      const instruction = {
        payload: {
          parentMessageId: 'assistant-msg-456',
          toolCalling: {
            apiName: 'crawl',
            arguments: '{"url": "https://example.com"}',
            id: 'tool-call-2',
            identifier: 'web-browsing',
            type: 'default' as const,
          },
        },
        type: 'call_tool' as const,
      };

      await executors.call_tool!(instruction, state);

      expect(mockMessageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'agent-123',
          content: 'Tool result',
          parentId: 'assistant-msg-456',
          role: 'tool',
          threadId: 'thread-123',
          tool_call_id: 'tool-call-2',
          topicId: 'topic-123',
        }),
      );
    });
  });
});
