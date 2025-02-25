import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { DEFAULT_AGENT_CHAT_CONFIG, DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { sessionService } from '@/services/session';
import { topicService } from '@/services/topic';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { UploadFileItem } from '@/types/files/upload';
import { ChatMessage } from '@/types/message';

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
    removeMessagesByAssistant: vi.fn(),
    removeMessages: vi.fn(() => Promise.resolve()),
    createMessage: vi.fn(() => Promise.resolve('new-message-id')),
    updateMessage: vi.fn(),
    removeAllMessages: vi.fn(() => Promise.resolve()),
  },
}));
vi.mock('@/services/topic', () => ({
  topicService: {
    createTopic: vi.fn(() => Promise.resolve()),
    removeTopic: vi.fn(() => Promise.resolve()),
  },
}));
vi.mock('@/services/chat', async (importOriginal) => {
  const module = await importOriginal();

  return {
    chatService: {
      createAssistantMessage: vi.fn(() => Promise.resolve('assistant-message')),
      createAssistantMessageStream: (module as any).chatService.createAssistantMessageStream,
    },
  };
});
vi.mock('@/services/session', async (importOriginal) => {
  const module = await importOriginal();

  return {
    sessionService: {
      updateSession: vi.fn(),
    },
  };
});

const realCoreProcessMessage = useChatStore.getState().internal_coreProcessMessage;

// Mock state
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
  vi.spyOn(sessionMetaSelectors, 'currentAgentMeta').mockImplementation(() => ({ tags: [] }));
});

afterEach(() => {
  process.env.NEXT_PUBLIC_BASE_PATH = undefined;
  vi.restoreAllMocks();
});

describe('chatMessage actions', () => {
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

    it('should not send message if message is empty and there are no files', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = '';

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

      // Mock messageService.create to resolve with a message id
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

    it('should add user message and not call internal_coreProcessMessage if onlyAddUserMessage = true', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', onlyAddUserMessage: true });
      });

      expect(messageService.createMessage).toHaveBeenCalled();
      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
    });
  });

  describe('regenerateMessage', () => {
    it('should create a new message', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const resendMessageSpy = vi.spyOn(result.current, 'internal_resendMessage');

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          activeTopicId: undefined,
          messagesMap: {
            [messageMapKey('session-id')]: [
              {
                id: messageId,
                tools: [{ id: 'tool1' }, { id: 'tool2' }],
                traceId: 'abc',
              } as ChatMessage,
            ],
          },
        });
      });
      await act(async () => {
        await result.current.regenerateMessage(messageId);
      });

      expect(resendMessageSpy).toHaveBeenCalledWith(messageId, { traceId: 'abc' });
    });
  });

  describe('internal_toggleToolCallingStreaming', () => {
    it('should add message id to messageLoadingIds when loading is true', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';

      act(() => {
        result.current.internal_toggleToolCallingStreaming(messageId, [true]);
      });

      expect(result.current.toolCallingStreamIds[messageId]).toEqual([true]);
    });

    it('should remove message id from messageLoadingIds when loading is false', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'ddd-id';

      act(() => {
        result.current.internal_toggleToolCallingStreaming(messageId, [true]);
        result.current.internal_toggleToolCallingStreaming(messageId, undefined);
      });

      expect(result.current.toolCallingStreamIds[messageId]).toBeUndefined();
    });
  });
});
