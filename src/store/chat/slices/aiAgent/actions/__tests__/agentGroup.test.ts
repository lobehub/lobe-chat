import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';
import { agentRuntimeClient } from '@/services/agentRuntime';
import { useChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

// Keep zustand mock as it's needed globally
vi.mock('zustand/traditional');

// Mock lambdaClient
vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    aiAgent: {
      execGroupAgent: {
        mutate: vi.fn(),
      },
    },
    session: {
      updateSession: {
        mutate: vi.fn().mockResolvedValue(undefined),
      },
    },
  },
}));

// Mock agentRuntimeClient
vi.mock('@/services/agentRuntime', () => ({
  agentRuntimeClient: {
    createStreamConnection: vi.fn(),
  },
  StreamEvent: {},
}));

// Test Constants
const TEST_IDS = {
  AGENT_ID: 'test-agent-id',
  ASSISTANT_MESSAGE_ID: 'test-assistant-message-id',
  GROUP_ID: 'test-group-id',
  OPERATION_ID: 'test-operation-id',
  TOPIC_ID: 'test-topic-id',
  USER_MESSAGE_ID: 'test-user-message-id',
} as const;

const TEST_CONTENT = {
  GROUP_MESSAGE: 'Hello group!',
  EMPTY: '',
} as const;

// Helper to reset test environment
const resetTestEnvironment = () => {
  vi.clearAllMocks();
  useChatStore.setState(
    {
      activeAgentId: TEST_IDS.AGENT_ID,
      activeGroupId: TEST_IDS.GROUP_ID,
      activeTopicId: undefined,
      messagesMap: {},
      dbMessagesMap: {},
      operations: {},
      agentOperations: {},
      isCreatingMessage: false,
    },
    false,
  );
};

// Helper to create test context
const createTestContext = (overrides = {}) => ({
  agentId: TEST_IDS.AGENT_ID,
  groupId: TEST_IDS.GROUP_ID,
  topicId: null as string | null,
  threadId: null as string | null,
  ...overrides,
});

// Helper to create mock response from execGroupAgent
const createMockExecGroupAgentResponse = (overrides = {}) => ({
  operationId: TEST_IDS.OPERATION_ID,
  topicId: TEST_IDS.TOPIC_ID,
  isCreateNewTopic: false,
  messages: [
    {
      id: TEST_IDS.USER_MESSAGE_ID,
      role: 'user' as const,
      content: TEST_CONTENT.GROUP_MESSAGE,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      meta: {},
    },
    {
      id: TEST_IDS.ASSISTANT_MESSAGE_ID,
      role: 'assistant' as const,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      meta: {},
    },
  ],
  topics: {
    items: [],
    total: 0,
  },
  ...overrides,
});

