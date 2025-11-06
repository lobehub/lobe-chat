/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { ToolNameResolver } from '@lobechat/context-engine';
import {
  ChatMessageError,
  ChatToolPayload,
  CreateMessageParams,
  MessageToolCall,
  ToolsCallingContext,
  UIChatMessage,
} from '@lobechat/types';
import { LobeChatPluginManifest, PluginErrorType } from '@lobehub/chat-plugin-sdk';
import isEqual from 'fast-deep-equal';
import { t } from 'i18next';
import { StateCreator } from 'zustand/vanilla';

import { chatService } from '@/services/chat';
import { mcpService } from '@/services/mcp';
import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { builtinTools } from '@/tools';
import { merge } from '@/utils/merge';
import { safeParseJSON } from '@/utils/safeParseJSON';
import { setNamespace } from '@/utils/storeDebug';

import { dbMessageSelectors, displayMessageSelectors } from '../message/selectors';
import { threadSelectors } from '../thread/selectors';

const n = setNamespace('plugin');

export interface ChatPluginAction {
  createAssistantMessageByPlugin: (content: string, parentId: string) => Promise<void>;
  fillPluginMessageContent: (
    id: string,
    content: string,
    triggerAiMessage?: boolean,
  ) => Promise<void>;

  invokeBuiltinTool: (id: string, payload: ChatToolPayload) => Promise<void>;
  invokeDefaultTypePlugin: (id: string, payload: any) => Promise<string | undefined>;
  invokeMarkdownTypePlugin: (id: string, payload: ChatToolPayload) => Promise<void>;
  invokeMCPTypePlugin: (id: string, payload: ChatToolPayload) => Promise<string | undefined>;

  invokeStandaloneTypePlugin: (id: string, payload: ChatToolPayload) => Promise<void>;

  reInvokeToolMessage: (id: string) => Promise<void>;
  triggerAIMessage: (params: {
    parentId?: string;
    traceId?: string;
    threadId?: string;
    inPortalThread?: boolean;
    inSearchWorkflow?: boolean;
  }) => Promise<void>;
  summaryPluginContent: (id: string) => Promise<void>;

  /**
   * @deprecated V1 method
   */
  triggerToolCalls: (
    id: string,
    params?: { threadId?: string; inPortalThread?: boolean; inSearchWorkflow?: boolean },
  ) => Promise<void>;
  updatePluginState: (id: string, value: any) => Promise<void>;
  updatePluginArguments: <T = any>(id: string, value: T, replace?: boolean) => Promise<void>;

  internal_addToolToAssistantMessage: (id: string, tool: ChatToolPayload) => Promise<void>;
  internal_removeToolToAssistantMessage: (id: string, tool_call_id?: string) => Promise<void>;
  /**
   * use the optimistic update value to update the message tools to database
   */
  internal_refreshToUpdateMessageTools: (id: string) => Promise<void>;

