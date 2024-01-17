import { act, renderHook } from '@testing-library/react';
import { Md5 } from 'ts-md5';
import { Mock, describe, expect, it, vi } from 'vitest';

import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { useChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { ChatPluginPayload } from '@/types/message';
import { LobeTool } from '@/types/tool';

const invokeStandaloneTypePlugin = useChatStore.getState().invokeStandaloneTypePlugin;

// Mock messageService 和 chatSelectors
vi.mock('@/services/message', () => ({
  messageService: {
    updateMessageContent: vi.fn(),
    updateMessage: vi.fn(),
    updateMessageError: vi.fn(),
    updateMessagePluginState: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock('@/services/chat', () => ({
  chatService: {
    runPluginApi: vi.fn(),
  },
}));

vi.mock('@/store/chat/selectors', () => ({
  chatSelectors: {
    currentChats: vi.fn(),
    getMessageById: vi.fn(),
  },
}));
beforeEach(() => {
  // 在每个测试之前重置模拟函数
  vi.resetAllMocks();
});

describe('ChatPluginAction', () => {
  describe('fillPluginMessageContent', () => {
    it('should update message content and trigger the ai message', async () => {
      // 设置模拟函数的返回值
      const mockCurrentChats: any[] = [];
      (chatSelectors.currentChats as Mock).mockReturnValue(mockCurrentChats);

      // 设置初始状态
      const initialState = {
        messages: [],
        coreProcessMessage: vi.fn(),
        refreshMessages: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.fillPluginMessageContent(messageId, newContent, true);
      });

      // 验证 messageService.updateMessageContent 是否被正确调用
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, { content: newContent });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();

      // 验证 coreProcessMessage 是否被正确调用
      expect(result.current.coreProcessMessage).toHaveBeenCalledWith(mockCurrentChats, messageId);
    });
    it('should update message content and not trigger ai message', async () => {
      // 设置模拟函数的返回值
      const mockCurrentChats: any[] = [];
      (chatSelectors.currentChats as Mock).mockReturnValue(mockCurrentChats);

      // 设置初始状态
      const initialState = {
        messages: [],
        coreProcessMessage: vi.fn(),
        refreshMessages: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      const messageId = 'message-id';
      const newContent = 'Updated content';

      await act(async () => {
        await result.current.fillPluginMessageContent(messageId, newContent);
      });

      // 验证 messageService.updateMessageContent 是否被正确调用
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, { content: newContent });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();

      // 验证 coreProcessMessage 没有被正确调用
      expect(result.current.coreProcessMessage).not.toHaveBeenCalled();
    });
  });

  describe('runPluginDefaultType', () => {
    it('should run the default plugin type and update message content', async () => {
      const pluginPayload = { apiName: 'testApi', arguments: { key: 'value' } };
      const messageId = 'message-id';
      const pluginApiResponse = 'Plugin API response';

      const initialState = {
        refreshMessages: vi.fn(),
        coreProcessMessage: vi.fn(),
        toggleChatLoading: vi.fn(),
      };
      useChatStore.setState(initialState);

      (chatService.runPluginApi as Mock).mockResolvedValue(pluginApiResponse);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeDefaultTypePlugin(messageId, pluginPayload);
      });

      expect(initialState.toggleChatLoading).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(chatService.runPluginApi).toHaveBeenCalledWith(pluginPayload, { signal: undefined });
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, {
        content: pluginApiResponse,
      });
      expect(initialState.refreshMessages).toHaveBeenCalled();
      expect(initialState.coreProcessMessage).toHaveBeenCalled();
      expect(initialState.toggleChatLoading).toHaveBeenCalledWith(false);
    });

    it('should handle errors when the plugin API call fails', async () => {
      const pluginPayload = { apiName: 'testApi', arguments: { key: 'value' } };
      const messageId = 'message-id';
      const error = new Error('API call failed');

      const initialState = {
        refreshMessages: vi.fn(),
        coreProcessMessage: vi.fn(),
        toggleChatLoading: vi.fn(),
      };
      useChatStore.setState(initialState);

      (chatService.runPluginApi as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeDefaultTypePlugin(messageId, pluginPayload);
      });

      expect(initialState.toggleChatLoading).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(chatService.runPluginApi).toHaveBeenCalledWith(pluginPayload, { signal: undefined });
      expect(messageService.updateMessageError).toHaveBeenCalledWith(messageId, error);
      expect(initialState.refreshMessages).toHaveBeenCalled();
      expect(initialState.toggleChatLoading).toHaveBeenCalledWith(false);
      expect(initialState.coreProcessMessage).not.toHaveBeenCalled(); // 确保在错误情况下不调用此方法
    });
  });

  describe('triggerFunctionCall', () => {
    it('should trigger a function call and update the plugin message accordingly', async () => {
      const messageId = 'message-id';
      const messageContent = JSON.stringify({
        tool_calls: [
          {
            id: 'call_sbca',
            type: 'function',
            function: {
              name: `pluginName${PLUGIN_SCHEMA_SEPARATOR}apiName`,
              arguments: { key: 'value' },
            },
          },
        ],
      });
      const messagePluginPayload = {
        apiName: 'apiName',
        identifier: 'pluginName',
        type: 'default',
        arguments: { key: 'value' },
      };

      const initialState = {
        refreshMessages: vi.fn(),
        invokeDefaultTypePlugin: vi.fn(),
      };
      useChatStore.setState(initialState);

      (chatSelectors.getMessageById as Mock).mockImplementation(() => () => ({
        id: messageId,
        content: messageContent,
      }));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.triggerFunctionCall(messageId);
      });

      expect(chatSelectors.getMessageById).toHaveBeenCalledWith(messageId);
      expect(messageService.updateMessage).toHaveBeenCalledWith(messageId, {
        content: '',
        plugin: messagePluginPayload,
        role: 'function',
      });
      expect(initialState.refreshMessages).toHaveBeenCalled();
      expect(initialState.invokeDefaultTypePlugin).toHaveBeenCalledWith(
        messageId,
        messagePluginPayload,
      );
    });

    it('should handle function call with MD5 prefixed API name', async () => {
      const messageId = 'message-id';
      const apiName = 'originalApiName';
      const id = 'pluginIdentifier';
      const md5ApiName = PLUGIN_SCHEMA_API_MD5_PREFIX + Md5.hashStr(apiName).toString();
      const messageContent = JSON.stringify({
        tool_calls: [
          {
            id: 'call_sbca',
            type: 'function',
            function: {
              name: id + PLUGIN_SCHEMA_SEPARATOR + md5ApiName,
              arguments: {},
            },
          },
        ],
      });

      const plugin = { identifier: id, manifest: { api: [{ name: apiName }] } } as LobeTool;

      useToolStore.setState({ installedPlugins: [plugin] });

      useChatStore.setState({ refreshMessages: vi.fn(), invokeDefaultTypePlugin: vi.fn() });

      (chatSelectors.getMessageById as Mock).mockImplementation(() => () => ({
        id: messageId,
        content: messageContent,
      }));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.triggerFunctionCall(messageId);
      });
      expect(result.current.refreshMessages).toHaveBeenCalled();

      expect(messageService.updateMessage).toHaveBeenCalledWith(
        messageId,
        expect.objectContaining({
          // 确保正确的 API 名称被设置
          plugin: expect.objectContaining({ apiName }),
        }),
      );
      expect(result.current.invokeDefaultTypePlugin).toHaveBeenCalledWith(
        messageId,
        expect.objectContaining({
          apiName: apiName,
        }),
      );
    });

    it('should handle standalone plugin type', async () => {
      const messageId = 'message-id';
      const messageContent = JSON.stringify({
        tool_calls: [
          {
            id: 'call_scv',
            function: {
              name: `pluginName${PLUGIN_SCHEMA_SEPARATOR}apiName${PLUGIN_SCHEMA_SEPARATOR}standalone`,
              arguments: {},
            },
          },
        ],
      });

      const invokeStandaloneTypePlugin = useChatStore.getState().invokeStandaloneTypePlugin;

      act(() => {
        useChatStore.setState({
          refreshMessages: vi.fn(),
          invokeStandaloneTypePlugin: vi.fn(),
        });
      });

      (chatSelectors.getMessageById as Mock).mockImplementation(() => () => ({
        id: messageId,
        content: messageContent,
      }));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.triggerFunctionCall(messageId);
      });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();

      // 验证 invokeDefaultTypePlugin 是否没有被调用，因为类型是 standalone
      expect(result.current.invokeDefaultTypePlugin).not.toHaveBeenCalled();
      expect(result.current.invokeStandaloneTypePlugin).toHaveBeenCalled();

      useChatStore.setState({ invokeStandaloneTypePlugin });
    });

    it('should handle builtin plugin type', async () => {
      const messageId = 'message-id';
      const messageContent = JSON.stringify({
        tool_calls: [
          {
            id: 'call_scv',
            function: {
              name: `pluginName${PLUGIN_SCHEMA_SEPARATOR}apiName${PLUGIN_SCHEMA_SEPARATOR}builtin`,
              arguments: {},
            },
          },
        ],
      });

      const invokeBuiltinTool = useChatStore.getState().invokeBuiltinTool;
      useChatStore.setState({ refreshMessages: vi.fn(), invokeBuiltinTool: vi.fn() });

      (chatSelectors.getMessageById as Mock).mockImplementation(() => () => ({
        id: messageId,
        content: messageContent,
      }));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.triggerFunctionCall(messageId);
      });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();

      // 验证 invokeDefaultTypePlugin 是否没有被调用，因为类型是 standalone
      expect(result.current.invokeDefaultTypePlugin).not.toHaveBeenCalled();
      expect(result.current.invokeBuiltinTool).toHaveBeenCalled();

      useChatStore.setState({ invokeBuiltinTool });
    });

    it('should handle markdown plugin type', async () => {
      const messageId = 'message-id';
      const messageContent = JSON.stringify({
        tool_calls: [
          {
            id: 'call_scv',
            function: {
              name: `pluginName${PLUGIN_SCHEMA_SEPARATOR}apiName${PLUGIN_SCHEMA_SEPARATOR}markdown`,
              arguments: {},
            },
          },
        ],
      });

      const invokeMarkdownTypePlugin = useChatStore.getState().invokeMarkdownTypePlugin;
      useChatStore.setState({
        refreshMessages: vi.fn(),
        invokeMarkdownTypePlugin: vi.fn(),
      });

      (chatSelectors.getMessageById as Mock).mockImplementation(() => () => ({
        id: messageId,
        content: messageContent,
      }));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.triggerFunctionCall(messageId);
      });

      // 验证 refreshMessages 是否被调用
      expect(result.current.refreshMessages).toHaveBeenCalled();

      expect(result.current.invokeDefaultTypePlugin).not.toHaveBeenCalled();
      expect(result.current.invokeMarkdownTypePlugin).toHaveBeenCalled();

      useChatStore.setState({ invokeMarkdownTypePlugin });
    });
  });

  describe('updatePluginState', () => {
    it('should update the plugin state for a message', async () => {
      const messageId = 'message-id';
      const pluginStateKey = 'key';
      const pluginStateValue = 'value';

      const initialState = {
        refreshMessages: vi.fn(),
      };
      useChatStore.setState(initialState);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.updatePluginState(messageId, pluginStateKey, pluginStateValue);
      });

      expect(messageService.updateMessagePluginState).toHaveBeenCalledWith(
        messageId,
        pluginStateKey,
        pluginStateValue,
      );
      expect(initialState.refreshMessages).toHaveBeenCalled();
    });
  });

  describe('createAssistantMessageByPlugin', () => {
    it('should create an assistant message and refresh messages', async () => {
      // 模拟 messageService.create 方法的实现
      (messageService.create as Mock).mockResolvedValue({});

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
      expect(messageService.create).toHaveBeenCalledWith({
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
      (messageService.create as Mock).mockRejectedValue(new Error(errorMessage));

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
      expect(messageService.create).toHaveBeenCalledWith({
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
      } as ChatPluginPayload;

      const messageId = 'message-id';
      const toolResponse = JSON.stringify({ abc: 'data' });

      useToolStore.setState({
        invokeBuiltinTool: vi.fn().mockResolvedValue(toolResponse),
      });

      useChatStore.setState({
        toggleChatLoading: vi.fn(),
        updateMessageContent: vi.fn(),
        text2image: vi.fn(),
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Verify that the builtin tool was invoked with the correct arguments
      expect(useToolStore.getState().invokeBuiltinTool).toHaveBeenCalledWith(
        payload.apiName,
        JSON.parse(payload.arguments),
      );

      // Verify that the message content was updated with the tool response
      expect(result.current.updateMessageContent).toHaveBeenCalledWith(messageId, toolResponse);

      // Verify that loading was toggled correctly
      expect(result.current.toggleChatLoading).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(result.current.toggleChatLoading).toHaveBeenCalledWith(false);
      expect(useChatStore.getState().text2image).toHaveBeenCalled();
    });

    it('should invoke a builtin tool and update message content', async () => {
      const payload = {
        apiName: 'text2image',
        arguments: JSON.stringify({ key: 'value' }),
      } as ChatPluginPayload;

      const messageId = 'message-id';
      const toolResponse = 'Builtin tool response';

      act(() => {
        useToolStore.setState({
          invokeBuiltinTool: vi.fn().mockResolvedValue(toolResponse),
          text2image: vi.fn(),
        });

        useChatStore.setState({
          toggleChatLoading: vi.fn(),
          text2image: vi.fn(),
          updateMessageContent: vi.fn(),
        });
      });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Verify that the builtin tool was invoked with the correct arguments
      expect(useToolStore.getState().invokeBuiltinTool).toHaveBeenCalledWith(
        payload.apiName,
        JSON.parse(payload.arguments),
      );

      // Verify that the message content was updated with the tool response
      expect(result.current.updateMessageContent).toHaveBeenCalledWith(messageId, toolResponse);

      // Verify that loading was toggled correctly
      expect(result.current.toggleChatLoading).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(result.current.toggleChatLoading).toHaveBeenCalledWith(false);
      expect(useChatStore.getState().text2image).not.toHaveBeenCalled();
    });

    it('should handle errors when invoking a builtin tool fails', async () => {
      const payload = {
        apiName: 'builtinApi',
        arguments: JSON.stringify({ key: 'value' }),
      } as ChatPluginPayload;

      const messageId = 'message-id';
      const error = new Error('Builtin tool failed');

      useToolStore.setState({
        invokeBuiltinTool: vi.fn().mockRejectedValue(error),
      });

      useChatStore.setState({
        toggleChatLoading: vi.fn(),
        updateMessageContent: vi.fn(),
        text2image: vi.fn(),
        refreshMessages: vi.fn(),
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.invokeBuiltinTool(messageId, payload);
      });

      // Verify that loading was toggled correctly
      expect(result.current.toggleChatLoading).toHaveBeenCalledWith(
        true,
        messageId,
        expect.any(String),
      );
      expect(result.current.toggleChatLoading).toHaveBeenCalledWith(false);

      // Verify that the message content was not updated
      expect(result.current.updateMessageContent).not.toHaveBeenCalled();

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
      } as ChatPluginPayload;
      const messageId = 'message-id';

      const runPluginApiMock = vi.fn();

      act(() => {
        useChatStore.setState({ runPluginApi: runPluginApiMock });
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
      } as ChatPluginPayload;

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
