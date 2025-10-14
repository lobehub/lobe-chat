import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { UploadFileItem } from '@/types/files/upload';

import { useChatStore } from '../../../../store';
import { TEST_CONTENT, TEST_IDS, createMockMessage, createMockMessages } from './fixtures';
import { resetTestEnvironment, setupMockSelectors, setupStoreWithMessages } from './helpers';

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
  const original = await importOriginal();

  return {
    chatService: {
      createAssistantMessage: vi.fn(() => Promise.resolve('assistant-message')),
      createAssistantMessageStream: (original as any).chatService.createAssistantMessageStream,
    },
  };
});
vi.mock('@/services/session', () => ({
  sessionService: {
    updateSession: vi.fn(),
  },
}));

const realCoreProcessMessage = useChatStore.getState().internal_coreProcessMessage;

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();

  // Setup common mock methods that most tests need
  useChatStore.setState({
    refreshMessages: vi.fn(),
    refreshTopic: vi.fn(),
    internal_coreProcessMessage: vi.fn(),
  });
});

afterEach(() => {
  process.env.NEXT_PUBLIC_BASE_PATH = undefined;

  vi.restoreAllMocks();
});

describe('chatMessage actions', () => {
  describe('sendMessage', () => {
    describe('validation', () => {
      it('should not send when there is no active session', async () => {
        useChatStore.setState({ activeId: undefined });
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(messageService.createMessage).not.toHaveBeenCalled();
        expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
      });

      it('should not send when message is empty and no files are provided', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.EMPTY });
        });

        expect(messageService.createMessage).not.toHaveBeenCalled();
      });

      it('should not send when message is empty with empty files array', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.EMPTY, files: [] });
        });

        expect(messageService.createMessage).not.toHaveBeenCalled();
      });
    });

    describe('message creation', () => {
      it('should create user message and trigger AI processing', async () => {
        const { result } = renderHook(() => useChatStore());
        (messageService.createMessage as Mock).mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(messageService.createMessage).toHaveBeenCalledWith({
          content: TEST_CONTENT.USER_MESSAGE,
          files: undefined,
          role: 'user',
          sessionId: TEST_IDS.SESSION_ID,
          topicId: TEST_IDS.TOPIC_ID,
        });
        expect(result.current.internal_coreProcessMessage).toHaveBeenCalled();
      });

      it('should send message with files attached', async () => {
        const { result } = renderHook(() => useChatStore());
        const files = [{ id: TEST_IDS.FILE_ID } as UploadFileItem];
        (messageService.createMessage as Mock).mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE, files });
        });

        expect(messageService.createMessage).toHaveBeenCalledWith({
          content: TEST_CONTENT.USER_MESSAGE,
          files: [TEST_IDS.FILE_ID],
          role: 'user',
          sessionId: TEST_IDS.SESSION_ID,
          topicId: TEST_IDS.TOPIC_ID,
        });
      });

      it('should send files without message content', async () => {
        const { result } = renderHook(() => useChatStore());
        const files = [{ id: TEST_IDS.FILE_ID } as UploadFileItem];
        (messageService.createMessage as Mock).mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.EMPTY, files });
        });

        expect(messageService.createMessage).toHaveBeenCalledWith({
          content: TEST_CONTENT.EMPTY,
          files: [TEST_IDS.FILE_ID],
          role: 'user',
          sessionId: TEST_IDS.SESSION_ID,
          topicId: TEST_IDS.TOPIC_ID,
        });
      });

      it('should not process AI when onlyAddUserMessage is true', async () => {
        const { result } = renderHook(() => useChatStore());
        (messageService.createMessage as Mock).mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);

        await act(async () => {
          await result.current.sendMessage({
            message: TEST_CONTENT.USER_MESSAGE,
            onlyAddUserMessage: true,
          });
        });

        expect(messageService.createMessage).toHaveBeenCalled();
        expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
      });

      it('should handle message creation errors gracefully', async () => {
        const { result } = renderHook(() => useChatStore());
        vi.spyOn(messageService, 'createMessage').mockRejectedValue(
          new Error('create message error'),
        );

        await act(async () => {
          try {
            await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
          } catch {
            // Expected to throw
          }
        });

        expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
      });
    });

    describe('auto-create topic', () => {
      const TOPIC_THRESHOLD = 5;

      it('should create topic when threshold is reached and feature is enabled', async () => {
        const { result } = renderHook(() => useChatStore());
        vi.spyOn(messageService, 'createMessage').mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);

        setupMockSelectors({
          agentConfig: {
            enableAutoCreateTopic: true,
            autoCreateTopicThreshold: TOPIC_THRESHOLD,
          },
        });

        const createTopicMock = vi.fn(() => Promise.resolve(TEST_IDS.NEW_TOPIC_ID));
        const switchTopicMock = vi.fn();

        await act(async () => {
          useChatStore.setState({
            activeTopicId: undefined,
            messagesMap: {
              [messageMapKey(TEST_IDS.SESSION_ID)]: createMockMessages(TOPIC_THRESHOLD),
            },
            createTopic: createTopicMock,
            switchTopic: switchTopicMock,
          });

          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(createTopicMock).toHaveBeenCalled();
        expect(switchTopicMock).toHaveBeenCalledWith(TEST_IDS.NEW_TOPIC_ID, true);
      });
    });

    describe('RAG integration', () => {
      it('should include RAG query when RAG is enabled', async () => {
        const { result } = renderHook(() => useChatStore());
        vi.spyOn(messageService, 'createMessage').mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);
        vi.spyOn(result.current, 'internal_shouldUseRAG').mockReturnValue(true);

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.RAG_QUERY });
        });

        expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(String),
          expect.objectContaining({
            ragQuery: TEST_CONTENT.RAG_QUERY,
          }),
        );
      });

      it('should not use RAG when feature is disabled', async () => {
        const { result } = renderHook(() => useChatStore());
        vi.spyOn(messageService, 'createMessage').mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);
        vi.spyOn(result.current, 'internal_shouldUseRAG').mockReturnValue(false);
        const retrieveChunksSpy = vi.spyOn(result.current, 'internal_retrieveChunks');

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(retrieveChunksSpy).not.toHaveBeenCalled();
        expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(String),
          expect.not.objectContaining({
            ragQuery: expect.anything(),
          }),
        );
      });
    });

    describe('special flags', () => {
      it('should pass isWelcomeQuestion flag to processing', async () => {
        const { result } = renderHook(() => useChatStore());
        vi.spyOn(messageService, 'createMessage').mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);

        await act(async () => {
          await result.current.sendMessage({
            message: TEST_CONTENT.USER_MESSAGE,
            isWelcomeQuestion: true,
          });
        });

        expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          { isWelcomeQuestion: true },
        );
      });
    });
  });

  describe('regenerateMessage', () => {
    it('should trigger message regeneration', async () => {
      const { result } = renderHook(() => useChatStore());
      const traceId = 'test-trace-id';

      act(() => {
        setupStoreWithMessages([
          createMockMessage({
            id: TEST_IDS.MESSAGE_ID,
            tools: [{ id: 'tool1' }, { id: 'tool2' }] as any,
            traceId,
          }),
        ]);
      });

      const resendMessageSpy = vi.spyOn(result.current, 'internal_resendMessage');

      await act(async () => {
        await result.current.regenerateMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(resendMessageSpy).toHaveBeenCalledWith(
        TEST_IDS.MESSAGE_ID,
        expect.objectContaining({}),
      );
    });
  });

  describe('delAndRegenerateMessage', () => {
    it('should delete message then regenerate', async () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        setupStoreWithMessages([
          createMockMessage({
            id: TEST_IDS.MESSAGE_ID,
            tools: [{ id: 'tool1' }] as any,
          }),
        ]);
      });

      const deleteMessageSpy = vi.spyOn(result.current, 'deleteMessage');
      const resendMessageSpy = vi.spyOn(result.current, 'internal_resendMessage');

      await act(async () => {
        await result.current.delAndRegenerateMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(deleteMessageSpy).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID);
      expect(resendMessageSpy).toHaveBeenCalled();
    });
  });

  describe('stopGenerateMessage', () => {
    it('should abort generation and clear loading state when controller exists', () => {
      const { result } = renderHook(() => useChatStore());
      const abortController = new AbortController();
      const toggleLoadingSpy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: abortController });
        result.current.stopGenerateMessage();
      });

      expect(abortController.signal.aborted).toBe(true);
      expect(toggleLoadingSpy).toHaveBeenCalledWith(false, undefined, expect.any(String));
    });

    it('should do nothing when abort controller is not set', () => {
      const { result } = renderHook(() => useChatStore());
      const toggleLoadingSpy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: undefined });
        result.current.stopGenerateMessage();
      });

      expect(toggleLoadingSpy).not.toHaveBeenCalled();
    });
  });

  describe('internal_coreProcessMessage', () => {
    it('should process user message and generate AI response', async () => {
      useChatStore.setState({ internal_coreProcessMessage: realCoreProcessMessage });

      const { result } = renderHook(() => useChatStore());
      const userMessage = createMockMessage({
        id: TEST_IDS.USER_MESSAGE_ID,
        role: 'user',
        content: TEST_CONTENT.USER_MESSAGE,
      });

      (chatService.createAssistantMessage as Mock).mockResolvedValue(TEST_CONTENT.AI_RESPONSE);
      const streamSpy = vi.spyOn(chatService, 'createAssistantMessageStream');
      const createMessageSpy = vi
        .spyOn(messageService, 'createMessage')
        .mockResolvedValue(TEST_IDS.ASSISTANT_MESSAGE_ID);

      await act(async () => {
        await result.current.internal_coreProcessMessage([userMessage], userMessage.id);
      });

      expect(createMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'assistant',
          content: LOADING_FLAT,
          parentId: TEST_IDS.USER_MESSAGE_ID,
          sessionId: TEST_IDS.SESSION_ID,
          topicId: TEST_IDS.TOPIC_ID,
        }),
      );

      expect(streamSpy).toHaveBeenCalled();
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('internal_resendMessage', () => {
    it('should not resend when message does not exist', async () => {
      const { result } = renderHook(() => useChatStore());
      const coreProcessSpy = vi.fn();

      act(() => {
        setupStoreWithMessages([]);
        useChatStore.setState({ internal_coreProcessMessage: coreProcessSpy });
      });

      await act(async () => {
        await result.current.internal_resendMessage('non-existent-id');
      });

      expect(coreProcessSpy).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
    });
  });

  describe('internal_fetchAIChatMessage', () => {
    it('should fetch and return AI chat response', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      (fetch as Mock).mockResolvedValueOnce(new Response(TEST_CONTENT.AI_RESPONSE));

      await act(async () => {
        const response = await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
        expect(response.isFunctionCall).toEqual(false);
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        const response = await result.current.internal_fetchAIChatMessage({
          model: 'gpt-4o-mini',
          provider: 'openai',
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
        });

        expect(response).toEqual({
          content: '',
          isFunctionCall: false,
        });
      });
    });

    describe('context generation', () => {
      it('should generate correct context for user role message', async () => {
        const { result } = renderHook(() => useChatStore());
        const messages = [
          createMockMessage({ id: 'msg-1', role: 'system' }),
          createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'user', meta: { avatar: '😀' } }),
          createMockMessage({ id: 'msg-3', role: 'assistant' }),
        ];

        act(() => {
          useChatStore.setState({
            messagesMap: {
              [chatSelectors.currentChatKey(useChatStore.getState() as any)]: messages,
            },
          });
        });

        await act(async () => {
          await result.current.internal_resendMessage(TEST_IDS.MESSAGE_ID);
        });

        expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'msg-1' }),
            expect.objectContaining({ id: TEST_IDS.MESSAGE_ID }),
          ]),
          TEST_IDS.MESSAGE_ID,
          expect.objectContaining({ traceId: undefined }),
        );
      });

      it('should generate correct context for assistant role message', async () => {
        const { result } = renderHook(() => useChatStore());
        const parentId = 'msg-2';
        const messages = [
          createMockMessage({ id: 'msg-1', role: 'system' }),
          createMockMessage({ id: parentId, role: 'user', meta: { avatar: '😀' } }),
          createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'assistant', parentId }),
        ];

        act(() => {
          useChatStore.setState({
            messagesMap: {
              [chatSelectors.currentChatKey(useChatStore.getState() as any)]: messages,
            },
          });
        });

        await act(async () => {
          await result.current.internal_resendMessage(TEST_IDS.MESSAGE_ID);
        });

        expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'msg-1' }),
            expect.objectContaining({ id: parentId }),
          ]),
          parentId,
          expect.objectContaining({ traceId: undefined }),
        );
      });

      it('should not process when context is empty', async () => {
        const { result } = renderHook(() => useChatStore());

        useChatStore.setState({
          messagesMap: {
            [chatSelectors.currentChatKey(useChatStore.getState() as any)]: [],
          },
        });

        await act(async () => {
          await result.current.internal_resendMessage(TEST_IDS.MESSAGE_ID);
        });

        expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe('internal_toggleChatLoading', () => {
    it('should enable loading state with new abort controller', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'test-action');
      });

      const state = useChatStore.getState();
      expect(state.chatLoadingIdsAbortController).toBeInstanceOf(AbortController);
      expect(state.chatLoadingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable loading state and clear abort controller', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'start');
        result.current.internal_toggleChatLoading(false, undefined, 'stop');
      });

      const state = useChatStore.getState();
      expect(state.chatLoadingIdsAbortController).toBeUndefined();
      expect(state.chatLoadingIds).toEqual([]);
    });

    it('should manage beforeunload event listener', () => {
      const { result } = renderHook(() => useChatStore());
      const addListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

      act(() => {
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'start');
      });

      expect(addListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

      act(() => {
        result.current.internal_toggleChatLoading(false, undefined, 'stop');
      });

      expect(removeListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should reuse existing abort controller', () => {
      const { result } = renderHook(() => useChatStore());
      const existingController = new AbortController();

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: existingController });
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'test');
      });

      const state = useChatStore.getState();
      expect(state.chatLoadingIdsAbortController).toStrictEqual(existingController);
    });
  });

  describe('internal_toggleToolCallingStreaming', () => {
    it('should track tool calling stream status', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleToolCallingStreaming(TEST_IDS.MESSAGE_ID, [true]);
      });

      expect(result.current.toolCallingStreamIds[TEST_IDS.MESSAGE_ID]).toEqual([true]);
    });

    it('should clear tool calling stream status', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleToolCallingStreaming(TEST_IDS.MESSAGE_ID, [true]);
        result.current.internal_toggleToolCallingStreaming(TEST_IDS.MESSAGE_ID, undefined);
      });

      expect(result.current.toolCallingStreamIds[TEST_IDS.MESSAGE_ID]).toBeUndefined();
    });
  });
});
