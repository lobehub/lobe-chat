import { act, renderHook } from '@testing-library/react';
import { TRPCClientError } from '@trpc/client';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import {
  DEFAULT_AGENT_CHAT_CONFIG,
  DEFAULT_AGENT_CONFIG,
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
} from '@/const/settings';
import { aiChatService } from '@/services/aiChat';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { UploadFileItem } from '@/types/files/upload';
import { ChatMessage } from '@/types/message';

import { useChatStore } from '../../../../store';
import { messageMapKey } from '../../../../utils/messageMapKey';

vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve(new Response('mock'))),
);

vi.mock('zustand/traditional');
vi.mock('@/const/version', async (importOriginal) => {
  const module = await importOriginal();
  return {
    ...(module as any),
    isServerMode: true,
    isDesktop: false,
  };
});
vi.mock('@/services/aiChat', () => ({
  aiChatService: {
    sendMessageInServer: vi.fn(async (params: any) => {
      const userId = 'user-message-id';
      const assistantId = 'assistant-message-id';
      const topicId = params.topicId ?? 'topic-id';
      return {
        messages: [
          {
            id: userId,
            role: 'user',
            content: params.newUserMessage?.content ?? '',
            sessionId: params.sessionId ?? 'session-id',
            topicId,
          } as any,
          {
            id: assistantId,
            role: 'assistant',
            content: LOADING_FLAT,
            sessionId: params.sessionId ?? 'session-id',
            topicId,
          } as any,
        ],
        topics: [],
        topicId,
        userMessageId: userId,
        assistantMessageId: assistantId,
        isCreatNewTopic: !params.topicId,
      } as any;
    }),
  },
}));
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

const realCoreProcessMessage = useChatStore.getState().internal_execAgentRuntime;

// Mock state
const mockState = {
  activeId: 'session-id',
  activeTopicId: 'topic-id',
  messages: [],
  messagesMap: {},
  mainSendMessageOperations: {},
  refreshMessages: vi.fn(),
  refreshTopic: vi.fn(),
  internal_execAgentRuntime: vi.fn(),
  saveToTopic: vi.fn(),
  switchTopic: vi.fn(),
  internal_shouldUseRAG: () => false,
  internal_retrieveChunks: vi.fn(),
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  useChatStore.setState(mockState, false);
  vi.spyOn(agentSelectors, 'currentAgentConfig').mockImplementation(() => DEFAULT_AGENT_CONFIG);
  vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockImplementation(
    () => DEFAULT_AGENT_CHAT_CONFIG,
  );
  vi.spyOn(sessionMetaSelectors, 'currentAgentMeta').mockImplementation(() => ({ tags: [] }));
});

afterEach(() => {
  process.env.NEXT_PUBLIC_BASE_PATH = undefined;

  vi.restoreAllMocks();
});

