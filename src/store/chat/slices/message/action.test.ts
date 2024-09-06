import * as lobeUIModules from '@lobehub/ui';
import { act, renderHook, waitFor } from '@testing-library/react';
import useSWR, { mutate } from 'swr';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { DEFAULT_AGENT_CHAT_CONFIG, DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { TraceEventType } from '@/const/trace';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { chatSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/slices/message/utils';
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
const realRefreshMessages = useChatStore.getState().refreshMessages;
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
  describe('addAIMessage', () => {
    it('should return early if activeId is undefined', async () => {
      useChatStore.setState({ activeId: undefined });
      const { result } = renderHook(() => useChatStore());
      const updateInputMessageSpy = vi.spyOn(result.current, 'updateInputMessage');

      await act(async () => {
        await result.current.addAIMessage();
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
      expect(updateInputMessageSpy).not.toHaveBeenCalled();
    });

    it('should call internal_createMessage with correct parameters', async () => {
      const inputMessage = 'Test input message';
      useChatStore.setState({ inputMessage });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.addAIMessage();
      });

      expect(messageService.createMessage).toHaveBeenCalledWith({
        content: inputMessage,
        role: 'assistant',
        sessionId: mockState.activeId,
        topicId: mockState.activeTopicId,
      });
    });

    it('should call updateInputMessage with empty string', async () => {
      const { result } = renderHook(() => useChatStore());
      const updateInputMessageSpy = vi.spyOn(result.current, 'updateInputMessage');
      await act(async () => {
        await result.current.addAIMessage();
      });

      expect(updateInputMessageSpy).toHaveBeenCalledWith('');
    });
  });

  describe('deleteMessage', () => {
    it('deleteMessage should remove a message by id', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const deleteSpy = vi.spyOn(result.current, 'deleteMessage');

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          activeTopicId: undefined,
          messagesMap: {
            [messageMapKey('session-id')]: [{ id: messageId } as ChatMessage],
          },
        });
      });
      await act(async () => {
        await result.current.deleteMessage(messageId);
      });

      expect(deleteSpy).toHaveBeenCalledWith(messageId);
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });

    it('deleteMessage should remove messages with tools', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const removeMessagesSpy = vi.spyOn(messageService, 'removeMessages');

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          activeTopicId: undefined,
          messagesMap: {
            [messageMapKey('session-id')]: [
              { id: messageId, tools: [{ id: 'tool1' }, { id: 'tool2' }] } as ChatMessage,
              { id: '2', tool_call_id: 'tool1', role: 'tool' } as ChatMessage,
              { id: '3', tool_call_id: 'tool2', role: 'tool' } as ChatMessage,
            ],
          },
        });
      });
      await act(async () => {
        await result.current.deleteMessage(messageId);
      });

      expect(removeMessagesSpy).toHaveBeenCalledWith([messageId, '2', '3']);
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('deleteToolMessage', () => {
    it('deleteMessage should remove a message by id', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const updateMessageSpy = vi.spyOn(messageService, 'updateMessage');
      const removeMessageSpy = vi.spyOn(messageService, 'removeMessage');

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          activeTopicId: undefined,
          messagesMap: {
            [messageMapKey('session-id')]: [
              {
                id: messageId,
                role: 'assistant',
                tools: [{ id: 'tool1' }, { id: 'tool2' }],
              } as ChatMessage,
              { id: '2', parentId: messageId, tool_call_id: 'tool1', role: 'tool' } as ChatMessage,
              { id: '3', tool_call_id: 'tool2', role: 'tool' } as ChatMessage,
            ],
          },
        });
      });
      await act(async () => {
        await result.current.deleteToolMessage('2');
      });

      expect(removeMessageSpy).toHaveBeenCalled();
      expect(updateMessageSpy).toHaveBeenCalledWith('message-id', {
        tools: [{ id: 'tool2' }],
      });
      expect(result.current.refreshMessages).toHaveBeenCalled();
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

  describe('copyMessage', () => {
    it('should call copyToClipboard with correct content', async () => {
      const messageId = 'message-id';
      const content = 'Test content';
      const { result } = renderHook(() => useChatStore());
      const copyToClipboardSpy = vi.spyOn(lobeUIModules, 'copyToClipboard');

      await act(async () => {
        await result.current.copyMessage(messageId, content);
      });

      expect(copyToClipboardSpy).toHaveBeenCalledWith(content);
    });

    it('should call internal_traceMessage with correct parameters', async () => {
      const messageId = 'message-id';
      const content = 'Test content';
      const { result } = renderHook(() => useChatStore());
      const internal_traceMessageSpy = vi.spyOn(result.current, 'internal_traceMessage');

      await act(async () => {
        await result.current.copyMessage(messageId, content);
      });

      expect(internal_traceMessageSpy).toHaveBeenCalledWith(messageId, {
        eventType: TraceEventType.CopyMessage,
      });
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
      expect(useChatStore.getState().activeTopicId).toBeNull();
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

  describe('toggleMessageEditing action', () => {
    it('should add message id to messageEditingIds when editing is true', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';

      act(() => {
        result.current.toggleMessageEditing(messageId, true);
      });

      expect(result.current.messageEditingIds).toContain(messageId);
    });

    it('should remove message id from messageEditingIds when editing is false', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'abc';

      act(() => {
        result.current.toggleMessageEditing(messageId, true);
        result.current.toggleMessageEditing(messageId, false);
      });

      expect(result.current.messageEditingIds).not.toContain(messageId);
    });
  });

  describe('internal_resendMessage action', () => {
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

  describe('internal_updateMessageContent action', () => {
    it('should call messageService.internal_updateMessageContent with correct parameters', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.internal_updateMessageContent(messageId, newContent);
      });

      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, { content: newContent });
    });

    it('should dispatch message update action', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const newContent = 'Updated content';
      const internal_dispatchMessageSpy = vi.spyOn(result.current, 'internal_dispatchMessage');

      await act(async () => {
        await result.current.internal_updateMessageContent(messageId, newContent);
      });

      expect(internal_dispatchMessageSpy).toHaveBeenCalledWith({
        id: messageId,
        type: 'updateMessage',
        value: { content: newContent },
      });
    });

    it('should refresh messages after updating content', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.internal_updateMessageContent(messageId, newContent);
      });

      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('internal_coreProcessMessage action', () => {
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

  describe('stopGenerateMessage action', () => {
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
  });

  describe('toggleMessageEditing', () => {
    it('should update messageEditingIds correctly when enabling editing', () => {
      const messageId = 'message-id';
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.toggleMessageEditing(messageId, true);
      });

      expect(result.current.messageEditingIds).toContain(messageId);
    });

    it('should update messageEditingIds correctly when disabling editing', () => {
      const messageId = 'message-id';
      useChatStore.setState({ messageEditingIds: [messageId] });
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.toggleMessageEditing(messageId, false);
      });

      expect(result.current.messageEditingIds).not.toContain(messageId);
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
      expect(mutate).toHaveBeenCalledWith(['SWR_USE_FETCH_MESSAGES', activeId, activeTopicId]);
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

  describe('internal_toggleMessageLoading action', () => {
    it('should add message id to messageLoadingIds when loading is true', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-id';

      act(() => {
        result.current.internal_toggleMessageLoading(true, messageId);
      });

      expect(result.current.messageLoadingIds).toContain(messageId);
    });

    it('should remove message id from messageLoadingIds when loading is false', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'ddd-id';

      act(() => {
        result.current.internal_toggleMessageLoading(true, messageId);
        result.current.internal_toggleMessageLoading(false, messageId);
      });

      expect(result.current.messageLoadingIds).not.toContain(messageId);
    });
  });

  describe('internal_toggleToolCallingStreaming action', () => {
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

  describe('stopGenerateMessage', () => {
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

  describe('updateInputMessage', () => {
    it('should not update state if message is the same as current inputMessage', () => {
      const inputMessage = 'Test input message';
      useChatStore.setState({ inputMessage });
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.updateInputMessage(inputMessage);
      });

      expect(result.current.inputMessage).toBe(inputMessage);
    });
  });

  describe('modifyMessageContent', () => {
    it('should call internal_traceMessage with correct parameters before updating', async () => {
      const messageId = 'message-id';
      const content = 'Updated content';
      const { result } = renderHook(() => useChatStore());

      const spy = vi.spyOn(result.current, 'internal_traceMessage');
      await act(async () => {
        await result.current.modifyMessageContent(messageId, content);
      });

      expect(spy).toHaveBeenCalledWith(messageId, {
        eventType: TraceEventType.ModifyMessage,
        nextContent: content,
      });
    });

    it('should call internal_updateMessageContent with correct parameters', async () => {
      const messageId = 'message-id';
      const content = 'Updated content';
      const { result } = renderHook(() => useChatStore());

      const spy = vi.spyOn(result.current, 'internal_traceMessage');

      await act(async () => {
        await result.current.modifyMessageContent(messageId, content);
      });

      expect(spy).toHaveBeenCalledWith(messageId, {
        eventType: 'Modify Message',
        nextContent: 'Updated content',
      });
    });
  });
});
