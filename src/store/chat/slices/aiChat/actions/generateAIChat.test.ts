import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { DEFAULT_AGENT_CHAT_CONFIG, DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { chatSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { UploadFileItem } from '@/types/files/upload';
import { ChatMessage } from '@/types/message';

import { useChatStore } from '../../../store';

vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve(new Response('mock'))),
);

vi.mock('zustand/traditional');
// Mock service
vi.mock('@/services/message', () => ({
  messageService: {
    getMessages: vi.fn(),
    updateMessageError: vi.fn(),
    removeMessage: vi.fn(),
    createMessage: vi.fn(() => Promise.resolve('new-message-id')),
    updateMessage: vi.fn(),
  },
}));
vi.mock('@/services/topic', () => ({
  topicService: {
    createTopic: vi.fn(() => Promise.resolve()),
  },
}));
vi.mock('@/services/chat', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/services/chat')>();

  return {
    chatService: {
      ...module.chatService,
      createAssistantMessage: vi.fn(() => Promise.resolve('assistant-message')),
      createAssistantMessageStream: vi.fn(),
    },
  };
});

const mockState = {
  activeId: 'session-id',
  activeTopicId: 'topic-id',
  messages: [],
  refreshMessages: vi.fn(),
  refreshTopic: vi.fn(),
  internal_coreProcessMessage: vi.fn(),
  saveToTopic: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  useChatStore.setState(mockState, false);
  vi.spyOn(agentSelectors, 'currentAgentConfig').mockImplementation(() => DEFAULT_AGENT_CONFIG);
  vi.spyOn(agentSelectors, 'currentAgentChatConfig').mockImplementation(
    () => DEFAULT_AGENT_CHAT_CONFIG,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateAIChat actions', () => {
  describe('sendMessage', () => {
    it('should not send message if there is no active session', async () => {
      useChatStore.setState({ activeId: undefined });
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message';

      await act(async () => {
        await result.current.sendMessage({ message });
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
    });

    it('should create message and call internal_coreProcessMessage if message or files are provided', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message';
      const files = [{ id: 'file-id' } as UploadFileItem];

      (messageService.createMessage as Mock).mockResolvedValue('new-message-id');

      await act(async () => {
        await result.current.sendMessage({ message, files });
      });

      expect(messageService.createMessage).toHaveBeenCalledWith({
        content: message,
        files: files.map((f) => f.id),
        role: 'user',
        sessionId: mockState.activeId,
        topicId: mockState.activeTopicId,
      });
      expect(result.current.internal_coreProcessMessage).toHaveBeenCalled();
    });

    it('should pass citations correctly in onFinish', async () => {
      const { result } = renderHook(() => useChatStore());
      const citations = [{ id: 'citation-1' }, { id: 'citation-2' }];

      (chatService.createAssistantMessageStream as Mock).mockImplementation(
        async ({ onFinish }) => {
          await onFinish('Final content', {
            traceId: 'trace-id',
            observationId: 'observation-id',
            toolCalls: [],
            reasoning: 'reasoning content',
            citations,
          });
        },
      );

      await act(async () => {
        await result.current.internal_fetchAIChatMessage([], 'assistant-message-id');
      });

      expect(messageService.updateMessage).toHaveBeenCalledWith('assistant-message-id', {
        content: 'Final content',
        reasoning: { content: 'reasoning content', duration: undefined },
        search: { citations },
        tools: [],
      });
    });
  });

  describe('stopGenerateMessage', () => {
    it('should stop generating message', async () => {
      const { result } = renderHook(() => useChatStore());
      const abortController = new AbortController();

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: abortController });
      });

      await act(async () => {
        result.current.stopGenerateMessage();
      });

      expect(abortController.signal.aborted).toBe(true);
    });

    it('should do nothing if no abortController exists', async () => {
      const { result } = renderHook(() => useChatStore());
      await act(async () => {
        result.current.stopGenerateMessage();
      });

      expect(result.current.chatLoadingIdsAbortController).toBeUndefined();
    });
  });

  describe('internal_fetchAIChatMessage', () => {
    it('should handle errors during AI chat message fetch', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [
        {
          id: 'message-id',
          content: 'Hello',
          role: 'user',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          meta: {},
        },
      ] as ChatMessage[];

      (chatService.createAssistantMessageStream as Mock).mockImplementationOnce(
        async ({ onErrorHandle }) => {
          await onErrorHandle(new Error('Test Error'));
        },
      );

      const refreshMessagesSpy = vi.spyOn(result.current, 'refreshMessages');

      await act(async () => {
        await result.current.internal_fetchAIChatMessage(messages, 'assistant-message-id');
      });

      expect(messageService.updateMessageError).toHaveBeenCalledWith(
        'assistant-message-id',
        expect.any(Error),
      );
      expect(refreshMessagesSpy).toHaveBeenCalled();
    });
  });
});
