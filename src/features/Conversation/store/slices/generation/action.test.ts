import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ConversationContext, ConversationHooks } from '../../../types';
import { createStore } from '../../index';

// Mock useChatStore
const mockCancelOperations = vi.fn();
const mockCancelOperation = vi.fn();
const mockRegenerateUserMessage = vi.fn();
const mockRegenerateAssistantMessage = vi.fn();
const mockContinueGenerationMessage = vi.fn();

vi.mock('@/store/chat', () => ({
  useChatStore: {
    getState: vi.fn(() => ({
      messagesMap: {
        'session-1-': [
          { id: 'msg-1', role: 'user', content: 'Hello' },
          { id: 'msg-2', role: 'assistant', content: 'Hi there' },
        ],
      },
      operations: {},
      cancelOperations: mockCancelOperations,
      cancelOperation: mockCancelOperation,
      regenerateUserMessage: mockRegenerateUserMessage,
      regenerateAssistantMessage: mockRegenerateAssistantMessage,
      continueGenerationMessage: mockContinueGenerationMessage,
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
          type: 'execAgentRuntime',
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

  describe('regenerateMessage', () => {
    it('should regenerate user message', async () => {
      // Mock messagesMap to include the message
      vi.mocked(await import('@/store/chat').then((m) => m.useChatStore.getState)).mockReturnValue({
        messagesMap: {
          default: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
        },
        regenerateUserMessage: mockRegenerateUserMessage,
        regenerateAssistantMessage: mockRegenerateAssistantMessage,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().regenerateMessage('msg-1');
      });

      expect(mockRegenerateUserMessage).toHaveBeenCalledWith('msg-1');
    });

    it('should regenerate assistant message', async () => {
      vi.mocked(await import('@/store/chat').then((m) => m.useChatStore.getState)).mockReturnValue({
        messagesMap: {
          default: [{ id: 'msg-2', role: 'assistant', content: 'Hi' }],
        },
        regenerateUserMessage: mockRegenerateUserMessage,
        regenerateAssistantMessage: mockRegenerateAssistantMessage,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().regenerateMessage('msg-2');
      });

      expect(mockRegenerateAssistantMessage).toHaveBeenCalledWith('msg-2');
    });

    it('should call onBeforeRegenerate hook and respect false return', async () => {
      const onBeforeRegenerate = vi.fn().mockResolvedValue(false);

      vi.mocked(await import('@/store/chat').then((m) => m.useChatStore.getState)).mockReturnValue({
        messagesMap: {
          default: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
        },
        regenerateUserMessage: mockRegenerateUserMessage,
        regenerateAssistantMessage: mockRegenerateAssistantMessage,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onBeforeRegenerate };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().regenerateMessage('msg-1');
      });

      expect(onBeforeRegenerate).toHaveBeenCalledWith('msg-1');
      expect(mockRegenerateUserMessage).not.toHaveBeenCalled();
    });

    it('should call onRegenerateComplete hook after regeneration', async () => {
      const onRegenerateComplete = vi.fn();

      vi.mocked(await import('@/store/chat').then((m) => m.useChatStore.getState)).mockReturnValue({
        messagesMap: {
          default: [{ id: 'msg-1', role: 'user', content: 'Hello' }],
        },
        regenerateUserMessage: mockRegenerateUserMessage.mockResolvedValue(undefined),
        regenerateAssistantMessage: mockRegenerateAssistantMessage,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onRegenerateComplete };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().regenerateMessage('msg-1');
      });

      expect(onRegenerateComplete).toHaveBeenCalledWith('msg-1');
    });

    it('should not regenerate if message not found', async () => {
      vi.mocked(await import('@/store/chat').then((m) => m.useChatStore.getState)).mockReturnValue({
        messagesMap: {
          default: [],
        },
        regenerateUserMessage: mockRegenerateUserMessage,
        regenerateAssistantMessage: mockRegenerateAssistantMessage,
      } as any);

      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().regenerateMessage('non-existent');
      });

      expect(mockRegenerateUserMessage).not.toHaveBeenCalled();
      expect(mockRegenerateAssistantMessage).not.toHaveBeenCalled();
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
});
