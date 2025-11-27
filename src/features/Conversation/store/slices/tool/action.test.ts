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
    it('should approve a tool call', async () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().approveToolCall('tool-call-1', 'group-1');
      });

      expect(mockApproveToolCalling).toHaveBeenCalledWith('tool-call-1', 'group-1');
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
      expect(mockApproveToolCalling).toHaveBeenCalledWith('tool-call-1', 'group-1');
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
    it('should reject and continue tool call', async () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      await act(async () => {
        await store.getState().rejectAndContinueToolCall('tool-call-1', 'Reason');
      });

      expect(mockRejectAndContinueToolCalling).toHaveBeenCalledWith('tool-call-1', 'Reason');
    });
  });

  describe('switchMessageBranch', () => {
    it('should call updateMessageMetadata with branch index', async () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });
      const updateMessageMetadataSpy = vi.spyOn(store.getState(), 'updateMessageMetadata');

      await act(async () => {
        await store.getState().switchMessageBranch('msg-1', 2);
      });

      expect(updateMessageMetadataSpy).toHaveBeenCalledWith('msg-1', { activeBranchIndex: 2 });
    });

    it('should switch to branch index 0', async () => {
      const context: ConversationContext = {
        agentId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });
      const updateMessageMetadataSpy = vi.spyOn(store.getState(), 'updateMessageMetadata');

      await act(async () => {
        await store.getState().switchMessageBranch('msg-1', 0);
      });

      expect(updateMessageMetadataSpy).toHaveBeenCalledWith('msg-1', { activeBranchIndex: 0 });
    });
  });
});
