import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ConversationContext, ConversationHooks } from '../../../types';
import { createStore } from '../../index';

// Mock dependencies
const mockApproveToolCalling = vi.fn();
const mockRejectAndContinueToolCalling = vi.fn();

vi.mock('@/store/chat', () => ({
  useChatStore: {
    getState: vi.fn(() => ({
      messagesMap: {},
      operations: {},
      approveToolCalling: mockApproveToolCalling,
      rejectAndContinueToolCalling: mockRejectAndContinueToolCalling,
      cancelOperations: vi.fn(),
      cancelOperation: vi.fn(),
      deleteMessage: vi.fn(),
      modifyMessageContent: vi.fn(),
      copyMessage: vi.fn(),
      toggleMessageEditing: vi.fn(),
      regenerateUserMessage: vi.fn(),
      regenerateAssistantMessage: vi.fn(),
      continueGenerationMessage: vi.fn(),
      optimisticCreateMessage: vi.fn(),
    })),
    setState: vi.fn(),
  },
}));

vi.mock('@/store/chat/selectors', () => ({
  displayMessageSelectors: {
    lastDisplayMessageId: vi.fn(() => 'last-msg-id'),
    getDisplayMessagesByKey: vi.fn(() => () => []),
    findLastMessageId: vi.fn(() => () => 'parent-id'),
    getDisplayMessageById: vi.fn(() => () => ({ content: 'original content' })),
  },
  dbMessageSelectors: {
    dbUserFiles: vi.fn(() => []),
  },
}));

vi.mock('@/services/message', () => ({
  messageService: {
    createMessage: vi.fn(),
    getMessages: vi.fn().mockResolvedValue([]),
    updateMessage: vi.fn().mockResolvedValue({ success: true, messages: [] }),
    updateMessageMetadata: vi.fn().mockResolvedValue({ success: true, messages: [] }),
    updateMessagePlugin: vi.fn().mockResolvedValue({ success: true, messages: [] }),
    removeMessage: vi.fn().mockResolvedValue({ success: true, messages: [] }),
    removeMessages: vi.fn().mockResolvedValue({ success: true, messages: [] }),
    removeMessagesByAssistant: vi.fn(),
    updateMessagePluginArguments: vi.fn(),
  },
}));

describe('Tool Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('approveToolCall', () => {
    it('should pass entire context object to ChatStore.approveToolCalling', async () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().approveToolCall('tool-call-1', 'group-1');
      });

      // Verify context is passed as third argument
      expect(mockApproveToolCalling).toHaveBeenCalledWith('tool-call-1', 'group-1', context);
    });

    it('should pass agent_builder scope context correctly', async () => {
      const context: ConversationContext = {
        agentId: 'builder-agent',
        topicId: 'builder-topic',
        threadId: 'builder-thread',
        scope: 'agent_builder',
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().approveToolCall('tool-call-1', 'group-1');
      });

      // Verify entire context object is passed (including scope)
      expect(mockApproveToolCalling).toHaveBeenCalledWith('tool-call-1', 'group-1', context);
    });

    it('should call onToolApproved hook before approval', async () => {
      const onToolApproved = vi.fn().mockResolvedValue(true);
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onToolApproved };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().approveToolCall('tool-call-1', 'group-1');
      });

      expect(onToolApproved).toHaveBeenCalledWith('tool-call-1');
      expect(mockApproveToolCalling).toHaveBeenCalledWith('tool-call-1', 'group-1', context);
    });

    it('should respect onToolApproved hook returning false', async () => {
      const onToolApproved = vi.fn().mockResolvedValue(false);
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onToolApproved };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().approveToolCall('tool-call-1', 'group-1');
      });

      expect(onToolApproved).toHaveBeenCalledWith('tool-call-1');
      expect(mockApproveToolCalling).not.toHaveBeenCalled();
    });

    it('should call onToolCallComplete hook after approval', async () => {
      const onToolCallComplete = vi.fn();
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onToolCallComplete };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().approveToolCall('tool-call-1', 'group-1');
      });

      expect(onToolCallComplete).toHaveBeenCalledWith('tool-call-1', undefined);
    });
  });

  describe('rejectToolCall', () => {
    it('should call onToolRejected hook before rejection', async () => {
      const onToolRejected = vi.fn().mockResolvedValue(true);
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onToolRejected };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().rejectToolCall('tool-call-1', 'Reason');
      });

      expect(onToolRejected).toHaveBeenCalledWith('tool-call-1', 'Reason');
    });

    it('should respect onToolRejected hook returning false', async () => {
      const onToolRejected = vi.fn().mockResolvedValue(false);
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };
      const hooks: ConversationHooks = { onToolRejected };

      const store = createStore({ context, hooks });

      await act(async () => {
        await store.getState().rejectToolCall('tool-call-1', 'Reason');
      });

      expect(onToolRejected).toHaveBeenCalledWith('tool-call-1', 'Reason');
      // Should not proceed when hook returns false
    });
  });

  describe('rejectAndContinueToolCall', () => {
    it('should pass entire context object to ChatStore.rejectAndContinueToolCalling', async () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().rejectAndContinueToolCall('tool-call-1', 'Reason');
      });

      // Verify context is passed as third argument
      expect(mockRejectAndContinueToolCalling).toHaveBeenCalledWith(
        'tool-call-1',
        'Reason',
        context,
      );
    });

    it('should pass agent_builder scope context correctly', async () => {
      const context: ConversationContext = {
        agentId: 'builder-agent',
        topicId: 'builder-topic',
        threadId: 'builder-thread',
        scope: 'agent_builder',
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().rejectAndContinueToolCall('tool-call-1', 'User rejected');
      });

      // Verify entire context object is passed (including scope)
      expect(mockRejectAndContinueToolCalling).toHaveBeenCalledWith(
        'tool-call-1',
        'User rejected',
        context,
      );
    });

    it('should pass context with undefined reason', async () => {
      const context: ConversationContext = {
        agentId: 'builder-agent',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().rejectAndContinueToolCall('tool-call-1');
      });

      // Verify context is passed even with undefined reason
      expect(mockRejectAndContinueToolCalling).toHaveBeenCalledWith(
        'tool-call-1',
        undefined,
        context,
      );
    });
  });
});
