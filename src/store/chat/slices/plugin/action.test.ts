import {
  DEFAULT_INBOX_AVATAR,
  PLUGIN_SCHEMA_API_MD5_PREFIX,
  PLUGIN_SCHEMA_SEPARATOR,
} from '@lobechat/const';
import { ToolNameResolver } from '@lobechat/context-engine';
import { ChatToolPayload, MessageToolCall, UIChatMessage } from '@lobechat/types';
import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, describe, expect, it, vi } from 'vitest';

import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { useChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useToolStore } from '@/store/tool';

const invokeStandaloneTypePlugin = useChatStore.getState().invokeStandaloneTypePlugin;

vi.mock('zustand/traditional');

// Mock messageService
vi.mock('@/services/message', () => ({
  messageService: {
    updateMessage: vi.fn(),
    updateMessageError: vi.fn(),
    updateMessagePluginState: vi.fn(),
    updateMessagePluginArguments: vi.fn(),
    createMessage: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('ChatPluginAction', () => {
  describe('summaryPluginContent', () => {
    it('should summarize plugin content', async () => {
      const messageId = 'message-id';
      const toolMessage = {
        id: messageId,
        role: 'tool',
        content: 'Tool content to summarize',
      } as UIChatMessage;

      const internal_execAgentRuntimeMock = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          messagesMap: { [messageMapKey('session-id')]: [toolMessage] },
          internal_execAgentRuntime: internal_execAgentRuntimeMock,
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.summaryPluginContent(messageId);
      });

      expect(internal_execAgentRuntimeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            {
              role: 'assistant',
              content: '作为一名总结专家，请结合以上系统提示词，将以下内容进行总结：',
            },
            {
              ...toolMessage,
              meta: {
                avatar: DEFAULT_INBOX_AVATAR,
                backgroundColor: 'rgba(0,0,0,0)',
                description: undefined,
                title: undefined,
              },
              content: toolMessage.content,
              role: 'assistant',
              name: undefined,
              tool_call_id: undefined,
            },
          ],
          parentMessageId: messageId,
          parentMessageType: 'assistant',
        }),
      );
    });

    it('should not summarize non-tool messages', async () => {
      const messageId = 'message-id';
      const nonToolMessage = {
        id: messageId,
        role: 'user',
        content: 'User message',
      } as UIChatMessage;

      const internal_execAgentRuntimeMock = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          messagesMap: { [messageMapKey('session-id')]: [nonToolMessage] },
          internal_execAgentRuntime: internal_execAgentRuntimeMock,
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.summaryPluginContent(messageId);
      });

      expect(internal_execAgentRuntimeMock).not.toHaveBeenCalled();
    });
  });

  describe('fillPluginMessageContent', () => {
    it('should update message content and trigger the ai message', async () => {
      // 设置模拟函数的返回值
      const mockCurrentChats: any[] = [];
      vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue(mockCurrentChats);

      // 设置初始状态
      const initialState = {
        messages: [],
        internal_execAgentRuntime: vi.fn(),
        refreshMessages: vi.fn(),
        optimisticUpdateMessageContent: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.fillPluginMessageContent(messageId, newContent, true);
      });

      // 验证 optimisticUpdateMessageContent 是否被正确调用
      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        newContent,
      );

      // 验证 coreProcessMessage 是否被正确调用
      expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: mockCurrentChats,
          parentMessageId: messageId,
          parentMessageType: 'user',
        }),
      );
    });
    it('should update message content and not trigger ai message', async () => {
      // 设置模拟函数的返回值
      const mockCurrentChats: any[] = [];
      vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue(mockCurrentChats);

      // 设置初始状态
      const initialState = {
        messages: [],
        coreProcessMessage: vi.fn(),
        internal_execAgentRuntime: vi.fn(),
        refreshMessages: vi.fn(),
        optimisticUpdateMessageContent: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.fillPluginMessageContent(messageId, newContent);
      });

      // 验证 optimisticUpdateMessageContent 是否被正确调用
      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        newContent,
      );

      // 验证 coreProcessMessage 没有被正确调用
      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
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
      vi.spyOn(storeState, 'optimisticUpdateMessageContent').mockResolvedValue();

      const runSpy = vi.spyOn(chatService, 'runPluginApi').mockResolvedValue({
        text: pluginApiResponse,
        traceId: '',
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeDefaultTypePlugin(messageId, pluginPayload);
      });

      expect(runSpy).toHaveBeenCalledWith(pluginPayload, { signal: undefined, trace: {} });
      expect(storeState.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        pluginApiResponse,
        undefined,
        undefined,
      );
    });

    it('should handle errors when the plugin API call fails', async () => {
      const pluginPayload = { apiName: 'testApi', arguments: { key: 'value' } };
      const messageId = 'message-id';
      const error = new Error('API call failed');
      const mockMessages = [{ id: 'msg-1', content: 'test' }] as any;

      // Mock the service to return messages
      (messageService.updateMessageError as Mock).mockResolvedValue({
        success: true,
        messages: mockMessages,
      });

      const storeState = useChatStore.getState();
      const replaceMessagesSpy = vi.spyOn(storeState, 'replaceMessages');
      vi.spyOn(storeState, 'triggerAIMessage').mockResolvedValue(undefined);

      vi.spyOn(chatService, 'runPluginApi').mockRejectedValue(error);

      const { result } = renderHook(() => useChatStore());
      await act(async () => {
        await result.current.invokeDefaultTypePlugin(messageId, pluginPayload);
      });

      expect(chatService.runPluginApi).toHaveBeenCalledWith(pluginPayload, { trace: {} });
      expect(messageService.updateMessageError).toHaveBeenCalledWith(messageId, error, {
        sessionId: undefined,
        topicId: undefined,
      });
      expect(replaceMessagesSpy).toHaveBeenCalledWith(mockMessages, {
        sessionId: undefined,
        topicId: undefined,
      });
      expect(storeState.triggerAIMessage).not.toHaveBeenCalled(); // 确保在错误情况下不调用此方法
    });
  });

  describe('updatePluginState', () => {
    it('should update the plugin state for a message', async () => {
      const messageId = 'message-id';
      const pluginStateValue = { key: 'value' };
      const mockMessages = [{ id: 'msg-1', content: 'test' }] as any;

      // Mock the service to return messages
      (messageService.updateMessagePluginState as Mock).mockResolvedValue({
        success: true,
        messages: mockMessages,
      });

      const replaceMessagesSpy = vi.fn();
      const initialState = {
        replaceMessages: replaceMessagesSpy,
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.optimisticUpdatePluginState(messageId, pluginStateValue);
      });

      expect(messageService.updateMessagePluginState).toHaveBeenCalledWith(
        messageId,
        pluginStateValue,
        {
          sessionId: 'inbox',
          topicId: null,
        },
      );

      expect(replaceMessagesSpy).toHaveBeenCalledWith(mockMessages, {
        sessionId: 'inbox',
        topicId: null,
      });
    });
  });

  describe('createAssistantMessageByPlugin', () => {
    it('should create an assistant message and replace messages', async () => {
      const mockMessages = [{ id: 'msg-1', content: 'test' }] as any;
      // 模拟 messageService.createMessage 方法的实现
      (messageService.createMessage as Mock).mockResolvedValue({
        id: 'new-message-id',
        messages: mockMessages,
      });

      // 设置初始状态并模拟 replaceMessages 方法
      const initialState = {
        replaceMessages: vi.fn(),
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

      // 验证 messageService.createMessage 是否被带有正确参数调用
      expect(messageService.createMessage).toHaveBeenCalledWith({
        content,
        parentId,
        role: 'assistant',
        sessionId: initialState.activeId,
        topicId: initialState.activeTopicId,
      });

      // 验证 replaceMessages 是否被调用
      expect(result.current.replaceMessages).toHaveBeenCalledWith(mockMessages, {
        sessionId: 'session-id',
        topicId: 'topic-id',
      });
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
    it('should invoke the builtin tool action with parsed arguments', async () => {
      const payload = {
        apiName: 'mockBuiltinAction',
        arguments: JSON.stringify({ input: 'test', value: 123 }),
      } as ChatToolPayload;

      const messageId = 'message-id';
      const mockActionFn = vi.fn().mockResolvedValue(undefined);

      useChatStore.setState({
        mockBuiltinAction: mockActionFn,
      } as any);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Verify that the builtin action was called with correct arguments
      expect(mockActionFn).toHaveBeenCalledWith(messageId, { input: 'test', value: 123 });
    });

    it('should not invoke action if apiName does not exist in store', async () => {
      const payload = {
        apiName: 'nonExistentAction',
        arguments: JSON.stringify({ key: 'value' }),
      } as ChatToolPayload;

      const messageId = 'message-id';

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Should not throw error, just return early
    });

    it('should not invoke action if arguments cannot be parsed', async () => {
      const payload = {
        apiName: 'mockBuiltinAction',
        arguments: 'invalid json',
      } as ChatToolPayload;

      const messageId = 'message-id';
      const mockActionFn = vi.fn().mockResolvedValue(undefined);

      useChatStore.setState({
        mockBuiltinAction: mockActionFn,
      } as any);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Should not call the action if arguments can't be parsed
      expect(mockActionFn).not.toHaveBeenCalled();
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
      const mockMessages = [{ id: 'msg-1', content: 'test' }] as any;

      const payload = {
        identifier: 'pluginName',
      } as ChatToolPayload;

      // Mock the service to return messages
      (messageService.updateMessageError as Mock).mockResolvedValue({
        success: true,
        messages: mockMessages,
      });

      const replaceMessagesSpy = vi.fn();

      act(() => {
        useToolStore.setState({
          validatePluginSettings: vi
            .fn()
            .mockResolvedValue({ valid: false, errors: ['Invalid setting'] }),
        });

        useChatStore.setState({ replaceMessages: replaceMessagesSpy, invokeStandaloneTypePlugin });
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

      expect(replaceMessagesSpy).toHaveBeenCalledWith(mockMessages, {
        sessionId: undefined,
        topicId: undefined,
      });
    });
  });

  describe('reInvokeToolMessage', () => {
    it('should re-invoke a tool message', async () => {
      const messageId = 'message-id';
      const message = {
        id: messageId,
        role: 'tool',
        content: 'Original content',
        plugin: {
          type: 'default',
          identifier: 'plugin-id',
          apiName: 'api-name',
          arguments: '{}',
        },
        tool_call_id: 'tool-id',
      } as UIChatMessage;

      const internal_invokeDifferentTypePluginMock = vi.fn();
      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          messagesMap: { [messageMapKey('session-id')]: [message] },
          internal_invokeDifferentTypePlugin: internal_invokeDifferentTypePluginMock,
          optimisticUpdateMessagePluginError: vi.fn(),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.reInvokeToolMessage(messageId);
      });

      expect(internal_invokeDifferentTypePluginMock).toHaveBeenCalledWith(
        messageId,
        expect.objectContaining(message.plugin),
      );
    });

    it('should clear error content when re-invoking', async () => {
      const messageId = 'message-id';
      const message = {
        id: messageId,
        role: 'tool',
        content: 'Original content',
        plugin: {
          type: 'default',
          identifier: 'plugin-id',
          apiName: 'api-name',
          arguments: '{}',
        },
        tool_call_id: 'tool-id',
        pluginError: { message: 'Previous error', type: 'ProviderBizError' },
      } as UIChatMessage;

      const internal_updateMessageErrorMock = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: 'session-id',
          messagesMap: { [messageMapKey('session-id')]: [message] },
          internal_invokeDifferentTypePlugin: vi.fn(),
          optimisticUpdateMessagePluginError: internal_updateMessageErrorMock,
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.reInvokeToolMessage(messageId);
      });

      expect(internal_updateMessageErrorMock).toHaveBeenCalledWith(messageId, null, undefined);
    });
  });

  describe('updatePluginArguments', () => {
    it('should update plugin arguments and refresh messages', async () => {
      const messageId = 'message-id';
      const toolCallId = 'tool-call-id';
      const parentId = 'parent-id';
      const identifier = 'plugin';
      const newArguments = { newKey: 'newValue' };

      const toolMessage = {
        id: messageId,
        role: 'tool',
        content: 'Tool content',
        plugin: { identifier: identifier, arguments: '{"oldKey":"oldValue"}' },
        tool_call_id: toolCallId,
        parentId,
      } as UIChatMessage;

      const assistantMessage = {
        id: parentId,
        role: 'assistant',
        content: 'Assistant content',
        tools: [{ identifier: identifier, arguments: '{"oldKey":"oldValue"}', id: toolCallId }],
      } as UIChatMessage;

      act(() => {
        useChatStore.setState({
          activeId: 'anbccfdd',
          messagesMap: { [messageMapKey('anbccfdd')]: [assistantMessage, toolMessage] },
          refreshMessages: vi.fn(),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.optimisticUpdatePluginArguments(messageId, newArguments);
      });

      expect(messageService.updateMessagePluginArguments).toHaveBeenCalledWith(
        messageId,
        expect.objectContaining(newArguments),
      );
      // TODO: 需要验证 updateMessage 是否被调用
      // expect(messageService.updateMessage).toHaveBeenCalledWith(
      //   parentId,
      //   expect.objectContaining({ tools: expect.any(Array) }),
      // );
      expect(result.current.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('internal_callPluginApi', () => {
    it('should call plugin API and update message content', async () => {
      const messageId = 'message-id';
      const payload: ChatToolPayload = {
        id: 'tool-id',
        type: 'default',
        identifier: 'plugin-id',
        apiName: 'api-name',
        arguments: '{}',
      };
      const apiResponse = 'API response';

      vi.spyOn(chatService, 'runPluginApi').mockResolvedValue({
        text: apiResponse,
        traceId: 'trace-id',
      });

      act(() => {
        useChatStore.setState({
          optimisticUpdateMessageContent: vi.fn(),
          refreshMessages: vi.fn(),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.internal_callPluginApi(messageId, payload);
      });

      expect(chatService.runPluginApi).toHaveBeenCalledWith(payload, expect.any(Object));
      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        apiResponse,
        undefined,
        undefined,
      );
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, { traceId: 'trace-id' });
    });

    it('should handle API call errors', async () => {
      const messageId = 'message-id';
      const payload: ChatToolPayload = {
        id: 'tool-id',
        type: 'default',
        identifier: 'plugin-id',
        apiName: 'api-name',
        arguments: '{}',
      };
      const error = new Error('API call failed');
      const mockMessages = [{ id: 'msg-1', content: 'test' }] as any;

      // Mock the service to return messages
      (messageService.updateMessageError as Mock).mockResolvedValue({
        success: true,
        messages: mockMessages,
      });

      vi.spyOn(chatService, 'runPluginApi').mockRejectedValue(error);

      const replaceMessagesSpy = vi.fn();

      act(() => {
        useChatStore.setState({
          replaceMessages: replaceMessagesSpy,
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.internal_callPluginApi(messageId, payload);
      });

      expect(messageService.updateMessageError).toHaveBeenCalledWith(messageId, error, {
        sessionId: undefined,
        topicId: undefined,
      });
      expect(replaceMessagesSpy).toHaveBeenCalledWith(mockMessages, {
        sessionId: undefined,
        topicId: undefined,
      });
    });
  });

  describe('internal_transformToolCalls', () => {
    it('should transform tool calls correctly', () => {
      const toolCalls: MessageToolCall[] = [
        {
          id: 'tool1',
          function: {
            name: ['plugin1', 'api1', 'default'].join(PLUGIN_SCHEMA_SEPARATOR),
            arguments: '{}',
          },
          type: 'function',
        },
        {
          id: 'tool2',
          function: {
            name: ['plugin2', 'api2', 'markdown'].join(PLUGIN_SCHEMA_SEPARATOR),
            arguments: '{}',
          },
          type: 'function',
        },
      ];

      const { result } = renderHook(() => useChatStore());

      const transformed = result.current.internal_transformToolCalls(toolCalls);

      expect(transformed).toEqual([
        {
          id: 'tool1',
          identifier: 'plugin1',
          apiName: 'api1',
          type: 'default',
          arguments: '{}',
        },
        {
          id: 'tool2',
          identifier: 'plugin2',
          apiName: 'api2',
          type: 'markdown',
          arguments: '{}',
        },
      ]);
    });

    it('should handle MD5 hashed API names', () => {
      const apiName = 'testApi';
      const resolver = new ToolNameResolver();
      // Generate a very long name to force MD5 hashing
      const longApiName =
        'very-long-action-name-that-will-cause-the-total-length-to-exceed-64-characters';
      const toolName = resolver.generate('plugin1', longApiName, 'default');

      // Extract the MD5 part from the generated name
      const parts = toolName.split(PLUGIN_SCHEMA_SEPARATOR);
      const md5Hash = parts[1].replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '');

      const toolCalls: MessageToolCall[] = [
        {
          id: 'tool1',
          function: {
            name: ['plugin1', PLUGIN_SCHEMA_API_MD5_PREFIX + md5Hash, 'default'].join(
              PLUGIN_SCHEMA_SEPARATOR,
            ),
            arguments: '{}',
          },
          type: 'function',
        },
      ];

      act(() => {
        useToolStore.setState({
          installedPlugins: [
            {
              type: 'plugin',
              identifier: 'plugin1',
              manifest: {
                identifier: 'plugin1',
                api: [
                  {
                    name: longApiName,
                    parameters: { type: 'object', properties: {} },
                    description: 'abc',
                  },
                ],
                type: 'default',
              } as any,
            },
          ],
        });
      });

      const { result } = renderHook(() => useChatStore());

      const transformed = result.current.internal_transformToolCalls(toolCalls);

      expect(transformed[0].apiName).toBe(longApiName);
    });
  });

  describe('internal_updatePluginError', () => {
    it('should update plugin error and refresh messages', async () => {
      const messageId = 'message-id';
      const error = { message: 'Plugin error' } as any;
      const mockMessages = [{ id: 'msg-1', content: 'test' }] as any;

      // Mock the service to return messages
      (messageService.updateMessage as Mock).mockResolvedValue({
        success: true,
        messages: mockMessages,
      });

      const replaceMessagesSpy = vi.fn();

      act(() => {
        useChatStore.setState({
          replaceMessages: replaceMessagesSpy,
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.optimisticUpdatePluginError(messageId, error);
      });

      expect(messageService.updateMessage).toHaveBeenCalledWith(
        messageId,
        { error },
        { sessionId: 'inbox', topicId: null },
      );
      expect(replaceMessagesSpy).toHaveBeenCalledWith(mockMessages, {
        sessionId: 'inbox',
        topicId: null,
      });
    });
  });

  describe('internal_addToolToAssistantMessage', () => {
    it('should add too to assistant messages', async () => {
      const { result } = renderHook(() => useChatStore());

      const messageId = 'message-id';
      const toolCallId = 'tool-call-id';
      const identifier = 'plugin';

      const refreshToUpdateMessageToolsSpy = vi.spyOn(
        result.current,
        'internal_refreshToUpdateMessageTools',
      );

      const assistantMessage = {
        id: messageId,
        role: 'assistant',
        content: 'Assistant content',
        tools: [{ identifier: identifier, arguments: '{"oldKey":"oldValue"}', id: toolCallId }],
      } as UIChatMessage;

      act(() => {
        useChatStore.setState({
          activeId: 'anbccfdd',
          messagesMap: { [messageMapKey('anbccfdd')]: [assistantMessage] },
          refreshMessages: vi.fn(),
        });
      });

      await act(async () => {
        await result.current.optimisticAddToolToAssistantMessage(messageId, {
          identifier,
          arguments: '{"oldKey":"oldValue"}',
          id: 'newId',
          apiName: 'test',
          type: 'default',
        });
      });

      expect(refreshToUpdateMessageToolsSpy).toHaveBeenCalledWith(messageId, undefined);
    });
  });

  describe('Plugin OptimisticUpdateContext isolation', () => {
    describe('optimisticUpdatePluginState', () => {
      it('should use context sessionId/topicId when provided', async () => {
        const { result } = renderHook(() => useChatStore());
        const messageId = 'message-id';
        const pluginState = { key: 'value' };
        const contextSessionId = 'context-session';
        const contextTopicId = 'context-topic';

        (messageService.updateMessagePluginState as Mock).mockResolvedValue({
          success: true,
          messages: [],
        });

        const replaceMessagesSpy = vi.spyOn(result.current, 'replaceMessages');

        let operationId: string;
        await act(async () => {
          // Create operation with desired context
          const op = result.current.startOperation({
            type: 'sendMessage',
            context: { sessionId: contextSessionId, topicId: contextTopicId },
          });
          operationId = op.operationId;

          await result.current.optimisticUpdatePluginState(messageId, pluginState, {
            operationId,
          });
        });

        expect(messageService.updateMessagePluginState).toHaveBeenCalledWith(
          messageId,
          pluginState,
          { sessionId: contextSessionId, topicId: contextTopicId },
        );
        expect(replaceMessagesSpy).toHaveBeenCalledWith([], {
          sessionId: contextSessionId,
          topicId: contextTopicId,
        });
      });

      it('should fallback to activeId/activeTopicId when context not provided', async () => {
        const { result } = renderHook(() => useChatStore());
        const messageId = 'message-id';
        const pluginState = { key: 'value' };

        act(() => {
          useChatStore.setState({
            activeId: 'active-session',
            activeTopicId: 'active-topic',
          });
        });

        (messageService.updateMessagePluginState as Mock).mockResolvedValue({
          success: true,
          messages: [],
        });

        await act(async () => {
          await result.current.optimisticUpdatePluginState(messageId, pluginState);
        });

        expect(messageService.updateMessagePluginState).toHaveBeenCalledWith(
          messageId,
          pluginState,
          { sessionId: 'active-session', topicId: 'active-topic' },
        );
      });
    });

    describe('optimisticUpdatePluginError', () => {
      it('should use context sessionId/topicId when provided', async () => {
        const { result } = renderHook(() => useChatStore());
        const messageId = 'message-id';
        const error = { message: 'Plugin error', type: 'error' as any };
        const contextSessionId = 'context-session';
        const contextTopicId = 'context-topic';

        (messageService.updateMessage as Mock).mockResolvedValue({
          success: true,
          messages: [],
        });

        let operationId: string;
        await act(async () => {
          // Create operation with desired context
          const op = result.current.startOperation({
            type: 'sendMessage',
            context: { sessionId: contextSessionId, topicId: contextTopicId },
          });
          operationId = op.operationId;

          await result.current.optimisticUpdatePluginError(messageId, error, {
            operationId,
          });
        });

        expect(messageService.updateMessage).toHaveBeenCalledWith(
          messageId,
          { error },
          { sessionId: contextSessionId, topicId: contextTopicId },
        );
      });
    });

    describe('internal_refreshToUpdateMessageTools', () => {
      it('should use context sessionId/topicId when provided', async () => {
        const { result } = renderHook(() => useChatStore());
        const messageId = 'message-id';
        const contextSessionId = 'context-session';
        const contextTopicId = 'context-topic';

        const message = {
          id: messageId,
          role: 'assistant',
          content: 'test',
          tools: [{ id: 'tool-1', identifier: 'test', apiName: 'test', arguments: '{}' }],
          sessionId: contextSessionId,
          topicId: contextTopicId,
        } as any;

        // Set up both dbMessagesMap and messagesMap
        const key = messageMapKey(contextSessionId, contextTopicId);
        let operationId: string;
        act(() => {
          // Create operation with desired context
          const op = result.current.startOperation({
            type: 'sendMessage',
            context: { sessionId: contextSessionId, topicId: contextTopicId },
          });
          operationId = op.operationId;

          useChatStore.setState({
            dbMessagesMap: {
              [key]: [message],
            },
            messagesMap: {
              [key]: [message],
            },
            activeId: contextSessionId,
            activeTopicId: contextTopicId,
          });
        });

        await act(async () => {
          await result.current.internal_refreshToUpdateMessageTools(messageId, {
            operationId,
          });
        });

        expect(messageService.updateMessage).toHaveBeenCalledWith(
          messageId,
          { tools: message.tools },
          { sessionId: contextSessionId, topicId: contextTopicId },
        );
      });
    });
  });
});
