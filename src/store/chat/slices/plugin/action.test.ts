import { act, renderHook } from '@testing-library/react';
import { Md5 } from 'ts-md5';
import { Mock, afterEach, describe, expect, it, vi } from 'vitest';

import { LOADING_FLAT } from '@/const/message';
import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/slices/message/utils';
import { useChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { ChatMessage, ChatToolPayload } from '@/types/message';
import { LobeTool } from '@/types/tool';

const invokeStandaloneTypePlugin = useChatStore.getState().invokeStandaloneTypePlugin;

vi.mock('zustand/traditional');

// Mock messageService
vi.mock('@/services/message', () => ({
  messageService: {
    updateMessage: vi.fn(),
    updateMessageError: vi.fn(),
    updateMessagePluginState: vi.fn(),
    createMessage: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('ChatPluginAction', () => {
  describe('fillPluginMessageContent', () => {
    it('should update message content and trigger the ai message', async () => {
      // 设置模拟函数的返回值
      const mockCurrentChats: any[] = [];
      vi.spyOn(chatSelectors, 'currentChats').mockReturnValue(mockCurrentChats);

      // 设置初始状态
      const initialState = {
        messages: [],
        internal_coreProcessMessage: vi.fn(),
        refreshMessages: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.fillPluginMessageContent(messageId, newContent, true);
      });

      // 验证 messageService.internal_updateMessageContent 是否被正确调用
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, { content: newContent });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();

      // 验证 coreProcessMessage 是否被正确调用
      expect(result.current.internal_coreProcessMessage).toHaveBeenCalledWith(
        mockCurrentChats,
        messageId,
        {},
      );
    });
    it('should update message content and not trigger ai message', async () => {
      // 设置模拟函数的返回值
      const mockCurrentChats: any[] = [];
      vi.spyOn(chatSelectors, 'currentChats').mockReturnValue(mockCurrentChats);

      // 设置初始状态
      const initialState = {
        messages: [],
        coreProcessMessage: vi.fn(),
        internal_coreProcessMessage: vi.fn(),
        refreshMessages: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.fillPluginMessageContent(messageId, newContent);
      });

      // 验证 messageService.internal_updateMessageContent 是否被正确调用
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, { content: newContent });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();

      // 验证 coreProcessMessage 没有被正确调用
      expect(result.current.internal_coreProcessMessage).not.toHaveBeenCalled();
    });
  });

  describe('invokeDefaultTypePlugin', () => {
    it('should run the default plugin type and update message content', async () => {
      const pluginPayload = { apiName: 'testApi', arguments: { key: 'value' } };
      const messageId = 'message-id';
      const pluginApiResponse = 'Plugin API response';

      const storeState = useChatStore.getState();

      vi.spyOn(storeState, 'refreshMessages');
      vi.spyOn(storeState, 'triggerAIMessage').mockResolvedValue(undefined);
      vi.spyOn(storeState, 'internal_togglePluginApiCalling').mockReturnValue(undefined);

      const runSpy = vi.spyOn(chatService, 'runPluginApi').mockResolvedValue({
        text: pluginApiResponse,
        traceId: '',
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeDefaultTypePlugin(messageId, pluginPayload);
      });

      expect(storeState.internal_togglePluginApiCalling).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(runSpy).toHaveBeenCalledWith(pluginPayload, { signal: undefined, trace: {} });
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, {
        content: pluginApiResponse,
      });
      expect(storeState.refreshMessages).toHaveBeenCalled();
      expect(storeState.internal_togglePluginApiCalling).toHaveBeenCalledWith(
        false,
        'message-id',
        'plugin/fetchPlugin/end',
      );
    });

    it('should handle errors when the plugin API call fails', async () => {
      const pluginPayload = { apiName: 'testApi', arguments: { key: 'value' } };
      const messageId = 'message-id';
      const error = new Error('API call failed');

      const storeState = useChatStore.getState();
      vi.spyOn(storeState, 'refreshMessages');
      vi.spyOn(storeState, 'triggerAIMessage').mockResolvedValue(undefined);
      vi.spyOn(storeState, 'internal_togglePluginApiCalling').mockReturnValue(undefined);

      vi.spyOn(chatService, 'runPluginApi').mockRejectedValue(error);

      const { result } = renderHook(() => useChatStore());
      await act(async () => {
        await result.current.invokeDefaultTypePlugin(messageId, pluginPayload);
      });

      expect(storeState.internal_togglePluginApiCalling).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(chatService.runPluginApi).toHaveBeenCalledWith(pluginPayload, { trace: {} });
      expect(messageService.updateMessageError).toHaveBeenCalledWith(messageId, error);
      expect(storeState.refreshMessages).toHaveBeenCalled();
      expect(storeState.internal_togglePluginApiCalling).toHaveBeenCalledWith(
        false,
        'message-id',
        'plugin/fetchPlugin/end',
      );
      expect(storeState.triggerAIMessage).not.toHaveBeenCalled(); // 确保在错误情况下不调用此方法
    });
  });

  describe('triggerToolCalls', () => {
    it('should trigger tool calls for the assistant message', async () => {
      const assistantId = 'assistant-id';
      const message = {
        id: assistantId,
        role: 'assistant',
        content: 'Assistant message',
        tools: [
          {
            id: 'tool1',
            type: 'standalone',
            identifier: 'plugin1',
            apiName: 'api1',
            arguments: '{}',
          },
          {
            id: 'tool2',
            type: 'markdown',
            identifier: 'plugin2',
            apiName: 'api2',
            arguments: '{}',
          },
          {
            id: 'tool3',
            type: 'builtin',
            identifier: 'builtin1',
            apiName: 'api3',
            arguments: '{}',
          },
          {
            id: 'tool4',
            type: 'default',
            identifier: 'plugin3',
            apiName: 'api4',
            arguments: '{}',
          },
        ],
      } as ChatMessage;

      const invokeStandaloneTypePluginMock = vi.fn();
      const invokeMarkdownTypePluginMock = vi.fn();
      const invokeBuiltinToolMock = vi.fn();
      const invokeDefaultTypePluginMock = vi.fn().mockResolvedValue('Default tool response');
      const triggerAIMessageMock = vi.fn();
      const internal_createMessageMock = vi.fn().mockResolvedValue('tool-message-id');
      const getTraceIdByMessageIdMock = vi.fn().mockReturnValue('trace-id');

      act(() => {
        useChatStore.setState({
          messagesMap: {
            [messageMapKey('session-id', 'topic-id')]: [message],
          },
          invokeStandaloneTypePlugin: invokeStandaloneTypePluginMock,
          invokeMarkdownTypePlugin: invokeMarkdownTypePluginMock,
          invokeBuiltinTool: invokeBuiltinToolMock,
          invokeDefaultTypePlugin: invokeDefaultTypePluginMock,
          triggerAIMessage: triggerAIMessageMock,
          internal_createMessage: internal_createMessageMock,
          activeId: 'session-id',
          activeTopicId: 'topic-id',
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.triggerToolCalls(assistantId);
      });

      // Verify that tool messages were created for each tool call
      expect(internal_createMessageMock).toHaveBeenCalledTimes(4);
      expect(internal_createMessageMock).toHaveBeenCalledWith({
        content: LOADING_FLAT,
        parentId: assistantId,
        plugin: message.tools![0],
        role: 'tool',
        sessionId: 'session-id',
        tool_call_id: 'tool1',
        topicId: 'topic-id',
      });
      // ... similar assertions for other tool calls

      // Verify that the appropriate plugin types were invoked
      expect(invokeStandaloneTypePluginMock).toHaveBeenCalledWith(
        'tool-message-id',
        message.tools![0],
      );
      expect(invokeMarkdownTypePluginMock).toHaveBeenCalledWith(
        'tool-message-id',
        message.tools![1],
      );
      expect(invokeBuiltinToolMock).toHaveBeenCalledWith('tool-message-id', message.tools![2]);
      expect(invokeDefaultTypePluginMock).toHaveBeenCalledWith(
        'tool-message-id',
        message.tools![3],
      );

      // Verify that AI message was triggered for default type tool call
      // expect(getTraceIdByMessageIdMock).toHaveBeenCalledWith('tool-message-id');
      // expect(triggerAIMessageMock).toHaveBeenCalledWith({ traceId: 'trace-id' });
    });

    it('should not trigger AI message if no default type tool calls', async () => {
      const assistantId = 'assistant-id';
      const message = {
        id: assistantId,
        role: 'assistant',
        content: 'Assistant message',
        tools: [
          {
            id: 'tool1',
            type: 'standalone',
            identifier: 'plugin1',
            apiName: 'api1',
            arguments: '{}',
          },
          {
            id: 'tool2',
            type: 'markdown',
            identifier: 'plugin2',
            apiName: 'api2',
            arguments: '{}',
          },
          {
            id: 'tool3',
            type: 'builtin',
            identifier: 'builtin1',
            apiName: 'api3',
            arguments: '{}',
          },
        ],
      } as ChatMessage;

      const invokeStandaloneTypePluginMock = vi.fn();
      const invokeMarkdownTypePluginMock = vi.fn();
      const invokeBuiltinToolMock = vi.fn();
      const triggerAIMessageMock = vi.fn();
      const internal_createMessageMock = vi.fn().mockResolvedValue('tool-message-id');

      act(() => {
        useChatStore.setState({
          invokeStandaloneTypePlugin: invokeStandaloneTypePluginMock,
          invokeMarkdownTypePlugin: invokeMarkdownTypePluginMock,
          invokeBuiltinTool: invokeBuiltinToolMock,
          triggerAIMessage: triggerAIMessageMock,
          internal_createMessage: internal_createMessageMock,
          activeId: 'session-id',
          messagesMap: {
            [messageMapKey('session-id', 'topic-id')]: [message],
          },
          activeTopicId: 'topic-id',
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.triggerToolCalls(assistantId);
      });

      // Verify that tool messages were created for each tool call
      expect(internal_createMessageMock).toHaveBeenCalledTimes(3);

      // Verify that the appropriate plugin types were invoked
      expect(invokeStandaloneTypePluginMock).toHaveBeenCalledWith(
        'tool-message-id',
        message.tools![0],
      );
      expect(invokeMarkdownTypePluginMock).toHaveBeenCalledWith(
        'tool-message-id',
        message.tools![1],
      );
      expect(invokeBuiltinToolMock).toHaveBeenCalledWith('tool-message-id', message.tools![2]);

      // Verify that AI message was not triggered
      expect(triggerAIMessageMock).not.toHaveBeenCalled();
    });
  });

  describe('updatePluginState', () => {
    it('should update the plugin state for a message', async () => {
      const messageId = 'message-id';
      const pluginStateValue = { key: 'value' };

      const initialState = {
        refreshMessages: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.updatePluginState(messageId, pluginStateValue);
      });

      expect(messageService.updateMessagePluginState).toHaveBeenCalledWith(
        messageId,
        pluginStateValue,
      );
      expect(initialState.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('createAssistantMessageByPlugin', () => {
    it('should create an assistant message and refresh messages', async () => {
      // 模拟 messageService.create 方法的实现
      (messageService.createMessage as Mock).mockResolvedValue({});

      // 设置初始状态并模拟 refreshMessages 方法
      const initialState = {
        refreshMessages: vi.fn(),
        activeId: 'session-id',
        activeTopicId: 'topic-id',
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const content = 'Test content';
      const parentId = 'parent-message-id';

      await act(async () => {
        await result.current.createAssistantMessageByPlugin(content, parentId);
      });

      // 验证 messageService.create 是否被带有正确参数调用
      expect(messageService.createMessage).toHaveBeenCalledWith({
        content,
        parentId,
        role: 'assistant',
        sessionId: initialState.activeId,
        topicId: initialState.activeTopicId,
      });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });

    it('should handle errors when message creation fails', async () => {
      // 模拟 messageService.create 方法，使其抛出错误
      const errorMessage = 'Failed to create message';
      (messageService.createMessage as Mock).mockRejectedValue(new Error(errorMessage));

      // 设置初始状态并模拟 refreshMessages 方法
      const initialState = {
        refreshMessages: vi.fn(),
        activeId: 'session-id',
        activeTopicId: 'topic-id',
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const content = 'Test content';
      const parentId = 'parent-message-id';

      await act(async () => {
        await expect(
          result.current.createAssistantMessageByPlugin(content, parentId),
        ).rejects.toThrow(errorMessage);
      });

      // 验证 messageService.create 是否被带有正确参数调用
      expect(messageService.createMessage).toHaveBeenCalledWith({
        content,
        parentId,
        role: 'assistant',
        sessionId: initialState.activeId,
        topicId: initialState.activeTopicId,
      });

      // 验证 refreshMessages 是否没有被调用
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
    });
  });

  describe('invokeBuiltinTool', () => {
    it('should invoke a builtin tool and update message content ,then run text2image', async () => {
      const payload = {
        apiName: 'text2image',
        arguments: JSON.stringify({ key: 'value' }),
      } as ChatToolPayload;

      const messageId = 'message-id';
      const toolResponse = JSON.stringify({ abc: 'data' });

      useToolStore.setState({
        transformApiArgumentsToAiState: vi.fn().mockResolvedValue(toolResponse),
      });

      useChatStore.setState({
        internal_togglePluginApiCalling: vi.fn(),
        internal_updateMessageContent: vi.fn(),
        text2image: vi.fn(),
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Verify that the builtin tool was invoked with the correct arguments
      expect(useToolStore.getState().transformApiArgumentsToAiState).toHaveBeenCalledWith(
        payload.apiName,
        JSON.parse(payload.arguments),
      );

      // Verify that the message content was updated with the tool response
      expect(result.current.internal_updateMessageContent).toHaveBeenCalledWith(
        messageId,
        toolResponse,
      );

      // Verify that loading was toggled correctly
      expect(result.current.internal_togglePluginApiCalling).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(result.current.internal_togglePluginApiCalling).toHaveBeenCalledWith(false);
      expect(useChatStore.getState().text2image).toHaveBeenCalled();
    });

    it('should invoke a builtin tool and update message content', async () => {
      const payload = {
        apiName: 'text2image',
        arguments: JSON.stringify({ key: 'value' }),
      } as ChatToolPayload;

      const messageId = 'message-id';
      const toolResponse = 'Builtin tool response';

      act(() => {
        useToolStore.setState({
          transformApiArgumentsToAiState: vi.fn().mockResolvedValue(toolResponse),
          text2image: vi.fn(),
        });

        useChatStore.setState({
          internal_togglePluginApiCalling: vi.fn(),
          text2image: vi.fn(),
          internal_updateMessageContent: vi.fn(),
        });
      });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Verify that the builtin tool was invoked with the correct arguments
      expect(useToolStore.getState().transformApiArgumentsToAiState).toHaveBeenCalledWith(
        payload.apiName,
        JSON.parse(payload.arguments),
      );

      // Verify that the message content was updated with the tool response
      expect(result.current.internal_updateMessageContent).toHaveBeenCalledWith(
        messageId,
        toolResponse,
      );

      // Verify that loading was toggled correctly
      expect(result.current.internal_togglePluginApiCalling).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(result.current.internal_togglePluginApiCalling).toHaveBeenCalledWith(false);
      expect(useChatStore.getState().text2image).not.toHaveBeenCalled();
    });

    it('should handle errors when invoking a builtin tool fails', async () => {
      const payload = {
        apiName: 'builtinApi',
        arguments: JSON.stringify({ key: 'value' }),
      } as ChatToolPayload;

      const messageId = 'message-id';
      const error = new Error('Builtin tool failed');

      useToolStore.setState({
        transformApiArgumentsToAiState: vi.fn().mockRejectedValue(error),
      });

      useChatStore.setState({
        internal_togglePluginApiCalling: vi.fn(),
        internal_updateMessageContent: vi.fn(),
        text2image: vi.fn(),
        refreshMessages: vi.fn(),
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Verify that loading was toggled correctly
      expect(result.current.internal_togglePluginApiCalling).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(result.current.internal_togglePluginApiCalling).toHaveBeenCalledWith(false);

      // Verify that the message content was not updated
      expect(result.current.internal_updateMessageContent).not.toHaveBeenCalled();

      // Verify that messages were not refreshed
      expect(result.current.refreshMessages).not.toHaveBeenCalled();
      expect(useChatStore.getState().text2image).not.toHaveBeenCalled();
    });
  });

  describe('invokeMarkdownTypePlugin', () => {
    it('should invoke a markdown type plugin', async () => {
      const payload = {
        apiName: 'markdownApi',
        identifier: 'abc',
        type: 'markdown',
        arguments: JSON.stringify({ key: 'value' }),
      } as ChatToolPayload;
      const messageId = 'message-id';

      const runPluginApiMock = vi.fn();

      act(() => {
        useChatStore.setState({ internal_callPluginApi: runPluginApiMock });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeMarkdownTypePlugin(messageId, payload);
      });

      // Verify that the markdown type plugin was invoked
      expect(runPluginApiMock).toHaveBeenCalledWith(messageId, payload);
    });
  });

  describe('invokeStandaloneTypePlugin', () => {
    it('should update message with error and refresh messages if plugin settings are invalid', async () => {
      const messageId = 'message-id';

      const payload = {
        identifier: 'pluginName',
      } as ChatToolPayload;

      act(() => {
        useToolStore.setState({
          validatePluginSettings: vi
            .fn()
            .mockResolvedValue({ valid: false, errors: ['Invalid setting'] }),
        });

        useChatStore.setState({ refreshMessages: vi.fn(), invokeStandaloneTypePlugin });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeStandaloneTypePlugin(messageId, payload);
      });

      const call = vi.mocked(messageService.updateMessageError).mock.calls[0];

      expect(call[1]).toEqual({
        body: {
          error: ['Invalid setting'],
          message: '[plugin] your settings is invalid with plugin manifest setting schema',
        },
        message: undefined,
        type: 'PluginSettingsInvalid',
      });

      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });
});
