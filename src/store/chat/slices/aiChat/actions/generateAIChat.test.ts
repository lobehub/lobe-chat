import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { DEFAULT_AGENT_CHAT_CONFIG, DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { sessionMetaSelectors } from '@/store/session/selectors';

vi.mock('@/services/message', () => ({
  messageService: {
    createMessage: vi.fn(() => Promise.resolve('new-message-id')),
    updateMessage: vi.fn(),
    updateMessageError: vi.fn(),
    removeMessage: vi.fn(),
  },
}));

vi.mock('@/services/topic', () => ({
  topicService: {
    createTopic: vi.fn(() => Promise.resolve('new-topic-id')),
  },
}));

vi.mock('@/services/chat', () => ({
  chatService: {
    createAssistantMessage: vi.fn(() => Promise.resolve('assistant-message')),
    createAssistantMessageStream: vi.fn(),
  },
}));

const mockState = {
  activeId: 'session-id',
  activeTopicId: 'topic-id',
  messages: [],
  refreshMessages: vi.fn(),
  internal_coreProcessMessage: vi.fn(),
  internal_toggleChatLoading: vi.fn(),
  internal_toggleToolCallingStreaming: vi.fn(),
  internal_toggleChatReasoning: vi.fn(),
  internal_updateMessageContent: vi.fn(),
  internal_dispatchMessage: vi.fn(),
  internal_createMessage: vi.fn(),
  internal_fetchMessages: vi.fn(),
  internal_shouldUseRAG: vi.fn(() => false),
  internal_retrieveChunks: vi.fn(),
  deleteMessage: vi.fn(),
  switchTopic: vi.fn(),
  createTopic: vi.fn(),
  summaryTopicTitle: vi.fn(),
  triggerToolCalls: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  useChatStore.setState(mockState, false);
  vi.spyOn(agentSelectors, 'currentAgentConfig').mockImplementation(() => DEFAULT_AGENT_CONFIG);
  vi.spyOn(agentSelectors, 'currentAgentChatConfig').mockImplementation(
    () => DEFAULT_AGENT_CHAT_CONFIG,
  );
  vi.spyOn(sessionMetaSelectors, 'currentAgentMeta').mockImplementation(() => ({ tags: [] }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateAIChat', () => {
  describe('sendMessage', () => {
    it('should not send empty message without files', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: '' });
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
    });

    it('should not send message if there is no active session', async () => {
      const { result } = renderHook(() => useChatStore());
      act(() => {
        useChatStore.setState({ activeId: undefined });
      });

      await act(async () => {
        await result.current.sendMessage({ message: 'test' });
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
    });
  });

  describe('stopGenerateMessage', () => {
    it('should do nothing if no abortController exists', () => {
      const { result } = renderHook(() => useChatStore());
      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: undefined });
      });

      result.current.stopGenerateMessage();

      expect(result.current.chatLoadingIdsAbortController).toBeUndefined();
    });
  });
});