describe('agentGroup actions', () => {
  beforeEach(() => {
    resetTestEnvironment();

    // Setup default mocks for store methods
    act(() => {
      useChatStore.setState({
        optimisticCreateTmpMessage: vi.fn(),
        internal_toggleMessageLoading: vi.fn(),
        internal_dispatchMessage: vi.fn(),
        internal_handleAgentStreamEvent: vi.fn(),
        internal_cleanupAgentOperation: vi.fn(),
        internal_handleAgentError: vi.fn(),
        internal_updateTopics: vi.fn(),
        replaceMessages: vi.fn(),
        startOperation: vi.fn().mockReturnValue({ operationId: 'op-123' }),
        completeOperation: vi.fn(),
        failOperation: vi.fn(),
        switchTopic: vi.fn(),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendGroupMessage', () => {
    describe('validation', () => {
      it('should not send when message is empty and no files provided', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.EMPTY,
          });
        });

        expect(lambdaClient.aiAgent.execGroupAgent.mutate).not.toHaveBeenCalled();
      });

      it('should not send when message is whitespace only', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: '   ',
          });
        });

        expect(lambdaClient.aiAgent.execGroupAgent.mutate).not.toHaveBeenCalled();
      });

      it('should not send when message is empty with empty files array', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.EMPTY,
            files: [],
          });
        });

        expect(lambdaClient.aiAgent.execGroupAgent.mutate).not.toHaveBeenCalled();
      });

      it('should not send when agentId is missing', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext({ agentId: '' }),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(lambdaClient.aiAgent.execGroupAgent.mutate).not.toHaveBeenCalled();
      });

      it('should not send when groupId is missing', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext({ groupId: '' }),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(lambdaClient.aiAgent.execGroupAgent.mutate).not.toHaveBeenCalled();
      });
    });

    describe('optimistic update', () => {
      it('should create operation with correct context for group messages', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse(),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        const context = createTestContext();

        await act(async () => {
          await result.current.sendGroupMessage({
            context,
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.startOperation).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'sendMessage',
            context: expect.objectContaining({
              agentId: TEST_IDS.AGENT_ID,
              groupId: TEST_IDS.GROUP_ID,
            }),
            label: 'Send Group Message',
          }),
        );
      });

      it('should create temp user and assistant messages with operationId', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse(),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        // Should create temp user message
        expect(result.current.optimisticCreateTmpMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            content: TEST_CONTENT.GROUP_MESSAGE,
            role: 'user',
            groupId: TEST_IDS.GROUP_ID,
          }),
          expect.objectContaining({
            operationId: 'op-123',
          }),
        );

        // Should create temp assistant message
        expect(result.current.optimisticCreateTmpMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            role: 'assistant',
            groupId: TEST_IDS.GROUP_ID,
          }),
          expect.objectContaining({
            operationId: 'op-123',
          }),
        );
      });

      it('should set isCreatingMessage state during operation', async () => {
        const { result } = renderHook(() => useChatStore());

        let capturedState: boolean | undefined;
        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockImplementation(async () => {
          // Capture state during the API call
          capturedState = useChatStore.getState().isCreatingMessage;
          return createMockExecGroupAgentResponse();
        });
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(capturedState).toBe(true);
        // After completion, should be false
        expect(useChatStore.getState().isCreatingMessage).toBe(false);
      });
    });

    describe('backend integration', () => {
      it('should call execGroupAgent with correct parameters', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse(),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        const context = createTestContext({ topicId: TEST_IDS.TOPIC_ID });

        await act(async () => {
          await result.current.sendGroupMessage({
            context,
            message: TEST_CONTENT.GROUP_MESSAGE,
            files: [{ id: 'file-1' } as any],
          });
        });

        expect(lambdaClient.aiAgent.execGroupAgent.mutate).toHaveBeenCalledWith({
          agentId: TEST_IDS.AGENT_ID,
          groupId: TEST_IDS.GROUP_ID,
          message: TEST_CONTENT.GROUP_MESSAGE,
          topicId: TEST_IDS.TOPIC_ID,
          files: ['file-1'],
        });
      });

      it('should replace messages with server response using correct context', async () => {
        const { result } = renderHook(() => useChatStore());

        const mockResponse = createMockExecGroupAgentResponse();
        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(mockResponse);
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        const context = createTestContext();

        await act(async () => {
          await result.current.sendGroupMessage({
            context,
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.replaceMessages).toHaveBeenCalledWith(
          mockResponse.messages,
          expect.objectContaining({
            context: expect.objectContaining({
              agentId: TEST_IDS.AGENT_ID,
              groupId: TEST_IDS.GROUP_ID,
              topicId: TEST_IDS.TOPIC_ID,
            }),
          }),
        );
      });

      it('should create stream connection with operationId', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse(),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(agentRuntimeClient.createStreamConnection).toHaveBeenCalledWith(
          TEST_IDS.OPERATION_ID,
          expect.objectContaining({
            includeHistory: false,
            onConnect: expect.any(Function),
            onDisconnect: expect.any(Function),
            onError: expect.any(Function),
            onEvent: expect.any(Function),
          }),
        );
      });

      it('should complete operation on success', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse(),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.completeOperation).toHaveBeenCalledWith('op-123');
      });

      it('should update topics when new topic is created', async () => {
        const { result } = renderHook(() => useChatStore());

        const mockTopics = {
          items: [{ id: 'topic-1', title: 'New Topic' }],
          total: 1,
        };
        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse({
            isCreateNewTopic: true,
            topics: mockTopics,
          }),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.internal_updateTopics).toHaveBeenCalledWith(
          TEST_IDS.AGENT_ID,
          expect.objectContaining({
            groupId: TEST_IDS.GROUP_ID,
            items: mockTopics.items,
            total: mockTopics.total,
          }),
        );
      });

      it('should switch to new topic when isCreateNewTopic is true', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse({
            isCreateNewTopic: true,
            topics: { items: [], total: 1 },
          }),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.switchTopic).toHaveBeenCalledWith(TEST_IDS.TOPIC_ID, true);
      });

      it('should not switch topic when using existing topic', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse({
            isCreateNewTopic: false,
          }),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext({ topicId: 'existing-topic-id' }),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.switchTopic).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should remove temp messages on backend error', async () => {
        const { result } = renderHook(() => useChatStore());

        const testError = new Error('Backend error');
        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockRejectedValue(testError);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.internal_dispatchMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'deleteMessages',
          }),
          expect.objectContaining({
            operationId: 'op-123',
          }),
        );
      });

      it('should fail operation with error details', async () => {
        const { result } = renderHook(() => useChatStore());

        const testError = new Error('Backend error');
        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockRejectedValue(testError);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(result.current.failOperation).toHaveBeenCalledWith('op-123', {
          type: 'SendGroupMessageError',
          message: 'Backend error',
        });
      });

      it('should reset isCreatingMessage state on error', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockRejectedValue(
          new Error('Backend error'),
        );

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        expect(useChatStore.getState().isCreatingMessage).toBe(false);
      });

      it('should toggle loading state off on error', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockRejectedValue(
          new Error('Backend error'),
        );

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
          });
        });

        // Should toggle loading off in finally block
        expect(result.current.internal_toggleMessageLoading).toHaveBeenLastCalledWith(
          false,
          expect.any(String),
        );
      });
    });

    describe('with files', () => {
      it('should send message with files when message is empty but files provided', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse(),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.EMPTY,
            files: [{ id: 'file-1' } as any, { id: 'file-2' } as any],
          });
        });

        expect(lambdaClient.aiAgent.execGroupAgent.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            files: ['file-1', 'file-2'],
          }),
        );
      });

      it('should include file ids in temp user message', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.mocked(lambdaClient.aiAgent.execGroupAgent.mutate).mockResolvedValue(
          createMockExecGroupAgentResponse(),
        );
        vi.mocked(agentRuntimeClient.createStreamConnection).mockReturnValue({} as any);

        await act(async () => {
          await result.current.sendGroupMessage({
            context: createTestContext(),
            message: TEST_CONTENT.GROUP_MESSAGE,
            files: [{ id: 'file-1' } as any],
          });
        });

        expect(result.current.optimisticCreateTmpMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            role: 'user',
            files: ['file-1'],
          }),
          expect.any(Object),
        );
      });
    });
  });
});
