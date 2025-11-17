import { UIChatMessage } from '@lobechat/types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';

import { useChatStore } from '../../../../store';
import { TEST_CONTENT, TEST_IDS, createMockMessage } from './fixtures';
import { resetTestEnvironment, setupMockSelectors, spyOnMessageService } from './helpers';

// Keep zustand mock as it's needed globally
vi.mock('zustand/traditional');

const realExecAgentRuntime = useChatStore.getState().internal_execAgentRuntime;

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();
  spyOnMessageService();

  act(() => {
    useChatStore.setState({
      refreshMessages: vi.fn(),
      internal_execAgentRuntime: vi.fn(),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('StreamingExecutor actions', () => {
  describe('internal_fetchAIChatMessage', () => {
    it('should fetch and return AI chat response', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
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

  describe('internal_execAgentRuntime', () => {
    it('should handle the core AI message processing', async () => {
      act(() => {
        useChatStore.setState({ internal_execAgentRuntime: realExecAgentRuntime });
      });

      const { result } = renderHook(() => useChatStore());
      const userMessage = {
        id: TEST_IDS.USER_MESSAGE_ID,
        role: 'user',
        content: TEST_CONTENT.USER_MESSAGE,
        sessionId: TEST_IDS.SESSION_ID,
        topicId: TEST_IDS.TOPIC_ID,
      } as UIChatMessage;
      const messages = [userMessage];

      const streamSpy = vi.spyOn(chatService, 'createAssistantMessageStream');

      await act(async () => {
        await result.current.internal_execAgentRuntime({
          messages,
          parentMessageId: userMessage.id,
          parentMessageType: 'user',
        });
      });

      expect(streamSpy).toHaveBeenCalled();
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });

    it('should use provided sessionId/topicId for trace parameters', async () => {
      act(() => {
        useChatStore.setState({
          internal_execAgentRuntime: realExecAgentRuntime,
          activeId: 'active-session',
          activeTopicId: 'active-topic',
        });
      });

      const { result } = renderHook(() => useChatStore());
      const contextSessionId = 'context-session';
      const contextTopicId = 'context-topic';
      const userMessage = {
        id: TEST_IDS.USER_MESSAGE_ID,
        role: 'user',
        content: TEST_CONTENT.USER_MESSAGE,
        sessionId: contextSessionId,
        topicId: contextTopicId,
      } as UIChatMessage;

      const streamSpy = vi.spyOn(chatService, 'createAssistantMessageStream');

      await act(async () => {
        await result.current.internal_execAgentRuntime({
          messages: [userMessage],
          parentMessageId: userMessage.id,
          parentMessageType: 'user',
          sessionId: contextSessionId,
          topicId: contextTopicId,
        });
      });

      // Verify trace was called with context sessionId/topicId, not active ones
      expect(streamSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          trace: expect.objectContaining({
            sessionId: contextSessionId,
            topicId: contextTopicId,
          }),
        }),
      );
    });

    it('should pass context to optimisticUpdateMessageRAG', async () => {
      act(() => {
        useChatStore.setState({
          internal_execAgentRuntime: realExecAgentRuntime,
          activeId: 'active-session',
          activeTopicId: 'active-topic',
        });
      });

      const { result } = renderHook(() => useChatStore());
      const contextSessionId = 'context-session';
      const contextTopicId = 'context-topic';
      const userMessage = {
        id: TEST_IDS.USER_MESSAGE_ID,
        role: 'user',
        content: TEST_CONTENT.USER_MESSAGE,
        sessionId: contextSessionId,
        topicId: contextTopicId,
      } as UIChatMessage;

      const ragMetadata = {
        ragQueryId: 'query-id',
        fileChunks: [{ id: 'chunk-1', similarity: 0.9 }],
      };

      const updateRAGSpy = vi.spyOn(result.current, 'optimisticUpdateMessageRAG');
      const streamSpy = vi.spyOn(chatService, 'createAssistantMessageStream');

      await act(async () => {
        await result.current.internal_execAgentRuntime({
          messages: [userMessage],
          parentMessageId: userMessage.id,
          parentMessageType: 'user',
          sessionId: contextSessionId,
          topicId: contextTopicId,
          ragMetadata,
        });
      });

      // Verify optimisticUpdateMessageRAG was called with context
      await vi.waitFor(() => {
        expect(updateRAGSpy).toHaveBeenCalledWith(expect.any(String), ragMetadata, {
          sessionId: contextSessionId,
          topicId: contextTopicId,
        });
      });

      streamSpy.mockRestore();
    });
  });

  describe('StreamingExecutor OptimisticUpdateContext isolation', () => {
    it('should pass context to optimisticUpdateMessageContent in internal_fetchAIChatMessage', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];
      const contextSessionId = 'context-session';
      const contextTopicId = 'context-topic';

      const updateContentSpy = vi.spyOn(result.current, 'optimisticUpdateMessageContent');

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({ type: 'text', text: TEST_CONTENT.AI_RESPONSE } as any);
          await onFinish?.(TEST_CONTENT.AI_RESPONSE, {});
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
          params: {
            sessionId: contextSessionId,
            topicId: contextTopicId,
          },
        });
      });

      expect(updateContentSpy).toHaveBeenCalledWith(
        TEST_IDS.ASSISTANT_MESSAGE_ID,
        TEST_CONTENT.AI_RESPONSE,
        expect.any(Object),
        {
          sessionId: contextSessionId,
          topicId: contextTopicId,
        },
      );

      streamSpy.mockRestore();
    });

    it('should use activeId/activeTopicId when context not provided', async () => {
      act(() => {
        useChatStore.setState({
          activeId: 'active-session',
          activeTopicId: 'active-topic',
        });
      });

      const { result } = renderHook(() => useChatStore());
      const messages = [createMockMessage({ role: 'user' })];

      const updateContentSpy = vi.spyOn(result.current, 'optimisticUpdateMessageContent');

      const streamSpy = vi
        .spyOn(chatService, 'createAssistantMessageStream')
        .mockImplementation(async ({ onMessageHandle, onFinish }) => {
          await onMessageHandle?.({ type: 'text', text: TEST_CONTENT.AI_RESPONSE } as any);
          await onFinish?.(TEST_CONTENT.AI_RESPONSE, {});
        });

      await act(async () => {
        await result.current.internal_fetchAIChatMessage({
          messages,
          messageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
          model: 'gpt-4o-mini',
          provider: 'openai',
        });
      });

      expect(updateContentSpy).toHaveBeenCalledWith(
        TEST_IDS.ASSISTANT_MESSAGE_ID,
        TEST_CONTENT.AI_RESPONSE,
        expect.any(Object),
        {
          sessionId: undefined,
          topicId: undefined,
        },
      );

      streamSpy.mockRestore();
    });
  });
});
