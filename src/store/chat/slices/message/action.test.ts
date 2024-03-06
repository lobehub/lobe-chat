import { act, renderHook, waitFor } from '@testing-library/react';
import useSWR, { mutate } from 'swr';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { chatSelectors } from '@/store/chat/selectors';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';

import { useChatStore } from '../../store';

vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve(new Response('mock'))),
);

// Mock service
vi.mock('@/services/message', () => ({
  messageService: {
    getMessages: vi.fn(),
    updateMessageError: vi.fn(),
    removeMessage: vi.fn(),
    removeMessages: vi.fn(() => Promise.resolve()),
    create: vi.fn(() => Promise.resolve('new-message-id')),
    updateMessage: vi.fn(),
    clearAllMessage: vi.fn(() => Promise.resolve()),
  },
}));
vi.mock('@/services/topic', () => ({
  topicService: {
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

vi.mock('@/store/chat/selectors', () => ({
  chatSelectors: {
    currentChats: vi.fn(),
  },
}));

const realCoreProcessMessage = useChatStore.getState().coreProcessMessage;
const realRefreshMessages = useChatStore.getState().refreshMessages;
// Mock state
const mockState = {
  activeId: 'session-id',
  activeTopicId: 'topic-id',
  messages: [],
  refreshMessages: vi.fn(),
  refreshTopic: vi.fn(),
  coreProcessMessage: vi.fn(),
  saveToTopic: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  useChatStore.setState(mockState, false);
  vi.spyOn(agentSelectors, 'currentAgentConfig').mockImplementation(() => DEFAULT_AGENT_CONFIG);
  vi.spyOn(agentSelectors, 'currentAgentMeta').mockImplementation(() => ({ tags: [] }));
});

afterEach(() => {
  process.env.NEXT_PUBLIC_BASE_PATH = undefined;

  vi.restoreAllMocks();
});

describe('chatMessage actions', () => {
  describe('deleteMessage', () => {
    it('deleteMessage should remove a message by id', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const deleteSpy = vi.spyOn(result.current, 'deleteMessage');

      await act(async () => {
        await result.current.deleteMessage(messageId);
      });

      expect(deleteSpy).toHaveBeenCalledWith(messageId);
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('clearAllMessages', () => {
    it('clearAllMessages should remove all messages', async () => {
      const { result } = renderHook(() => useChatStore());
      const clearAllSpy = vi.spyOn(result.current, 'clearAllMessages');

      await act(async () => {
        await result.current.clearAllMessages();
      });

      expect(clearAllSpy).toHaveBeenCalled();
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('updateInputMessage', () => {
    it('updateInputMessage should update the input message state', () => {
      const { result } = renderHook(() => useChatStore());
      const newInputMessage = 'Updated message';
      act(() => {
        result.current.updateInputMessage(newInputMessage);
      });

      expect(result.current.inputMessage).toEqual(newInputMessage);
    });
  });

  describe('clearMessage', () => {
    beforeEach(() => {
      vi.clearAllMocks(); // 清除 mocks
      useChatStore.setState(mockState, false); // 重置 state
    });

    afterEach(() => {
      vi.restoreAllMocks(); // 恢复所有模拟
    });
    it('clearMessage should remove messages from the active session and topic', async () => {
      const { result } = renderHook(() => useChatStore());
      const clearSpy = vi.spyOn(result.current, 'clearMessage');
      const switchTopicSpy = vi.spyOn(result.current, 'switchTopic');

      await act(async () => {
        await result.current.clearMessage();
      });

      expect(clearSpy).toHaveBeenCalled();
      expect(result.current.refreshMessages).toHaveBeenCalled();
      expect(result.current.refreshTopic).toHaveBeenCalled();
      expect(switchTopicSpy).toHaveBeenCalled();
    });

    it('should remove messages from the active session and topic, then refresh topics and messages', async () => {
      const { result } = renderHook(() => useChatStore());
      const switchTopicSpy = vi.spyOn(result.current, 'switchTopic');
      const refreshTopicSpy = vi.spyOn(result.current, 'refreshTopic');

      await act(async () => {
        await result.current.clearMessage();
      });

      expect(mockState.refreshMessages).toHaveBeenCalled();
      expect(refreshTopicSpy).toHaveBeenCalled();
      expect(switchTopicSpy).toHaveBeenCalled();

      // 检查 activeTopicId 是否被清除，需要在状态更新后进行检查
      expect(useChatStore.getState().activeTopicId).toBeUndefined();
    });

    it('should call removeTopic if there is an activeTopicId', async () => {
      const { result } = renderHook(() => useChatStore());
      const switchTopicSpy = vi.spyOn(result.current, 'switchTopic');
      const refreshTopicSpy = vi.spyOn(result.current, 'refreshTopic');

      await act(async () => {
        await result.current.clearMessage();
      });

      expect(mockState.activeTopicId).not.toBeUndefined(); // 确保在测试前 activeTopicId 存在
      expect(refreshTopicSpy).toHaveBeenCalled();
      expect(mockState.refreshMessages).toHaveBeenCalled();
      expect(topicService.removeTopic).toHaveBeenCalledWith(mockState.activeTopicId);
      expect(switchTopicSpy).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should not send message if there is no active session', async () => {
      useChatStore.setState({ activeId: undefined });
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message';

      await act(async () => {
        await result.current.sendMessage({ message });
      });

      expect(messageService.create).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(result.current.coreProcessMessage).not.toHaveBeenCalled();
    });

    it('should not send message if message is empty and there are no files', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = '';

      await act(async () => {
        await result.current.sendMessage({ message });
      });

      expect(messageService.create).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(result.current.coreProcessMessage).not.toHaveBeenCalled();
    });

    it('should not send message if message is empty and there are empty files', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = '';

      await act(async () => {
        await result.current.sendMessage({ message, files: [] });
      });

      expect(messageService.create).not.toHaveBeenCalled();
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(result.current.coreProcessMessage).not.toHaveBeenCalled();
    });

    it('should create message and call coreProcessMessage if message or files are provided', async () => {
      const { result } = renderHook(() => useChatStore());
      const message = 'Test message';
      const files = [{ id: 'file-id', url: 'file-url' }];

      // Mock messageService.create to resolve with a message id
      (messageService.create as Mock).mockResolvedValue('new-message-id');

      await act(async () => {
        await result.current.sendMessage({ message, files });
      });

      expect(messageService.create).toHaveBeenCalledWith({
        content: message,
        files: files.map((f) => f.id),
        role: 'user',
        sessionId: mockState.activeId,
        topicId: mockState.activeTopicId,
      });
      expect(result.current.refreshMessages).toHaveBeenCalled();
      expect(result.current.coreProcessMessage).toHaveBeenCalled();
    });

    describe('auto-create topic', () => {
      it('should not auto-create topic if enableAutoCreateTopic is false', async () => {
        const { result } = renderHook(() => useChatStore());
        const message = 'Test message';
        const autoCreateTopicThreshold = 5;
        const enableAutoCreateTopic = false;

        // Mock messageService.create to resolve with a message id
        (messageService.create as Mock).mockResolvedValue('new-message-id');

        // Mock agent config to simulate auto-create topic behavior
        (agentSelectors.currentAgentConfig as Mock).mockImplementation(() => ({
          autoCreateTopicThreshold,
          enableAutoCreateTopic,
        }));

        // Mock the currentChats selector to return a list that does not reach the threshold
        (chatSelectors.currentChats as Mock).mockReturnValue(
          Array.from({ length: autoCreateTopicThreshold + 1 }, (_, i) => ({ id: `msg-${i}` })),
        );

        // Mock saveToTopic and switchTopic to simulate not being called
        const saveToTopicMock = vi.fn();
        const switchTopicMock = vi.fn();

        await act(async () => {
          useChatStore.setState({
            ...mockState,
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
        (messageService.create as Mock).mockResolvedValue('new-message-id');

        // Mock the currentChats selector to return a list that reaches the threshold
        (chatSelectors.currentChats as Mock).mockReturnValue(
          Array.from({ length: autoCreateTopicThreshold }, (_, i) => ({ id: `msg-${i}` })),
        );

        // Mock saveToTopic to resolve with a topic id and switchTopic to switch to the new topic
        const saveToTopicMock = vi.fn(() => Promise.resolve('new-topic-id'));
        const switchTopicMock = vi.fn();

        act(() => {
          useChatStore.setState({
            ...mockState,
            activeTopicId: undefined,
            saveToTopic: saveToTopicMock,
            switchTopic: switchTopicMock,
          });
        });

        await act(async () => {
          await result.current.sendMessage({ message });
        });

        expect(saveToTopicMock).toHaveBeenCalled();
        expect(switchTopicMock).toHaveBeenCalledWith('new-topic-id');
      });

      it('should not auto-create topic if autoCreateTopicThreshold is not reached', async () => {
        const { result } = renderHook(() => useChatStore());
        const message = 'Test message';
        const autoCreateTopicThreshold = 5;
        const enableAutoCreateTopic = true;

        // Mock messageService.create to resolve with a message id
        (messageService.create as Mock).mockResolvedValue('new-message-id');

        // Mock agent config to simulate auto-create topic behavior
        (agentSelectors.currentAgentConfig as Mock).mockImplementation(() => ({
          autoCreateTopicThreshold,
          enableAutoCreateTopic,
        }));

        // Mock the currentChats selector to return a list that does not reach the threshold
        (chatSelectors.currentChats as Mock).mockReturnValue(
          Array.from({ length: autoCreateTopicThreshold - 1 }, (_, i) => ({ id: `msg-${i}` })),
        );

        // Mock saveToTopic and switchTopic to simulate not being called
        const saveToTopicMock = vi.fn();
        const switchTopicMock = vi.fn();

        await act(async () => {
          useChatStore.setState({
            ...mockState,
            activeTopicId: undefined,
            saveToTopic: saveToTopicMock,
            switchTopic: switchTopicMock,
          });

          await result.current.sendMessage({ message });
        });

        expect(saveToTopicMock).not.toHaveBeenCalled();
        expect(switchTopicMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('internalResendMessage action', () => {
    it('should resend a message by id and refresh messages', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';

      // Mock the currentChats selector to return a list that includes the message to be resent
      (chatSelectors.currentChats as Mock).mockReturnValue([
        // ... other messages
        { id: messageId, role: 'user', content: 'Resend this message' },
        // ... other messages
      ]);

      // Mock the coreProcessMessage function to resolve immediately
      mockState.coreProcessMessage.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.internalResendMessage(messageId);
      });

      expect(messageService.removeMessage).not.toHaveBeenCalledWith(messageId);
      expect(mockState.coreProcessMessage).toHaveBeenCalledWith(
        expect.any(Array),
        messageId,
        undefined,
      );
    });

    it('should not perform any action if the message id does not exist', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'non-existing-message-id';

      // Mock the currentChats selector to return a list that does not include the message to be resent
      (chatSelectors.currentChats as Mock).mockReturnValue([
        // ... other messages
      ]);

      await act(async () => {
        await result.current.internalResendMessage(messageId);
      });

      expect(messageService.removeMessage).not.toHaveBeenCalledWith(messageId);
      expect(mockState.coreProcessMessage).not.toHaveBeenCalled();
      expect(mockState.refreshMessages).not.toHaveBeenCalled();
    });
  });

  describe('internalUpdateMessageContent action', () => {
    it('should call messageService.internalUpdateMessageContent with correct parameters', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.internalUpdateMessageContent(messageId, newContent);
      });

      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, { content: newContent });
    });

    it('should dispatch message update action', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const newContent = 'Updated content';
      const dispatchMessageSpy = vi.spyOn(result.current, 'dispatchMessage');

      await act(async () => {
        await result.current.internalUpdateMessageContent(messageId, newContent);
      });

      expect(dispatchMessageSpy).toHaveBeenCalledWith({
        id: messageId,
        key: 'content',
        type: 'updateMessage',
        value: newContent,
      });
    });

    it('should refresh messages after updating content', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.internalUpdateMessageContent(messageId, newContent);
      });

      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('coreProcessMessage action', () => {
    it('should handle the core AI message processing', async () => {
      useChatStore.setState({ coreProcessMessage: realCoreProcessMessage });

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
      (messageService.create as Mock).mockResolvedValue('assistant-message-id');

      await act(async () => {
        await result.current.coreProcessMessage(messages, userMessage.id);
      });

      // 验证是否创建了代表 AI 响应的消息
      expect(messageService.create).toHaveBeenCalledWith(
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

  describe('stopGenerateMessage action', () => {
    it('should stop generating message and set loading states correctly', async () => {
      const { result } = renderHook(() => useChatStore());
      const toggleChatLoadingSpy = vi.spyOn(result.current, 'toggleChatLoading');
      const abortController = new AbortController();

      act(() => {
        useChatStore.setState({ abortController });
      });

      await act(async () => {
        result.current.stopGenerateMessage();
      });

      expect(abortController.signal.aborted).toBe(true);
      expect(toggleChatLoadingSpy).toHaveBeenCalledWith(false, undefined, expect.any(String));
    });

    it('should not do anything if there is no abortController', async () => {
      const { result } = renderHook(() => useChatStore());

      // 确保没有设置 abortController
      useChatStore.setState({ abortController: undefined });

      await act(async () => {
        result.current.stopGenerateMessage();
      });

      // 由于没有 abortController，不应调用任何方法
      expect(result.current.abortController).toBeUndefined();
    });
  });

  describe('refreshMessages action', () => {
    beforeEach(() => {
      vi.mock('swr', async () => {
        const actual = await vi.importActual('swr');
        return {
          ...(actual as any),
          mutate: vi.fn(),
        };
      });
    });
    afterEach(() => {
      // 在每个测试用例开始前恢复到实际的 SWR 实现
      vi.resetAllMocks();
    });
    it('should refresh messages by calling mutate with current activeId and activeTopicId', async () => {
      useChatStore.setState({ refreshMessages: realRefreshMessages });

      const { result } = renderHook(() => useChatStore());
      const activeId = useChatStore.getState().activeId;
      const activeTopicId = useChatStore.getState().activeTopicId;

      // 在这里，我们不需要再次模拟 mutate，因为它已经在顶部被模拟了
      await act(async () => {
        await result.current.refreshMessages();
      });

      // 确保 mutate 调用了正确的参数
      expect(mutate).toHaveBeenCalledWith([activeId, activeTopicId]);
    });
    it('should handle errors during refreshing messages', async () => {
      useChatStore.setState({ refreshMessages: realRefreshMessages });
      const { result } = renderHook(() => useChatStore());

      // 设置模拟错误
      (mutate as Mock).mockImplementation(() => {
        throw new Error('Mutate error');
      });

      await act(async () => {
        await expect(result.current.refreshMessages()).rejects.toThrow('Mutate error');
      });

      // 确保恢复 mutate 的模拟，以免影响其他测试
      (mutate as Mock).mockReset();
    });
  });

  describe('useFetchMessages hook', () => {
    // beforeEach(() => {
    //   vi.mocked(useSWR).mockRestore();
    // });

    it('should fetch messages for given session and topic ids', async () => {
      const sessionId = 'session-id';
      const topicId = 'topic-id';
      const messages = [{ id: 'message-id', content: 'Hello' }];

      // 设置模拟返回值
      (messageService.getMessages as Mock).mockResolvedValue(messages);

      const { result } = renderHook(() => useChatStore().useFetchMessages(sessionId, topicId));

      // 等待异步操作完成
      await waitFor(() => {
        expect(result.current.data).toEqual(messages);
      });
    });
  });

  describe('fetchAIChatMessage', () => {
    it('should fetch AI chat message and return content', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [{ id: 'message-id', content: 'Hello', role: 'user' }] as ChatMessage[];
      const assistantMessageId = 'assistant-message-id';
      const aiResponse = 'Hello, human!';

      (fetch as Mock).mockResolvedValueOnce(new Response(aiResponse));

      await act(async () => {
        const response = await result.current.fetchAIChatMessage(messages, assistantMessageId);
        expect(response.content).toEqual(aiResponse);
        expect(response.isFunctionCall).toEqual(false);
        expect(response.functionCallAtEnd).toEqual(false);
        expect(response.functionCallContent).toEqual('');
      });
    });

    it('should handle function call message at start of AI response', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [{ id: 'message-id', content: 'Hello', role: 'user' }] as ChatMessage[];
      const assistantMessageId = 'assistant-message-id';
      const aiResponse =
        '{"tool_calls":[{"id":"call_sbca","type":"function","function":{"name":"pluginName____apiName","arguments":{"key":"value"}}}]}';

      // Mock fetch to resolve with AI response containing function call
      vi.mocked(fetch).mockResolvedValueOnce(new Response(aiResponse));

      await act(async () => {
        const response = await result.current.fetchAIChatMessage(messages, assistantMessageId);
        expect(response.content).toEqual(aiResponse);
        expect(response.isFunctionCall).toEqual(true);
        expect(response.functionCallAtEnd).toEqual(false);
        expect(response.functionCallContent).toEqual('');
      });
    });

    it('should handle function message at end of AI response', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [{ id: 'message-id', content: 'Hello', role: 'user' }] as ChatMessage[];
      const assistantMessageId = 'assistant-message-id';
      const aiResponse =
        'Hello, human! {"tool_calls":[{"id":"call_sbca","type":"function","function":{"name":"pluginName____apiName","arguments":{"key":"value"}}}]}';

      // Mock fetch to resolve with AI response containing function call at end
      vi.mocked(fetch).mockResolvedValue(new Response(aiResponse));

      await act(async () => {
        const response = await result.current.fetchAIChatMessage(messages, assistantMessageId);
        expect(response.content).toEqual(aiResponse);
        expect(response.isFunctionCall).toEqual(true);
        expect(response.functionCallAtEnd).toEqual(true);
        expect(response.functionCallContent).toEqual(
          '{"tool_calls":[{"id":"call_sbca","type":"function","function":{"name":"pluginName____apiName","arguments":{"key":"value"}}}]}',
        );
      });
    });

    it('should handle errors during AI response fetching', async () => {
      const { result } = renderHook(() => useChatStore());
      const messages = [{ id: 'message-id', content: 'Hello', role: 'user' }] as ChatMessage[];
      const assistantMessageId = 'assistant-message-id';

      // Mock fetch to reject with an error
      const errorMessage = 'Error fetching AI response';
      vi.mocked(fetch).mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await expect(
          result.current.fetchAIChatMessage(messages, assistantMessageId),
        ).rejects.toThrow(errorMessage);
      });
    });
  });

  describe('toggleChatLoading', () => {
    it('should set loading state and create an AbortController when loading is true', () => {
      const { result } = renderHook(() => useChatStore());
      const action = 'loading-action';

      act(() => {
        result.current.toggleChatLoading(true, 'message-id', action);
      });

      const state = useChatStore.getState();
      expect(state.abortController).toBeInstanceOf(AbortController);
      expect(state.chatLoadingId).toEqual('message-id');
    });

    it('should clear loading state and abort controller when loading is false', () => {
      const { result } = renderHook(() => useChatStore());
      const action = 'stop-loading-action';

      // Set initial loading state
      act(() => {
        result.current.toggleChatLoading(true, 'message-id', 'start-loading-action');
      });

      // Stop loading
      act(() => {
        result.current.toggleChatLoading(false, undefined, action);
      });

      const state = useChatStore.getState();
      expect(state.abortController).toBeUndefined();
      expect(state.chatLoadingId).toBeUndefined();
    });

    it('should attach beforeunload event listener when loading starts', () => {
      const { result } = renderHook(() => useChatStore());
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      act(() => {
        result.current.toggleChatLoading(true, 'message-id', 'loading-action');
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should remove beforeunload event listener when loading stops', () => {
      const { result } = renderHook(() => useChatStore());
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      // Start and then stop loading to trigger the removal of the event listener
      act(() => {
        result.current.toggleChatLoading(true, 'message-id', 'start-loading-action');
        result.current.toggleChatLoading(false, undefined, 'stop-loading-action');
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should not create a new AbortController if one already exists', () => {
      const { result } = renderHook(() => useChatStore());
      const abortController = new AbortController();

      act(() => {
        useChatStore.setState({ abortController });
        result.current.toggleChatLoading(true, 'message-id', 'loading-action');
      });

      const state = useChatStore.getState();
      expect(state.abortController).toEqual(abortController);
    });
  });
});
