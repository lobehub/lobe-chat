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
import { LobeTool } from '@/types/tool';

// Mock messageService 和 chatSelectors
vi.mock('@/services/message', () => ({
  messageService: {
    updateMessageContent: vi.fn(),
    updateMessage: vi.fn(),
    updateMessageError: vi.fn(),
    updateMessagePluginState: vi.fn(),
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

describe('ChatPluginAction', () => {
  describe('fillPluginMessageContent', () => {
    it('should update message content and process the message', async () => {
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

      // 验证 coreProcessMessage 是否被正确调用
      expect(result.current.coreProcessMessage).toHaveBeenCalledWith(mockCurrentChats, messageId);
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

      useChatStore.setState({
        refreshMessages: vi.fn(),
        invokeDefaultTypePlugin: vi.fn(),
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
});