  internal_callPluginApi: (id: string, payload: ChatToolPayload) => Promise<string | undefined>;
  internal_invokeDifferentTypePlugin: (id: string, payload: ChatToolPayload) => Promise<any>;
  internal_togglePluginApiCalling: (
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;
  internal_transformToolCalls: (toolCalls: MessageToolCall[]) => ChatToolPayload[];
  internal_updatePluginError: (id: string, error: ChatMessageError) => Promise<void>;
  internal_constructToolsCallingContext: (id: string) => ToolsCallingContext | undefined;
}

export const chatPlugin: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPluginAction
> = (set, get) => ({
  createAssistantMessageByPlugin: async (content, parentId) => {
    const newMessage: CreateMessageParams = {
      content,
      parentId,
      role: 'assistant',
      sessionId: get().activeId,
      topicId: get().activeTopicId, // if there is activeTopicId，then add it to topicId
    };

    const result = await messageService.createMessage(newMessage);
    get().replaceMessages(result.messages);
  },

  fillPluginMessageContent: async (id, content, triggerAiMessage) => {
    const { triggerAIMessage, internal_updateMessageContent } = get();

    await internal_updateMessageContent(id, content);

    if (triggerAiMessage) await triggerAIMessage({ parentId: id });
  },
  invokeBuiltinTool: async (id, payload) => {
    // run tool api call
    // @ts-ignore
    const { [payload.apiName]: action } = get();
    if (!action) return;

    const content = safeParseJSON(payload.arguments);

    if (!content) return;

    return await action(id, content);
  },

  invokeDefaultTypePlugin: async (id, payload) => {
    const { internal_callPluginApi } = get();

    const data = await internal_callPluginApi(id, payload);

    if (!data) return;

    return data;
  },

  invokeMarkdownTypePlugin: async (id, payload) => {
    const { internal_callPluginApi } = get();

    await internal_callPluginApi(id, payload);
  },

  invokeStandaloneTypePlugin: async (id, payload) => {
    const result = await useToolStore.getState().validatePluginSettings(payload.identifier);
    if (!result) return;

    // if the plugin settings is not valid, then set the message with error type
    if (!result.valid) {
      const updateResult = await messageService.updateMessageError(id, {
        body: {
          error: result.errors,
          message: '[plugin] your settings is invalid with plugin manifest setting schema',
        },
        message: t('response.PluginSettingsInvalid', { ns: 'error' }),
        type: PluginErrorType.PluginSettingsInvalid as any,
      });

      if (updateResult?.success && updateResult.messages) {
        get().replaceMessages(updateResult.messages);
      }
      return;
    }
  },

  reInvokeToolMessage: async (id) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message || message.role !== 'tool' || !message.plugin) return;

    // if there is error content, then clear the error
    if (!!message.pluginError) {
      get().internal_updateMessagePluginError(id, null);
    }

    const payload: ChatToolPayload = { ...message.plugin, id: message.tool_call_id! };

    await get().internal_invokeDifferentTypePlugin(id, payload);
  },

  triggerAIMessage: async ({ parentId, traceId, threadId, inPortalThread, inSearchWorkflow }) => {
    const { internal_execAgentRuntime } = get();

    const chats = inPortalThread
      ? threadSelectors.portalAIChatsWithHistoryConfig(get())
      : displayMessageSelectors.mainAIChatsWithHistoryConfig(get());

    await internal_execAgentRuntime({
      messages: chats,
      userMessageId: parentId ?? chats.at(-1)!.id,
      traceId,
      threadId,
      inPortalThread,
      inSearchWorkflow,
    });
  },

