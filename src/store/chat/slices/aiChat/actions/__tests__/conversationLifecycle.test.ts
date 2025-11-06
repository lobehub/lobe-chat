import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiChatService } from '@/services/aiChat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';

import { useChatStore } from '../../../../store';
import { TEST_CONTENT, TEST_IDS, createMockMessage } from './fixtures';
import {
  resetTestEnvironment,
  setupMockSelectors,
  setupStoreWithMessages,
  spyOnMessageService,
} from './helpers';

// Keep zustand mock as it's needed globally
vi.mock('zustand/traditional');

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();
  spyOnMessageService();

  act(() => {
    useChatStore.setState({
      refreshMessages: vi.fn(),
      refreshTopic: vi.fn(),
      internal_execAgentRuntime: vi.fn(),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ConversationLifecycle actions', () => {
  describe('sendMessage', () => {
    describe('validation', () => {
      it('should not send when there is no active session', async () => {
        act(() => {
          useChatStore.setState({ activeId: undefined });
        });

        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });

      it('should not send when message is empty and no files are provided', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.EMPTY });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });

      it('should not send when message is empty with empty files array', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.EMPTY, files: [] });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });
    });

    describe('message creation', () => {
      it('should not process AI when onlyAddUserMessage is true', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.spyOn(aiChatService, 'sendMessageInServer').mockResolvedValue({
          messages: [],
          topics: [],
          assistantMessageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
        } as any);

        await act(async () => {
          await result.current.sendMessage({
            message: TEST_CONTENT.USER_MESSAGE,
            onlyAddUserMessage: true,
          });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });

      it('should create user message and trigger AI processing', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.spyOn(aiChatService, 'sendMessageInServer').mockResolvedValue({
          messages: [
            createMockMessage({ id: TEST_IDS.USER_MESSAGE_ID, role: 'user' }),
            createMockMessage({ id: TEST_IDS.ASSISTANT_MESSAGE_ID, role: 'assistant' }),
          ],
          topics: [],
          assistantMessageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
        } as any);

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(result.current.internal_execAgentRuntime).toHaveBeenCalled();
      });
    });
  });

  describe('regenerateMessage', () => {
    it('should trigger message regeneration', async () => {
      const messages = [
        createMockMessage({ id: TEST_IDS.USER_MESSAGE_ID, role: 'user' }),
        createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'assistant' }),
      ];

      setupStoreWithMessages(messages);

      act(() => {
        useChatStore.setState({
          internal_resendMessage: vi.fn(),
          internal_traceMessage: vi.fn(),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.regenerateMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(result.current.internal_resendMessage).toHaveBeenCalledWith(
        TEST_IDS.MESSAGE_ID,
        expect.any(Object),
      );
      expect(result.current.internal_traceMessage).toHaveBeenCalled();
    });
  });

  describe('delAndRegenerateMessage', () => {
    it('should delete message then regenerate', async () => {
      const messages = [
        createMockMessage({ id: TEST_IDS.USER_MESSAGE_ID, role: 'user' }),
        createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'assistant' }),
      ];

      setupStoreWithMessages(messages);

      act(() => {
        useChatStore.setState({
          internal_resendMessage: vi.fn(),
          deleteMessage: vi.fn(),
          internal_traceMessage: vi.fn(),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.delAndRegenerateMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(result.current.internal_resendMessage).toHaveBeenCalled();
      expect(result.current.deleteMessage).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID);
      expect(result.current.internal_traceMessage).toHaveBeenCalled();
    });
  });

  describe('internal_resendMessage', () => {
    it('should not resend when message does not exist', async () => {
      const { result } = renderHook(() => useChatStore());

      setupStoreWithMessages([]);

      await act(async () => {
        await result.current.internal_resendMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(result.current.refreshMessages).not.toHaveBeenCalled();
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

        expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({ id: 'msg-1' }),
              expect.objectContaining({ id: TEST_IDS.MESSAGE_ID }),
            ]),
            parentMessageId: TEST_IDS.MESSAGE_ID,
            parentMessageType: 'user',
            traceId: undefined,
          }),
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

        expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({ id: 'msg-1' }),
              expect.objectContaining({ id: parentId }),
            ]),
            parentMessageId: TEST_IDS.MESSAGE_ID,
            parentMessageType: 'user',
            traceId: undefined,
          }),
        );
      });

      it('should not process when context is empty', async () => {
        const { result } = renderHook(() => useChatStore());

        act(() => {
          useChatStore.setState({
            messagesMap: {
              [chatSelectors.currentChatKey(useChatStore.getState() as any)]: [],
            },
          });
        });

        await act(async () => {
          await result.current.internal_resendMessage(TEST_IDS.MESSAGE_ID);
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });

      it('should generate correct context for tool role message', async () => {
        const { result } = renderHook(() => useChatStore());
        const messages = [
          createMockMessage({ id: 'msg-1', role: 'user' }),
          createMockMessage({ id: 'msg-2', role: 'assistant' }),
          createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'tool' }),
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

        // For tool role, it processes all messages up to tool but uses last user message as parentId
        expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.any(Array),
            parentMessageId: TEST_IDS.MESSAGE_ID,
            parentMessageType: 'user',
            traceId: undefined,
          }),
        );
      });
    });

    describe('with custom params', () => {
      it('should use provided messages instead of store messages', async () => {
        const { result } = renderHook(() => useChatStore());
        const customMessages = [createMockMessage({ id: 'custom-msg', role: 'user' })];

        act(() => {
          useChatStore.setState({
            messagesMap: {
              [chatSelectors.currentChatKey(useChatStore.getState() as any)]: customMessages,
            },
          });
        });

        await act(async () => {
          await result.current.internal_resendMessage('custom-msg', { messages: customMessages });
        });

        expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([expect.objectContaining({ id: 'custom-msg' })]),
            parentMessageId: 'custom-msg',
            parentMessageType: 'user',
          }),
        );
      });

      it('should handle assistant message without parentId', async () => {
        const { result } = renderHook(() => useChatStore());
        const messages = [
          createMockMessage({ id: 'msg-1', role: 'user' }),
          createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'assistant', parentId: undefined }),
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

        // Should fallback to including all messages up to assistant message
        expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({ id: 'msg-1' }),
              expect.objectContaining({ id: TEST_IDS.MESSAGE_ID }),
            ]),
            parentMessageId: TEST_IDS.MESSAGE_ID,
            parentMessageType: 'user',
          }),
        );
      });
    });
  });

  describe('internal_refreshAiChat', () => {
    it('should refresh messages and topics', () => {
      const { result } = renderHook(() => useChatStore());
      const newMessages = [createMockMessage({ id: 'new-msg', role: 'user' })];
      const newTopics = [{ id: 'new-topic', title: 'New Topic' }] as any;

      act(() => {
        result.current.internal_refreshAiChat({
          messages: newMessages,
          topics: newTopics,
          sessionId: TEST_IDS.SESSION_ID,
        });
      });

      expect(result.current.topicMaps[TEST_IDS.SESSION_ID]).toEqual(newTopics);
    });
  });
});
