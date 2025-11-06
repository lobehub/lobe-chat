import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { UploadFileItem } from '@/types/files/upload';

import { useChatStore } from '../../../../store';
import { TEST_CONTENT, TEST_IDS, createMockMessage, createMockMessages } from './fixtures';
import {
  resetTestEnvironment,
  setupMockSelectors,
  setupStoreWithMessages,
  spyOnChatService,
  spyOnMessageService,
} from './helpers';

// Keep zustand mock as it's needed globally
vi.mock('zustand/traditional');

const realExecAgentRuntime = useChatStore.getState().internal_execAgentRuntime;

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();

  // Setup default spies that most tests need
  spyOnMessageService();
  // ✅ Removed spyOnChatService() - tests should spy chatService only when needed

  // Setup common mock methods that most tests need
  act(() => {
    useChatStore.setState({
      refreshMessages: vi.fn(),
      refreshTopic: vi.fn(),
      internal_execAgentRuntime: vi.fn(),
    });
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
        act(() => {
          useChatStore.setState({ activeId: undefined });
        });

        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(messageService.createMessage).not.toHaveBeenCalled();
        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
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
      it('should not process AI when onlyAddUserMessage is true', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({
            message: TEST_CONTENT.USER_MESSAGE,
            onlyAddUserMessage: true,
          });
        });

        expect(messageService.createMessage).toHaveBeenCalled();
        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
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

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
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
      const abortController = new AbortController();

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: abortController });
      });

      const { result } = renderHook(() => useChatStore());
      const toggleLoadingSpy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        result.current.stopGenerateMessage();
      });

      expect(abortController.signal.aborted).toBe(true);
      expect(toggleLoadingSpy).toHaveBeenCalledWith(false, undefined, expect.any(String));
    });

    it('should do nothing when abort controller is not set', () => {
      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: undefined });
      });

      const { result } = renderHook(() => useChatStore());
      const toggleLoadingSpy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        result.current.stopGenerateMessage();
      });

      expect(toggleLoadingSpy).not.toHaveBeenCalled();
    });
  });

  describe('internal_fetchAIChatMessage', () => {
    it('should fetch and return AI chat response', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      // ✅ Mock chatService instead of global fetch
      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          // Simulate text chunks streaming
          await onMessageHandle?.({ type: 'text', text: TEST_CONTENT.AI_RESPONSE } as any);
          await onFinish?.(TEST_CONTENT.AI_RESPONSE, {});
        });

      await act(async () => {
        const response = await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
        expect(response.isFunctionCall).toEqual(false);
        expect(response.content).toEqual(TEST_CONTENT.AI_RESPONSE);
      });

      streamSpy.mockRestore();
    });

    it('should handle streaming errors gracefully', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      // ✅ Mock chatService to simulate error
      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onErrorHandle }) => {
          await onErrorHandle?.({ type: 'InvalidProviderAPIKey', message: 'Network error' } as any);
        });

      const updateMessageErrorSpy = vi.spyOn(messageService, 'updateMessageError');

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          model: 'gpt-4o-mini',
          provider: 'openai',
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
        });
      });

      expect(updateMessageErrorSpy).toHaveBeenCalledWith(
        TEST_IDS.ASSISTANT_MESSAGE_ID,
        expect.objectContaining({ type: 'InvalidProviderAPIKey' }),
      );

      streamSpy.mockRestore();
    });

    it('should handle tool call chunks during streaming', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({
            type: 'tool_calls',
            isAnimationActives: [true],
            tool_calls: [
              { id: 'tool-1', type: 'function', function: { name: 'test', arguments: '{}' } },
            ],
          } as any);
          await onFinish?.(TEST_CONTENT.AI_RESPONSE, {
            toolCalls: [
              { id: 'tool-1', type: 'function', function: { name: 'test', arguments: '{}' } },
            ],
          } as any);
        });

      await act(async () => {
        const response = await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
        expect(response.isFunctionCall).toEqual(true);
      });

      streamSpy.mockRestore();
    });

    it('should handle text chunks during streaming', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];
      const dispatchSpy = vi.spyOn(result.current, 'internal_dispatchMessage');

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({ type: 'text', text: 'Hello' } as any);
          await onMessageHandle?.({ type: 'text', text: ' World' } as any);
          await onFinish?.('Hello World', {} as any);
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
      });

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: TEST_IDS.ASSISTANT_MESSAGE_ID,
          type: 'updateMessage',
          value: expect.objectContaining({ content: 'Hello' }),
        }),
      );

      streamSpy.mockRestore();
    });

    it('should handle reasoning chunks during streaming', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];
      const dispatchSpy = vi.spyOn(result.current, 'internal_dispatchMessage');

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({ type: 'reasoning', text: 'Thinking...' } as any);
          await onMessageHandle?.({ type: 'text', text: 'Answer' } as any);
          await onFinish?.('Answer', {} as any);
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
      });

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: TEST_IDS.ASSISTANT_MESSAGE_ID,
          type: 'updateMessage',
          value: expect.objectContaining({ reasoning: { content: 'Thinking...' } }),
        }),
      );

      streamSpy.mockRestore();
    });

    it('should skip grounding when citations are empty', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];
      const dispatchSpy = vi.spyOn(result.current, 'internal_dispatchMessage');

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({
            type: 'grounding',
            grounding: { citations: [], searchQueries: [] },
          } as any);
          await onFinish?.('Answer', {} as any);
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
      });

      // Should not dispatch when citations are empty
      const groundingCalls = dispatchSpy.mock.calls.filter((call) => {
        const dispatch = call[0];
        return dispatch?.type === 'updateMessage' && 'value' in dispatch && dispatch.value?.search;
      });
      expect(groundingCalls).toHaveLength(0);

      streamSpy.mockRestore();
    });

    it('should handle grounding chunks during streaming', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];
      const dispatchSpy = vi.spyOn(result.current, 'internal_dispatchMessage');

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({
            type: 'grounding',
            grounding: {
              citations: [{ url: 'https://example.com', title: 'Example' }],
              searchQueries: ['test query'],
            },
          } as any);
          await onFinish?.('Answer', {} as any);
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
      });

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: TEST_IDS.ASSISTANT_MESSAGE_ID,
          type: 'updateMessage',
          value: expect.objectContaining({
            search: expect.objectContaining({
              citations: expect.any(Array),
            }),
          }),
        }),
      );

      streamSpy.mockRestore();
    });

    it('should handle base64 image chunks during streaming', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];
      const dispatchSpy = vi.spyOn(result.current, 'internal_dispatchMessage');

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({
            type: 'base64_image',
            image: { id: 'img-1', data: 'base64data' },
            images: [{ id: 'img-1', data: 'base64data' }],
          } as any);
          await onFinish?.('Answer', {} as any);
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
      });

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: TEST_IDS.ASSISTANT_MESSAGE_ID,
          type: 'updateMessage',
          value: expect.objectContaining({
            imageList: expect.any(Array),
          }),
        }),
      );

      streamSpy.mockRestore();
    });

    it('should handle empty tool call arguments', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onFinish }) => {
          await onFinish?.(TEST_CONTENT.AI_RESPONSE, {
            toolCalls: [
              { id: 'tool-1', type: 'function', function: { name: 'test', arguments: '' } },
            ],
          } as any);
        });

      await act(async () => {
        const response = await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
        expect(response.isFunctionCall).toEqual(true);
      });

      streamSpy.mockRestore();
    });

    it('should update message with traceId when provided in onFinish', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];
      const traceId = 'test-trace-123';

      const updateMessageSpy = vi.spyOn(messageService, 'updateMessage');
      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onFinish }) => {
          await onFinish?.(TEST_CONTENT.AI_RESPONSE, { traceId } as any);
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
      });

      expect(updateMessageSpy).toHaveBeenCalledWith(
        TEST_IDS.ASSISTANT_MESSAGE_ID,
        expect.objectContaining({ traceId }),
      );

      streamSpy.mockRestore();
    });
  });

  describe('internal_resendMessage', () => {
    it('should not resend when message does not exist', async () => {
      const { result } = renderHook(() => useChatStore());
      const coreProcessSpy = vi.fn();

      act(() => {
        setupStoreWithMessages([]);
        useChatStore.setState({ internal_execAgentRuntime: coreProcessSpy });
      });

      await act(async () => {
        await result.current.internal_resendMessage('non-existent-id');
      });

      expect(coreProcessSpy).not.toHaveBeenCalled();
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
      const existingController = new AbortController();

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: existingController });
      });

      const { result } = renderHook(() => useChatStore());

      act(() => {
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

  describe('internal_toggleSearchWorkflow', () => {
    it('should enable search workflow loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleSearchWorkflow(true, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.searchWorkflowLoadingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable search workflow loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleSearchWorkflow(true, TEST_IDS.MESSAGE_ID);
        result.current.internal_toggleSearchWorkflow(false, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.searchWorkflowLoadingIds).toEqual([]);
    });
  });

  describe('internal_toggleChatReasoning', () => {
    it('should enable reasoning loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatReasoning(true, TEST_IDS.MESSAGE_ID, 'test-action');
      });

      const state = useChatStore.getState();
      expect(state.reasoningLoadingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable reasoning loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatReasoning(true, TEST_IDS.MESSAGE_ID, 'start');
        result.current.internal_toggleChatReasoning(false, TEST_IDS.MESSAGE_ID, 'stop');
      });

      const state = useChatStore.getState();
      expect(state.reasoningLoadingIds).toEqual([]);
    });
  });

  describe('internal_toggleMessageInToolsCalling', () => {
    it('should enable tools calling state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleMessageInToolsCalling(true, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.messageInToolsCallingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable tools calling state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleMessageInToolsCalling(true, TEST_IDS.MESSAGE_ID);
        result.current.internal_toggleMessageInToolsCalling(false, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.messageInToolsCallingIds).toEqual([]);
    });
  });

  describe('internal_resendMessage with custom params', () => {
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

      // Should handle the case where parentId is not found
      expect(result.current.internal_execAgentRuntime).toHaveBeenCalled();
    });
  });
});
