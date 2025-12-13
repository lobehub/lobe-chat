import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AI_RUNTIME_OPERATION_TYPES } from '@/store/chat/slices/operation/types';

import type { ConversationContext, ConversationHooks } from '../../../types';
import { createStore } from '../../index';

// Mock useChatStore
const mockCancelOperations = vi.fn();
const mockCancelOperation = vi.fn();
const mockRegenerateUserMessage = vi.fn();
const mockRegenerateAssistantMessage = vi.fn();
const mockContinueGenerationMessage = vi.fn();
const mockDeleteMessage = vi.fn();
const mockSwitchMessageBranch = vi.fn();
const mockStartOperation = vi.fn(() => ({ operationId: 'test-op-id' }));
const mockCompleteOperation = vi.fn();
const mockFailOperation = vi.fn();
const mockInternalExecAgentRuntime = vi.fn();

vi.mock('@/store/chat', () => ({
  useChatStore: {
    getState: vi.fn(() => ({
      messagesMap: {
        'session-1-': [
          { id: 'msg-1', role: 'user', content: 'Hello' },
          { id: 'msg-2', role: 'assistant', content: 'Hi there', parentId: 'msg-1' },
        ],
      },
      operations: {},
      messageLoadingIds: [],
      cancelOperations: mockCancelOperations,
      cancelOperation: mockCancelOperation,
      regenerateUserMessage: mockRegenerateUserMessage,
      regenerateAssistantMessage: mockRegenerateAssistantMessage,
      continueGenerationMessage: mockContinueGenerationMessage,
      deleteMessage: mockDeleteMessage,
      switchMessageBranch: mockSwitchMessageBranch,
      startOperation: mockStartOperation,
      completeOperation: mockCompleteOperation,
      failOperation: mockFailOperation,
      internal_execAgentRuntime: mockInternalExecAgentRuntime,
    })),
    setState: vi.fn(),
  },
}));

