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
import { sessionMetaSelectors } from '@/store/session/selectors';
import { UploadFileItem } from '@/types/files/upload';
import { ChatMessage } from '@/types/message';

import { useChatStore } from '../../store';

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

    it('should not send message if message is empty and there are empty files', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = '';

      await act(async () => {
        await result.current.sendMessage({ message, files: [] });
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

    describe('auto-create topic', () => {
      it('should not auto-create topic if enableAutoCreateTopic is false', async () => {
        const { result } = renderHook(() => useChatStore());
        const message = 'Test message';
        const autoCreateTopicThreshold = 5;
        const enableAutoCreateTopic = false;

        // Mock messageService.create to resolve with a message id
        (messageService.createMessage as Mock).mockResolvedValue('new-message-id');

        // Mock agent config to simulate auto-create topic behavior
        (agentSelectors.currentAgentConfig as Mock).mockImplementation(() => ({
          autoCreateTopicThreshold,
          enableAutoCreateTopic,
        }));

        // Mock saveToTopic and switchTopic to simulate not being called
        const saveToTopicMock = vi.fn();
        const switchTopicMock = vi.fn();

        await act(async () => {
          useChatStore.setState({
            ...mockState,
            // Mock the currentChats selector to return a list that does not reach the threshold
            messagesMap: {
              [messageMapKey('session-id')]: Array.from(
                { length: autoCreateTopicThreshold + 1 },
                (_, i) => ({
                  id: `msg-${i}`,
                }),
              ) as any,
            },
            activeTopicId: undefined,
            saveToTopic: saveToTopicMock,
            switchTopic: switchTopicMock,
          });

          await result.current.sendMessage({ message });
        });

        expect(saveToTopicMock).not.toHaveBeenCalled();
        expect(switchTopicMock).not.toHaveBeenCalled();
      });

      it('should auto-create topic and switch to it if enabled and threshold is reached', async () => {
        const { result } = renderHook(() => useChatStore());
        const message = 'Test message';
        const autoCreateTopicThreshold = 5;
        const enableAutoCreateTopic = true;

        // Mock agent config to simulate auto-create topic behavior
        (agentSelectors.currentAgentConfig as Mock).mockImplementation(() => ({
          autoCreateTopicThreshold,
          enableAutoCreateTopic,
        }));

        // Mock messageService.create to resolve with a message id
        (messageService.createMessage as Mock).mockResolvedValue('new-message-id');

        // Mock saveToTopic to resolve with a topic id and switchTopic to switch to the new topic
        const createTopicMock = vi.fn(() => Promise.resolve('new-topic-id'));
        const switchTopicMock = vi.fn();

        act(() => {
          useChatStore.setState({
            ...mockState,
            activeId: 'session_id',
            messagesMap: {
              [messageMapKey('session_id')]: Array.from(
                { length: autoCreateTopicThreshold },
                (_, i) => ({
                  id: `msg-${i}`,
                }),
              ) as any,
            },
            activeTopicId: undefined,
            createTopic: createTopicMock,
            switchTopic: switchTopicMock,
          });
        });

        await act(async () => {
          await result.current.sendMessage({ message });
        });

        expect(createTopicMock).toHaveBeenCalled();
        expect(switchTopicMock).toHaveBeenCalledWith('new-topic-id', true);
      });

      it('should not auto-create topic, if autoCreateTopic = false and reached topic threshold', async () => {
        const { result } = renderHook(() => useChatStore());
        act(() => {
          useAgentStore.setState({
            activeId: 'abc',
            agentMap: {
              abc: {
                chatConfig: {
                  enableAutoCreateTopic: false,
                  autoCreateTopicThreshold: 1,
                },
              },
            },
          });

          useChatStore.setState({
            // Mock the currentChats selector to return a list that does not reach the threshold
            messagesMap: {
              [messageMapKey('inbox')]: [{ id: '1' }, { id: '2' }] as ChatMessage[],
            },
            activeTopicId: 'inbox',
          });
        });

        await act(async () => {
          await result.current.sendMessage({ message: 'test' });
        });

        expect(topicService.createTopic).not.toHaveBeenCalled();
      });

      it('should not auto-create topic if autoCreateTopicThreshold is not reached', async () => {
        const { result } = renderHook(() => useChatStore());
        const message = 'Test message';
        const autoCreateTopicThreshold = 5;
        const enableAutoCreateTopic = true;

        // Mock messageService.create to resolve with a message id
        (messageService.createMessage as Mock).mockResolvedValue('new-message-id');

        // Mock agent config to simulate auto-create topic behavior
        (agentSelectors.currentAgentChatConfig as Mock).mockImplementation(() => ({
          autoCreateTopicThreshold,
          enableAutoCreateTopic,
        }));

        // Mock saveToTopic and switchTopic to simulate not being called
        const createTopicMock = vi.fn();
        const switchTopicMock = vi.fn();

        await act(async () => {
          useChatStore.setState({
            ...mockState,
            activeId: 'session_id',
            messagesMap: {
              // Mock the currentChats selector to return a list that does not reach the threshold
              [messageMapKey('session_id')]: Array.from(
                { length: autoCreateTopicThreshold - 3 },
                (_, i) => ({
                  id: `msg-${i}`,
                }),
              ) as any,
            },
            activeTopicId: undefined,
            createTopic: createTopicMock,
            switchTopic: switchTopicMock,
          });

          await result.current.sendMessage({ message });
        });

        expect(createTopicMock).not.toHaveBeenCalled();
        expect(switchTopicMock).not.toHaveBeenCalled();
      });
    });

    it('should handle RAG query when internal_shouldUseRAG returns true', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test RAG query';

      vi.spyOn(result.current, 'internal_shouldUseRAG').mockReturnValue(true);

      await act(async () => {
        await result.current.sendMessage({ message });
      });

      expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
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
      expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.not.objectContaining({
          ragQuery: expect.anything(),
        }),
      );
    });

    it('should add user message and not call internal_coreProcessMessage if onlyAddUserMessage = true', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', onlyAddUserMessage: true });
      });

      expect(messageService.createMessage).toHaveBeenCalled();
      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
    });

    it('当 isWelcomeQuestion 为 true 时,正确地传递给 internal_coreProcessMessage', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', isWelcomeQuestion: true });
      });

      expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { isWelcomeQuestion: true },
      );
    });

    it('当只有文件而没有消息内容时,正确发送消息', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: '', files: [{ id: 'file-1' }] as any });
      });

      expect(messageService.createMessage).toHaveBeenCalledWith({
        content: '',
        files: ['file-1'],
        role: 'user',
        sessionId: 'session-id',
        topicId: 'topic-id',
      });
    });

    it('当同时有文件和消息内容时,正确发送消息并关联文件', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage({ message: 'test', files: [{ id: 'file-1' }] as any });
      });

      expect(messageService.createMessage).toHaveBeenCalledWith({
        content: 'test',
        files: ['file-1'],
        role: 'user',
        sessionId: 'session-id',
        topicId: 'topic-id',
      });
    });

    it('当 createMessage 抛出错误时,正确处理错误而不影响整个应用', async () => {
      const { result } = renderHook(() => useChatStore());
      vi.spyOn(messageService, 'createMessage').mockRejectedValue(
        new Error('create message error'),
      );

      await expect(result.current.sendMessage({ message: 'test' })).rejects.toThrow(
        'create message error',
      );

      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
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

      expect(resendMessageSpy).toHaveBeenCalledWith(messageId, 'abc');
    });
  });

  describe('delAndRegenerateMessage', () => {
    it('should remove a message and create a new message', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const deleteMessageSpy = vi.spyOn(result.current, 'deleteMessage');
      const resendMessageSpy = vi.spyOn(result.current, 'internal_resendMessage');

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          activeTopicId: undefined,
          messagesMap: {
            [messageMapKey('session-id')]: [
              { id: messageId, tools: [{ id: 'tool1' }, { id: 'tool2' }] } as ChatMessage,
            ],
          },
        });
      });
      await act(async () => {
        await result.current.delAndRegenerateMessage(messageId);
      });

      expect(deleteMessageSpy).toHaveBeenCalledWith(messageId);
      expect(resendMessageSpy).toHaveBeenCalled();
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('stopGenerateMessage', () => {
    it('should stop generating message and set loading states correctly', async () => {
      const { result } = renderHook(() => useChatStore());
      const internal_toggleChatLoadingSpy = vi.spyOn(result.current, 'internal_toggleChatLoading');
      const abortController = new AbortController();

      act(() => {
        useChatStore.setState({ abortController });
      });

      await act(async () => {
        result.current.stopGenerateMessage();
      });

      expect(abortController.signal.aborted).toBe(true);
      expect(internal_toggleChatLoadingSpy).toHaveBeenCalledWith(
        false,
        undefined,
        expect.any(String),
      );
    });

    it('should not do anything if there is no abortController', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        // 确保没有设置 abortController
        useChatStore.setState({ abortController: undefined });

        result.current.stopGenerateMessage();
      });

      // 由于没有 abortController，不应调用任何方法
      expect(result.current.abortController).toBeUndefined();
    });

    it('should return early if abortController is undefined', () => {
      act(() => {
        useChatStore.setState({ abortController: undefined });
      });

      const { result } = renderHook(() => useChatStore());

      const spy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        result.current.stopGenerateMessage();
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call abortController.abort()', () => {
      const abortMock = vi.fn();
      const abortController = { abort: abortMock } as unknown as AbortController;
      act(() => {
        useChatStore.setState({ abortController });
      });
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.stopGenerateMessage();
      });

      expect(abortMock).toHaveBeenCalled();
    });

    it('should call internal_toggleChatLoading with correct parameters', () => {
      const abortController = new AbortController();
      act(() => {
        useChatStore.setState({ abortController });
      });
      const { result } = renderHook(() => useChatStore());
      const spy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        result.current.stopGenerateMessage();
      });

      expect(spy).toHaveBeenCalledWith(false, undefined, expect.any(String));
    });
  });

  describe('internal_coreProcessMessage', () => {
    it('should handle the core AI message processing', async () => {
      useChatStore.setState({ internal_coreProcessMessage: realCoreProcessMessage });

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
      // 模拟消息创建
      (messageService.createMessage as Mock).mockResolvedValue('assistant-message-id');

      await act(async () => {
        await result.current.internal_coreProcessMessage(messages, userMessage.id);
      });

      // 验证是否创建了代表 AI 响应的消息
      expect(messageService.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'assistant',
          content: LOADING_FLAT,
          fromModel: expect.anything(),
          parentId: userMessage.id,
          sessionId: mockState.activeId,
          topicId: mockState.activeTopicId,
        }),
      );

      // 验证 AI 服务是否被调用
      expect(spy).toHaveBeenCalled();

      // 验证消息列表是否刷新
      expect(mockState.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('internal_resendMessage', () => {
    it('should resend a message by id and refresh messages', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          activeTopicId: undefined,
          // Mock the currentChats selector to return a list that includes the message to be resent
          messagesMap: {
            [messageMapKey('session-id')]: [
              { id: messageId, role: 'user', content: 'Resend this message' } as ChatMessage,
            ],
          },
        });
      });

      // Mock the internal_coreProcessMessage function to resolve immediately
      mockState.internal_coreProcessMessage.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.internal_resendMessage(messageId);
      });

      expect(messageService.removeMessage).not.toHaveBeenCalledWith(messageId);
      expect(mockState.internal_coreProcessMessage).toHaveBeenCalledWith(
        expect.any(Array),
        messageId,
        {},
      );
    });

    it('should not perform any action if the message id does not exist', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'non-existing-message-id';

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          activeTopicId: undefined,
          // Mock the currentChats selector to return a list that does not include the message to be resent
          messagesMap: {
            [messageMapKey('session-id')]: [],
          },
        });
      });

      await act(async () => {
        await result.current.internal_resendMessage(messageId);
      });

      expect(messageService.removeMessage).not.toHaveBeenCalledWith(messageId);
      expect(mockState.internal_coreProcessMessage).not.toHaveBeenCalled();
      expect(mockState.refreshMessages).not.toHaveBeenCalled();
    });
  });

  describe('internal_fetchAIChatMessage', () => {
    it('should fetch AI chat message and return content', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [{ id: 'message-id', content: 'Hello', role: 'user' }] as ChatMessage[];
      const assistantMessageId = 'assistant-message-id';
      const aiResponse = 'Hello, human!';

      (fetch as Mock).mockResolvedValueOnce(new Response(aiResponse));

      await act(async () => {
        const response = await result.current.internal_fetchAIChatMessage(
          messages,
          assistantMessageId,
        );
        expect(response.isFunctionCall).toEqual(false);
      });
    });

    it('should handle errors during AI response fetching', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [{ id: 'message-id', content: 'Hello', role: 'user' }] as ChatMessage[];
      const assistantMessageId = 'assistant-message-id';

      // Mock fetch to reject with an error
      const errorMessage = 'Error fetching AI response';
      vi.mocked(fetch).mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        expect(
          await result.current.internal_fetchAIChatMessage(messages, assistantMessageId),
        ).toEqual({
          isFunctionCall: false,
        });
      });
    });

    it('should generate correct contextMessages for "user" role', async () => {
      const messageId = 'message-id';
      const messages = [
        { id: 'msg-1', role: 'system' },
        { id: messageId, role: 'user', meta: { avatar: '😀' } },
        { id: 'msg-3', role: 'assistant' },
      ];
      act(() => {
        useChatStore.setState({
          messagesMap: {
            [chatSelectors.currentChatKey(mockState as any)]: messages as ChatMessage[],
          },
        });
      });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.internal_resendMessage(messageId);
      });

      expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
        messages.slice(0, 2),
        messageId,
        { traceId: undefined },
      );
    });

    it('should generate correct contextMessages for "assistant" role', async () => {
      const messageId = 'message-id';
      const messages = [
        { id: 'msg-1', role: 'system' },
        { id: 'msg-2', role: 'user', meta: { avatar: '😀' } },
        { id: messageId, role: 'assistant', parentId: 'msg-2' },
      ];
      useChatStore.setState({
        messagesMap: {
          [chatSelectors.currentChatKey(mockState as any)]: messages as ChatMessage[],
        },
      });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.internal_resendMessage(messageId);
      });

      expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
        messages.slice(0, 2),
        'msg-2',
        { traceId: undefined },
      );
    });

    it('should return early if contextMessages is empty', async () => {
      const messageId = 'message-id';
      useChatStore.setState({
        messagesMap: { [chatSelectors.currentChatKey(mockState as any)]: [] },
      });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.internal_resendMessage(messageId);
      });

      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
    });
  });

  describe('internal_toggleChatLoading', () => {
    it('should set loading state and create an AbortController when loading is true', () => {
      const { result } = renderHook(() => useChatStore());
      const action = 'loading-action';

      act(() => {
        result.current.internal_toggleChatLoading(true, 'message-id', action);
      });

      const state = useChatStore.getState();
      expect(state.abortController).toBeInstanceOf(AbortController);
      expect(state.chatLoadingIds).toEqual(['message-id']);
    });

    it('should clear loading state and abort controller when loading is false', () => {
      const { result } = renderHook(() => useChatStore());
      const action = 'stop-loading-action';

      // Set initial loading state
      act(() => {
        result.current.internal_toggleChatLoading(true, 'message-id', 'start-loading-action');
      });

      // Stop loading
      act(() => {
        result.current.internal_toggleChatLoading(false, undefined, action);
      });

      const state = useChatStore.getState();
      expect(state.abortController).toBeUndefined();
      expect(state.chatLoadingIds).toEqual([]);
    });

    it('should attach beforeunload event listener when loading starts', () => {
      const { result } = renderHook(() => useChatStore());
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      act(() => {
        result.current.internal_toggleChatLoading(true, 'message-id', 'loading-action');
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should remove beforeunload event listener when loading stops', () => {
      const { result } = renderHook(() => useChatStore());
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      // Start and then stop loading to trigger the removal of the event listener
      act(() => {
        result.current.internal_toggleChatLoading(true, 'message-id', 'start-loading-action');
        result.current.internal_toggleChatLoading(false, undefined, 'stop-loading-action');
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should not create a new AbortController if one already exists', () => {
      const { result } = renderHook(() => useChatStore());
      const abortController = new AbortController();

      act(() => {
        useChatStore.setState({ abortController });
        result.current.internal_toggleChatLoading(true, 'message-id', 'loading-action');
      });

      const state = useChatStore.getState();
      expect(state.abortController).toEqual(abortController);
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
