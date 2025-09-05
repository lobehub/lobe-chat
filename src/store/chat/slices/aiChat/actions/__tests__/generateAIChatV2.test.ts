import { act, renderHook } from '@testing-library/react';
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
//
import { messageService } from '@/services/message';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { UploadFileItem } from '@/types/files/upload';
import { ChatMessage } from '@/types/message';

import { useChatStore } from '../../../../store';

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
  refreshMessages: vi.fn(),
  refreshTopic: vi.fn(),
  internal_execAgentRuntime: vi.fn(),
  saveToTopic: vi.fn(),
};

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
      useChatStore.setState({ activeId: undefined });
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message';

      await act(async () => {
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

      expect(aiChatService.sendMessageInServer).toHaveBeenCalledWith({
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
      });
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

    it('当 isWelcomeQuestion 为 true 时,正确地传递给 internal_execAgentRuntime', async () => {
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

    it('当只有文件而没有消息内容时,正确发送消息', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: '', files: [{ id: 'file-1' }] as any });
      });

      expect(aiChatService.sendMessageInServer).toHaveBeenCalledWith({
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
      });
    });

    it('当同时有文件和消息内容时,正确发送消息并关联文件', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', files: [{ id: 'file-1' }] as any });
      });

      expect(aiChatService.sendMessageInServer).toHaveBeenCalledWith({
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
      });
    });

    it('当 createMessage 抛出错误时,正确处理错误而不影响整个应用', async () => {
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
});