describe('Generation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('stopGenerating', () => {
    it('should cancel all running execAgentRuntime operations', () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: 'topic-1',
        threadId: null,
      };

      const store = createStore({ context });

      act(() => {
        store.getState().stopGenerating();
      });

      expect(mockCancelOperations).toHaveBeenCalledWith(
        {
          type: AI_RUNTIME_OPERATION_TYPES,
          status: 'running',
          agentId: 'session-1',
          topicId: 'topic-1',
        },
        expect.any(String),
      );
    });

    it('should call onGenerationStop hook', () => {
      const onGenerationStop = vi.fn();
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onGenerationStop };

      const store = createStore({ context, hooks });

      act(() => {
        store.getState().stopGenerating();
      });

      expect(onGenerationStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelOperation', () => {
    it('should cancel specific operation via ChatStore', () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      act(() => {
        store.getState().cancelOperation('op-1', 'User cancelled');
      });

      expect(mockCancelOperation).toHaveBeenCalledWith('op-1', 'User cancelled');
    });

    it('should call onOperationCancelled hook', () => {
      const onOperationCancelled = vi.fn();
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onOperationCancelled };

      const store = createStore({ context, hooks });

      act(() => {
        store.getState().cancelOperation('op-1');
      });

      expect(onOperationCancelled).toHaveBeenCalledWith('op-1');
    });
  });

  describe('clearOperations', () => {
    it('should be a no-op since operations are managed by ChatStore', () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      // clearOperations should be callable without error
      act(() => {
        store.getState().clearOperations();
      });

      // No assertions needed - it's a no-op
    });
  });

  describe('continueGeneration', () => {
    it('should continue generation from message', async () => {
      // Reset mock to ensure continueGenerationMessage is available
      vi.mocked(await import('@/store/chat').then((m) => m.useChatStore.getState)).mockReturnValue({
        messagesMap: {},
        continueGenerationMessage: mockContinueGenerationMessage,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().continueGeneration('msg-1');
      });

      expect(mockContinueGenerationMessage).toHaveBeenCalledWith('msg-1', 'msg-1');
    });

    it('should call onBeforeContinue hook and respect false return', async () => {
      const onBeforeContinue = vi.fn().mockResolvedValue(false);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onBeforeContinue };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().continueGeneration('msg-1');
      });

      expect(onBeforeContinue).toHaveBeenCalledWith('msg-1');
      expect(mockContinueGenerationMessage).not.toHaveBeenCalled();
    });

    it('should call onContinueComplete hook after continuation', async () => {
      // Reset mock to ensure continueGenerationMessage is available
      vi.mocked(await import('@/store/chat').then((m) => m.useChatStore.getState)).mockReturnValue({
        messagesMap: {},
        continueGenerationMessage: mockContinueGenerationMessage.mockResolvedValue(undefined),
      } as any);

      const onContinueComplete = vi.fn();

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onContinueComplete };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().continueGeneration('msg-1');
      });

      expect(onContinueComplete).toHaveBeenCalledWith('msg-1');
    });
  });

  describe('delAndRegenerateMessage', () => {
    it('should create operation with context and pass operationId to deleteMessage', async () => {
      // Re-setup mock to ensure all required functions are available
      const { useChatStore } = await import('@/store/chat');
      vi.mocked(useChatStore.getState).mockReturnValue({
        messagesMap: {},
        operations: {},
        messageLoadingIds: [],
        cancelOperations: mockCancelOperations,
        cancelOperation: mockCancelOperation,
        deleteMessage: mockDeleteMessage,
        switchMessageBranch: mockSwitchMessageBranch,
        startOperation: mockStartOperation,
        completeOperation: mockCompleteOperation,
        failOperation: mockFailOperation,
        internal_execAgentRuntime: mockInternalExecAgentRuntime,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: 'topic-1',
        threadId: null,
        groupId: 'group-1',
      };

      const store = createStore({ context });

      // Set displayMessages after store creation
      act(() => {
        store.setState({
          displayMessages: [
            { id: 'msg-1', role: 'user', content: 'Hello' },
            { id: 'msg-2', role: 'assistant', content: 'Hi there', parentId: 'msg-1' },
          ],
        } as any);
      });

      await act(async () => {
        await store.getState().delAndRegenerateMessage('msg-2');
      });

      // Should create operation with context
      expect(mockStartOperation).toHaveBeenCalledWith({
        context: { ...context, messageId: 'msg-2' },
        type: 'regenerate',
      });

      // Should pass operationId to deleteMessage for correct context isolation
      expect(mockDeleteMessage).toHaveBeenCalledWith('msg-2', { operationId: 'test-op-id' });

      // Should complete operation
      expect(mockCompleteOperation).toHaveBeenCalledWith('test-op-id');
    });
  });

  describe('delAndResendThreadMessage', () => {
    it('should create operation with context and pass operationId to deleteMessage', async () => {
      // Re-setup mock to ensure startOperation is available
      const { useChatStore } = await import('@/store/chat');
      vi.mocked(useChatStore.getState).mockReturnValue({
        messagesMap: {},
        operations: {},
        messageLoadingIds: [],
        cancelOperations: mockCancelOperations,
        cancelOperation: mockCancelOperation,
        deleteMessage: mockDeleteMessage,
        switchMessageBranch: mockSwitchMessageBranch,
        startOperation: mockStartOperation,
        completeOperation: mockCompleteOperation,
        internal_execAgentRuntime: mockInternalExecAgentRuntime,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: 'topic-1',
        threadId: 'thread-1',
        groupId: 'group-1',
      };

      const store = createStore({ context });

      // Set displayMessages after store creation
      act(() => {
        store.setState({
          displayMessages: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
        } as any);
      });

      await act(async () => {
        await store.getState().delAndResendThreadMessage('msg-1');
      });

      // Should create operation with context including threadId
      expect(mockStartOperation).toHaveBeenCalledWith({
        context: { ...context, messageId: 'msg-1' },
        type: 'regenerate',
      });

      // Should pass operationId to deleteMessage
      expect(mockDeleteMessage).toHaveBeenCalledWith('msg-1', { operationId: 'test-op-id' });

      // Should complete operation
      expect(mockCompleteOperation).toHaveBeenCalledWith('test-op-id');
    });
  });

  describe('regenerateUserMessage', () => {
    it('should pass operationId to switchMessageBranch for correct context', async () => {
      // Re-setup mock with all required properties
      const { useChatStore } = await import('@/store/chat');
      vi.mocked(useChatStore.getState).mockReturnValue({
        messagesMap: {},
        operations: {},
        messageLoadingIds: [],
        cancelOperations: mockCancelOperations,
        cancelOperation: mockCancelOperation,
        deleteMessage: mockDeleteMessage,
        switchMessageBranch: mockSwitchMessageBranch,
        startOperation: mockStartOperation,
        completeOperation: mockCompleteOperation,
        failOperation: mockFailOperation,
        internal_execAgentRuntime: mockInternalExecAgentRuntime,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: 'topic-1',
        threadId: null,
        groupId: 'group-1',
      };

      const store = createStore({ context });

      // Set displayMessages after store creation
      act(() => {
        store.setState({
          displayMessages: [{ id: 'msg-1', role: 'user', content: 'Hello', branch: { count: 2 } }],
        } as any);
      });

      await act(async () => {
        await store.getState().regenerateUserMessage('msg-1');
      });

      // Should create operation with context
      expect(mockStartOperation).toHaveBeenCalledWith({
        context: { ...context, messageId: 'msg-1' },
        type: 'regenerate',
      });

      // Should pass operationId to switchMessageBranch
      expect(mockSwitchMessageBranch).toHaveBeenCalledWith('msg-1', 2, {
        operationId: 'test-op-id',
      });
    });

    it('should pass context to internal_execAgentRuntime', async () => {
      // Re-setup mock with all required properties
      const { useChatStore } = await import('@/store/chat');
      vi.mocked(useChatStore.getState).mockReturnValue({
        messagesMap: {},
        operations: {},
        messageLoadingIds: [],
        cancelOperations: mockCancelOperations,
        cancelOperation: mockCancelOperation,
        deleteMessage: mockDeleteMessage,
        switchMessageBranch: mockSwitchMessageBranch,
        startOperation: mockStartOperation,
        completeOperation: mockCompleteOperation,
        failOperation: mockFailOperation,
        internal_execAgentRuntime: mockInternalExecAgentRuntime,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: 'topic-1',
        threadId: null,
        groupId: 'group-1',
      };

      const store = createStore({ context });

      // Set displayMessages after store creation
      act(() => {
        store.setState({
          displayMessages: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
        } as any);
      });

      await act(async () => {
        await store.getState().regenerateUserMessage('msg-1');
      });

      // Should pass full context to internal_execAgentRuntime
      expect(mockInternalExecAgentRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          context,
          parentMessageId: 'msg-1',
          parentMessageType: 'user',
          parentOperationId: 'test-op-id',
        }),
      );
    });

    it('should not regenerate if message is already loading', async () => {
      // Mock messageLoadingIds to include the target message
      const { useChatStore } = await import('@/store/chat');
      vi.mocked(useChatStore.getState).mockReturnValue({
        messagesMap: {},
        messageLoadingIds: ['msg-1'],
        startOperation: mockStartOperation,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      // Set displayMessages after store creation
      act(() => {
        store.setState({
          displayMessages: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
        } as any);
      });

      await act(async () => {
        await store.getState().regenerateUserMessage('msg-1');
      });

      // Should not create operation if already regenerating
      expect(mockStartOperation).not.toHaveBeenCalled();
    });
  });
});