  summaryPluginContent: async (id) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message || message.role !== 'tool') return;

    await get().internal_execAgentRuntime({
      messages: [
        {
          role: 'assistant',
          content: '作为一名总结专家，请结合以上系统提示词，将以下内容进行总结：',
        },
        {
          ...message,
          content: message.content,
          role: 'assistant',
          name: undefined,
          tool_call_id: undefined,
        },
      ] as UIChatMessage[],
      userMessageId: message.id,
    });
  },

  triggerToolCalls: async (assistantId, { threadId, inPortalThread, inSearchWorkflow } = {}) => {
    const message = displayMessageSelectors.getDisplayMessageById(assistantId)(get());
    if (!message || !message.tools) return;

    let shouldCreateMessage = false;
    let latestToolId = '';
    const messagePools = message.tools.map(async (payload) => {
      const toolMessage: CreateMessageParams = {
        content: '',
        parentId: assistantId,
        plugin: payload,
        role: 'tool',
        sessionId: get().activeId,
        tool_call_id: payload.id,
        threadId,
        topicId: get().activeTopicId, // if there is activeTopicId，then add it to topicId
        groupId: message.groupId, // Propagate groupId from parent message for group chat
      };

      const result = await get().internal_createMessage(toolMessage);
      if (!result) return;

      // trigger the plugin call
      const data = await get().internal_invokeDifferentTypePlugin(result.id, payload);

      if (data && !['markdown', 'standalone'].includes(payload.type)) {
        shouldCreateMessage = true;
        latestToolId = result.id;
      }
    });

    await Promise.all(messagePools);

    await get().internal_toggleMessageInToolsCalling(false, assistantId);

    // only default type tool calls should trigger AI message
    if (!shouldCreateMessage) return;

    const traceId = dbMessageSelectors.getTraceIdByDbMessageId(latestToolId)(get());

    await get().triggerAIMessage({ traceId, threadId, inPortalThread, inSearchWorkflow });
  },
  updatePluginState: async (id, value) => {
    const { replaceMessages } = get();

    // optimistic update
    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { pluginState: value } });

    const result = await messageService.updateMessagePluginState(id, value, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  updatePluginArguments: async (id, value, replace = false) => {
    const { refreshMessages } = get();
    const toolMessage = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!toolMessage || !toolMessage?.tool_call_id) return;

    let assistantMessage = displayMessageSelectors.getDisplayMessageById(
      toolMessage?.parentId || '',
    )(get());

    const prevArguments = toolMessage?.plugin?.arguments;
    const prevJson = safeParseJSON(prevArguments || '');
    const nextValue = replace ? (value as any) : merge(prevJson || {}, value);
    if (isEqual(prevJson, nextValue)) return;

    // optimistic update
    get().internal_dispatchMessage({
      id,
      type: 'updateMessagePlugin',
      value: { arguments: JSON.stringify(nextValue) },
    });

    // 同样需要更新 assistantMessage 的 pluginArguments
    if (assistantMessage) {
      get().internal_dispatchMessage({
        id: assistantMessage.id,
        type: 'updateMessageTools',
        tool_call_id: toolMessage?.tool_call_id,
        value: { arguments: JSON.stringify(nextValue) },
      });
      assistantMessage = displayMessageSelectors.getDisplayMessageById(assistantMessage?.id)(get());
    }

    const updateAssistantMessage = async () => {
      if (!assistantMessage) return;
      await messageService.updateMessage(assistantMessage!.id, {
        tools: assistantMessage?.tools,
      });
    };

    await Promise.all([
      messageService.updateMessagePluginArguments(id, nextValue),
      updateAssistantMessage(),
    ]);

    await refreshMessages();
  },

  internal_addToolToAssistantMessage: async (id, tool) => {
    const assistantMessage = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!assistantMessage) return;

    const { internal_dispatchMessage, internal_refreshToUpdateMessageTools } = get();
    internal_dispatchMessage({
      type: 'addMessageTool',
      value: tool,
      id: assistantMessage.id,
    });

    await internal_refreshToUpdateMessageTools(id);
  },

  internal_removeToolToAssistantMessage: async (id, tool_call_id) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message || !tool_call_id) return;

    const { internal_dispatchMessage, internal_refreshToUpdateMessageTools } = get();

    // optimistic update
    internal_dispatchMessage({ type: 'deleteMessageTool', tool_call_id, id: message.id });

    // update the message tools
    await internal_refreshToUpdateMessageTools(id);
  },
  internal_refreshToUpdateMessageTools: async (id) => {
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message || !message.tools) return;

    const { internal_toggleMessageLoading, replaceMessages } = get();

    internal_toggleMessageLoading(true, id);
    const result = await messageService.updateMessage(
      id,
      { tools: message.tools },
      {
        sessionId: get().activeId,
        topicId: get().activeTopicId,
      },
    );
    internal_toggleMessageLoading(false, id);

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  internal_callPluginApi: async (id, payload) => {
    const { internal_updateMessageContent, internal_togglePluginApiCalling } = get();
    let data: string;

    try {
      const abortController = internal_togglePluginApiCalling(
        true,
        id,
        n('fetchPlugin/start') as string,
      );

      const message = displayMessageSelectors.getDisplayMessageById(id)(get());

      const res = await chatService.runPluginApi(payload, {
        signal: abortController?.signal,
        trace: { observationId: message?.observationId, traceId: message?.traceId },
      });
      data = res.text;

      // save traceId
      if (res.traceId) {
        await messageService.updateMessage(id, { traceId: res.traceId });
      }
    } catch (error) {
      console.log(error);
      const err = error as Error;

      // ignore the aborted request error
      if (!err.message.includes('The user aborted a request.')) {
        const result = await messageService.updateMessageError(id, error as any);
        if (result?.success && result.messages) {
          get().replaceMessages(result.messages);
        }
      }

      data = '';
    }

    internal_togglePluginApiCalling(false, id, n('fetchPlugin/end') as string);
    // 如果报错则结束了
    if (!data) return;

    await internal_updateMessageContent(id, data);

    return data;
  },

  internal_invokeDifferentTypePlugin: async (id, payload) => {
    switch (payload.type) {
      case 'standalone': {
        return await get().invokeStandaloneTypePlugin(id, payload);
      }

      case 'markdown': {
        return await get().invokeMarkdownTypePlugin(id, payload);
      }

      case 'builtin': {
        return await get().invokeBuiltinTool(id, payload);
      }

      // @ts-ignore
      case 'mcp': {
        return await get().invokeMCPTypePlugin(id, payload);
      }

      default: {
        return await get().invokeDefaultTypePlugin(id, payload);
      }
    }
  },
  invokeMCPTypePlugin: async (id, payload) => {
    const {
      internal_updateMessageContent,
      internal_togglePluginApiCalling,
      internal_constructToolsCallingContext,
    } = get();
    let data: string = '';

    try {
      const abortController = internal_togglePluginApiCalling(
        true,
        id,
        n('fetchPlugin/start') as string,
      );

      const context = internal_constructToolsCallingContext(id);
      const result = await mcpService.invokeMcpToolCall(payload, {
        signal: abortController?.signal,
        topicId: context?.topicId,
      });

      if (!!result) data = result;
    } catch (error) {
      console.log(error);
      const err = error as Error;

      // ignore the aborted request error
      if (!err.message.includes('The user aborted a request.')) {
        const result = await messageService.updateMessageError(id, error as any);
        if (result?.success && result.messages) {
          get().replaceMessages(result.messages);
        }
      }
    }

    internal_togglePluginApiCalling(false, id, n('fetchPlugin/end') as string);
    // 如果报错则结束了
    if (!data) return;

    await internal_updateMessageContent(id, data);

    return data;
  },

  internal_togglePluginApiCalling: (loading, id, action) => {
    return get().internal_toggleLoadingArrays('pluginApiLoadingIds', loading, id, action);
  },

  internal_transformToolCalls: (toolCalls) => {
    const toolNameResolver = new ToolNameResolver();

    // Build manifests map from tool store
    const toolStoreState = useToolStore.getState();
    const manifests: Record<string, LobeChatPluginManifest> = {};

    // Get all installed plugins
    const installedPlugins = pluginSelectors.installedPlugins(toolStoreState);
    for (const plugin of installedPlugins) {
      if (plugin.manifest) {
        manifests[plugin.identifier] = plugin.manifest as LobeChatPluginManifest;
      }
    }

    // Get all builtin tools
    for (const tool of builtinTools) {
      if (tool.manifest) {
        manifests[tool.identifier] = tool.manifest as LobeChatPluginManifest;
      }
    }

    return toolNameResolver.resolve(toolCalls, manifests);
  },
  internal_updatePluginError: async (id, error) => {
    const { replaceMessages } = get();

    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { error } });
    const result = await messageService.updateMessage(
      id,
      { error },
      {
        sessionId: get().activeId,
        topicId: get().activeTopicId,
      },
    );
    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  internal_constructToolsCallingContext: (id: string) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message) return;

    return {
      topicId: message.topicId,
    };
  },
});