describe('generateAIChatV2 actions', () => {
  describe('sendMessageInServer', () => {
    it('should not send message if there is no active session', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message';

      await act(async () => {
        useChatStore.setState({ activeId: undefined });
        await result.current.sendMessage({ message });
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
    });

    it('should not send message if message is empty and there are no files', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = '';

      await act(async () => {
        await result.current.sendMessage({ message });
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
    });

    it('should not send message if message is empty and there are empty files', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = '';

      await act(async () => {
        await result.current.sendMessage({ message, files: [] });
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
    });

    it('should create message and call internal_execAgentRuntime if message or files are provided', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message';
      const files = [{ id: 'file-id' } as UploadFileItem];

      // Mock messageService.create to resolve with a message id
      (messageService.createMessage as Mock).mockResolvedValue('new-message-id');

      await act(async () => {
        await result.current.sendMessage({ message, files });
      });

      expect(aiChatService.sendMessageInServer).toHaveBeenCalledWith(
        {
          newAssistantMessage: {
            model: DEFAULT_MODEL,
            provider: DEFAULT_PROVIDER,
          },
          newUserMessage: {
            content: message,
            files: files.map((f) => f.id),
          },
          sessionId: mockState.activeId,
          topicId: mockState.activeTopicId,
        },
        expect.anything(),
      );
      expect(result.current.internal_execAgentRuntime).toHaveBeenCalled();
    });

    it('should handle RAG query when internal_shouldUseRAG returns true', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test RAG query';

      vi.spyOn(result.current, 'internal_shouldUseRAG').mockReturnValue(true);

      await act(async () => {
        await result.current.sendMessage({ message });
      });

      expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          ragQuery: message,
        }),
      );
    });

    it('should not use RAG when internal_shouldUseRAG returns false', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test without RAG';

      vi.spyOn(result.current, 'internal_shouldUseRAG').mockReturnValue(false);
      vi.spyOn(result.current, 'internal_retrieveChunks');

      await act(async () => {
        await result.current.sendMessage({ message });
      });

      expect(result.current.internal_retrieveChunks).not.toHaveBeenCalled();
      expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          ragQuery: undefined,
        }),
      );
    });

    it('should add user message and not call internal_execAgentRuntime if onlyAddUserMessage = true', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', onlyAddUserMessage: true });
      });

      expect(messageService.createMessage).toHaveBeenCalled();
      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
    });

    it('should pass isWelcomeQuestion correctly to internal_execAgentRuntime when isWelcomeQuestion is true', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', isWelcomeQuestion: true });
      });

      expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          isWelcomeQuestion: true,
        }),
      );
    });

    it('should send message correctly when only files are provided without message content', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: '', files: [{ id: 'file-1' }] as any });
      });

      expect(aiChatService.sendMessageInServer).toHaveBeenCalledWith(
        {
          newAssistantMessage: {
            model: DEFAULT_MODEL,
            provider: DEFAULT_PROVIDER,
          },
          newUserMessage: {
            content: '',
            files: ['file-1'],
          },
          sessionId: 'session-id',
          topicId: 'topic-id',
        },
        expect.anything(),
      );
    });

    it('should send message correctly when both files and message content are provided', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', files: [{ id: 'file-1' }] as any });
      });

      expect(aiChatService.sendMessageInServer).toHaveBeenCalledWith(
        {
          newAssistantMessage: {
            model: DEFAULT_MODEL,
            provider: DEFAULT_PROVIDER,
          },
          newUserMessage: {
            content: 'test',
            files: ['file-1'],
          },
          sessionId: 'session-id',
          topicId: 'topic-id',
        },
        expect.anything(),
      );
    });

    it('should handle errors correctly when createMessage throws error without affecting the app', async () => {
      const { result } = renderHook(() => useChatStore());
      vi.spyOn(aiChatService, 'sendMessageInServer').mockRejectedValue(
        new Error('create message error'),
      );

      try {
        await result.current.sendMessage({ message: 'test' });
      } catch (e) {}

      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
    });

    // it('自动创建主题成功后,正确地将消息复制到新主题,并删除之前的临时消息', async () => {
    //   const { result } = renderHook(() => useChatStore());
    //   act(() => {
    //     useAgentStore.setState({
    //       agentConfig: { enableAutoCreateTopic: true, autoCreateTopicThreshold: 1 },
    //     });
    //
    //     useChatStore.setState({
    //       // Mock the currentChats selector to return a list that does not reach the threshold
    //       messagesMap: {
    //         [messageMapKey('inbox')]: [{ id: '1' }, { id: '2' }] as ChatMessage[],
    //       },
    //       activeId: 'inbox',
    //     });
    //   });
    //   vi.spyOn(topicService, 'createTopic').mockResolvedValue('new-topic');
    //
    //   await act(async () => {
    //     await result.current.sendMessage({ message: 'test' });
    //   });
    //
    //   expect(result.current.messagesMap[messageMapKey('inbox')]).toEqual([
    //     // { id: '1' },
    //     // { id: '2' },
    //     // { id: 'temp-id', content: 'test', role: 'user' },
    //   ]);
    //   // expect(result.current.getMessages('session-id')).toEqual([]);
    // });

    // it('自动创建主题失败时,正确地处理错误,不会影响后续的消息发送', async () => {
    //   const { result } = renderHook(() => useChatStore());
    //   result.current.setAgentConfig({ enableAutoCreateTopic: true, autoCreateTopicThreshold: 1 });
    //   result.current.setMessages([{ id: '1' }, { id: '2' }] as any);
    //   vi.spyOn(topicService, 'createTopic').mockRejectedValue(new Error('create topic error'));
    //
    //   await act(async () => {
    //     await result.current.sendMessage({ message: 'test' });
    //   });
    //
    //   expect(result.current.getMessages('session-id')).toEqual([
    //     { id: '1' },
    //     { id: '2' },
    //     { id: 'new-message-id', content: 'test', role: 'user' },
    //   ]);
    // });

    // it('当 activeTopicId 不存在且 autoCreateTopic 为 true,但消息数量未达到阈值时,正确地总结主题标题', async () => {
    //   const { result } = renderHook(() => useChatStore());
    //   result.current.setAgentConfig({ enableAutoCreateTopic: true, autoCreateTopicThreshold: 10 });
    //   result.current.setMessages([{ id: '1' }, { id: '2' }] as any);
    //   result.current.setActiveTopic({ id: 'topic-1', title: '' });
    //
    //   await act(async () => {
    //     await result.current.sendMessage({ message: 'test' });
    //   });
    //
    //   expect(result.current.summaryTopicTitle).toHaveBeenCalledWith('topic-1', [
    //     { id: '1' },
    //     { id: '2' },
    //     { id: 'new-message-id', content: 'test', role: 'user' },
    //     { id: 'assistant-message', role: 'assistant' },
    //   ]);
    // });
    //
    // it('当 activeTopicId 存在且主题标题为空时,正确地总结主题标题', async () => {
    //   const { result } = renderHook(() => useChatStore());
    //   result.current.setActiveTopic({ id: 'topic-1', title: '' });
    //   result.current.setMessages([{ id: '1' }, { id: '2' }] as any, 'session-id', 'topic-1');
    //
    //   await act(async () => {
    //     await result.current.sendMessage({ message: 'test' });
    //   });
    //
    //   expect(result.current.summaryTopicTitle).toHaveBeenCalledWith('topic-1', [
    //     { id: '1' },
    //     { id: '2' },
    //     { id: 'new-message-id', content: 'test', role: 'user' },
    //     { id: 'assistant-message', role: 'assistant' },
    //   ]);
    // });
  });

  describe('internal_execAgentRuntime', () => {
    it('should handle the core AI message processing', async () => {
      useChatStore.setState({ internal_execAgentRuntime: realCoreProcessMessage });

      const { result } = renderHook(() => useChatStore());
      const userMessage = {
        id: 'user-message-id',
        role: 'user',
        content: 'Hello, world!',
        sessionId: mockState.activeId,
        topicId: mockState.activeTopicId,
      } as ChatMessage;
      const messages = [userMessage];

      // 模拟 AI 响应
      const aiResponse = 'Hello, human!';
      (chatService.createAssistantMessage as Mock).mockResolvedValue(aiResponse);
      const spy = vi.spyOn(chatService, 'createAssistantMessageStream');

      await act(async () => {
        await result.current.internal_execAgentRuntime({
          messages,
          userMessageId: userMessage.id,
          assistantMessageId: 'abc',
        });
      });

      // 验证 AI 服务是否被调用
      expect(spy).toHaveBeenCalled();

      // 验证消息列表是否刷新
      expect(mockState.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('Error handling tests', () => {
    it('should set error message when sendMessageInServer throws a regular error', async () => {
      const { result } = renderHook(() => useChatStore());
      const errorMessage = 'Network error';
      const mockError = new TRPCClientError(errorMessage);
      (mockError as any).data = { code: 'BAD_REQUEST' };

      vi.spyOn(aiChatService, 'sendMessageInServer').mockRejectedValue(mockError);

      await act(async () => {
        await result.current.sendMessage({ message: 'test' });
      });

      const operationKey = messageMapKey('session-id', 'topic-id');
      expect(result.current.mainSendMessageOperations[operationKey]?.inputSendErrorMsg).toBe(
        errorMessage,
      );
    });

    it('should not set error message when receiving a cancel signal', async () => {
      const { result } = renderHook(() => useChatStore());
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      vi.spyOn(aiChatService, 'sendMessageInServer').mockRejectedValue(abortError);

      await act(async () => {
        await result.current.sendMessage({ message: 'test' });
      });

      const operationKey = messageMapKey('session-id', 'topic-id');
      expect(
        result.current.mainSendMessageOperations[operationKey]?.inputSendErrorMsg,
      ).toBeUndefined();
    });
  });

  describe('Temporary message cleanup tests', () => {
    it('should remove temporary message when creating new topic in default state', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message for new topic';

      vi.spyOn(aiChatService, 'sendMessageInServer').mockResolvedValueOnce({
        isCreatNewTopic: true,
        topicId: 'topic-id',
        messages: [{}, {}] as any,
        topics: [{}] as any,
        assistantMessageId: 'abc',
        userMessageId: 'user-',
      });

      await act(async () => {
        // Set up default state (no activeTopicId, simulating inbox)
        useChatStore.setState({
          ...mockState,
          activeTopicId: undefined, // This is the default state
          messagesMap: {},
        });

        await result.current.sendMessage({ message });
      });

      // Verify that deleteMessage was called for temporary message cleanup
      // This should happen because the mock aiChatService returns isCreatNewTopic: true
      expect(useChatStore.getState().messagesMap['session-id_null']).toEqual([]);
    });
  });

  describe('Topic switching tests', () => {
    it('should automatically switch to newly created topic when no active topic exists', async () => {
      const { result } = renderHook(() => useChatStore());
      const mockSwitchTopic = vi.fn();

      await act(async () => {
        useChatStore.setState({
          ...mockState,
          activeTopicId: undefined,
          switchTopic: mockSwitchTopic,
        });
        await result.current.sendMessage({ message: 'test' });
      });

      expect(mockSwitchTopic).toHaveBeenCalledWith('topic-id', true);
    });

    it('should not need to switch topic when active topic exists', async () => {
      const { result } = renderHook(() => useChatStore());
      const mockSwitchTopic = vi.fn();

      await act(async () => {
        useChatStore.setState({
          ...mockState,
          switchTopic: mockSwitchTopic,
        });
        await result.current.sendMessage({ message: 'test' });
      });

      expect(mockSwitchTopic).not.toHaveBeenCalled();
    });
  });

  describe('Cancel send message tests', () => {
    it('should correctly cancel the current active send operation', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbort = vi.fn();
      const mockSetJSONState = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          activeTopicId: 'topic-1',
          mainSendMessageOperations: {
            [messageMapKey('session-1', 'topic-1')]: {
              isLoading: true,
              abortController: { abort: mockAbort, signal: {} as any },
              inputEditorTempState: { content: 'saved content' },
            },
          },
          mainInputEditor: { setJSONState: mockSetJSONState } as any,
        });
      });

      act(() => {
        result.current.cancelSendMessageInServer();
      });

      expect(mockAbort).toHaveBeenCalledWith('User cancelled sendMessageInServer operation');
      expect(
        result.current.mainSendMessageOperations[messageMapKey('session-1', 'topic-1')]?.isLoading,
      ).toBe(false);
    });

    it('should cancel the operation for the corresponding topic when topic ID is specified', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbort = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          mainSendMessageOperations: {
            [messageMapKey('session-1', 'topic-2')]: {
              isLoading: true,
              abortController: { abort: mockAbort, signal: {} as any },
            },
          },
        });
      });

      act(() => {
        result.current.cancelSendMessageInServer('topic-2');
      });

      expect(mockAbort).toHaveBeenCalledWith('User cancelled sendMessageInServer operation');
    });

    it('should handle safely without throwing error when operation does not exist', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ mainSendMessageOperations: {} });
      });

      expect(() => {
        act(() => {
          result.current.cancelSendMessageInServer('non-existing-topic');
        });
      }).not.toThrow();
    });
  });

  describe('Clear send error tests', () => {
    it('should correctly clear error state for current topic', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          activeTopicId: 'topic-1',
          mainSendMessageOperations: {
            [messageMapKey('session-1', 'topic-1')]: {
              isLoading: false,
              inputSendErrorMsg: 'Some error',
            },
          },
        });
      });

      act(() => {
        result.current.clearSendMessageError();
      });

      expect(
        result.current.mainSendMessageOperations[messageMapKey('session-1', 'topic-1')],
      ).toBeUndefined();
    });

    it('should handle safely when no error operation exists', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ mainSendMessageOperations: {} });
      });

      expect(() => {
        act(() => {
          result.current.clearSendMessageError();
        });
      }).not.toThrow();
    });
  });

  describe('Operation state management tests', () => {
    it('should correctly create new send operation', () => {
      const { result } = renderHook(() => useChatStore());
      let abortController: AbortController | undefined;

      act(() => {
        abortController = result.current.internal_toggleSendMessageOperation('test-key', true);
      });

      expect(abortController!).toBeInstanceOf(AbortController);
      expect(result.current.mainSendMessageOperations['test-key']?.isLoading).toBe(true);
      expect(result.current.mainSendMessageOperations['test-key']?.abortController).toBe(
        abortController,
      );
    });

    it('should correctly stop send operation', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbortController = { abort: vi.fn() } as any;

      let abortController: AbortController | undefined;
      act(() => {
        result.current.internal_updateSendMessageOperation('test-key', {
          isLoading: true,
          abortController: mockAbortController,
        });

        abortController = result.current.internal_toggleSendMessageOperation('test-key', false);
      });

      expect(abortController).toBeUndefined();
      expect(result.current.mainSendMessageOperations['test-key']?.isLoading).toBe(false);
      expect(result.current.mainSendMessageOperations['test-key']?.abortController).toBeNull();
    });

    it('should correctly handle cancel reason and call abort method', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbortController = { abort: vi.fn() } as any;

      result.current.internal_updateSendMessageOperation('test-key', {
        isLoading: true,
        abortController: mockAbortController,
      });

      result.current.internal_toggleSendMessageOperation('test-key', false, 'Test cancel reason');

      expect(mockAbortController.abort).toHaveBeenCalledWith('Test cancel reason');
    });

    it('should support multiple parallel operations', () => {
      const { result } = renderHook(() => useChatStore());

      let abortController1, abortController2;
      act(() => {
        abortController1 = result.current.internal_toggleSendMessageOperation('pkey1', true);
        abortController2 = result.current.internal_toggleSendMessageOperation('pkey2', true);
      });

      expect(result.current.mainSendMessageOperations['pkey1']?.isLoading).toBe(true);
      expect(result.current.mainSendMessageOperations['pkey2']?.isLoading).toBe(true);
      expect(abortController1).not.toBe(abortController2);
    });
  });

  describe('Send operation state update tests', () => {
    it('should correctly update operation state', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbortController = new AbortController();

      act(() => {
        result.current.internal_updateSendMessageOperation('abc', {
          isLoading: true,
          abortController: mockAbortController,
          inputSendErrorMsg: 'test error',
        });
      });

      expect(result.current.mainSendMessageOperations['abc']).toEqual({
        isLoading: true,
        abortController: mockAbortController,
        inputSendErrorMsg: 'test error',
      });
    });

    it('should support partial update of operation state', () => {
      const { result } = renderHook(() => useChatStore());
      const initialController = new AbortController();

      act(() => {
        result.current.internal_updateSendMessageOperation('test-key', {
          isLoading: true,
          abortController: initialController,
        });

        // Only update error message
        result.current.internal_updateSendMessageOperation('test-key', {
          inputSendErrorMsg: 'new error',
        });
      });

      expect(result.current.mainSendMessageOperations['test-key']).toEqual({
        isLoading: true,
        abortController: initialController,
        inputSendErrorMsg: 'new error',
      });
    });
  });

  describe('Editor state recovery tests', () => {
    it('should restore editor content when cancelling operation', () => {
      const { result } = renderHook(() => useChatStore());
      const mockSetJSONState = vi.fn();
      const mockAbort = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          activeTopicId: 'topic-1',
          mainSendMessageOperations: {
            [messageMapKey('session-1', 'topic-1')]: {
              isLoading: true,
              abortController: { abort: mockAbort, signal: {} as any },
              inputEditorTempState: { content: 'saved content' },
            },
          },
          mainInputEditor: { setJSONState: mockSetJSONState } as any,
        });
      });

      act(() => {
        result.current.cancelSendMessageInServer();
      });

      expect(mockSetJSONState).toHaveBeenCalledWith({ content: 'saved content' });
    });

    it('should not restore when no saved editor state exists', () => {
      const { result } = renderHook(() => useChatStore());
      const mockSetJSONState = vi.fn();
      const mockAbort = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          activeTopicId: 'topic-1',
          mainSendMessageOperations: {
            [messageMapKey('session-1', 'topic-1')]: {
              isLoading: true,
              abortController: { abort: mockAbort, signal: {} as any },
            },
          },
          mainInputEditor: { setJSONState: mockSetJSONState } as any,
        });
        result.current.cancelSendMessageInServer();
      });

      expect(mockSetJSONState).not.toHaveBeenCalled();
    });
  });
});
