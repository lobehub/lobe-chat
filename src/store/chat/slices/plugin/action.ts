import { PluginErrorType } from '@lobehub/chat-plugin-sdk';
import { t } from 'i18next';
import { Md5 } from 'ts-md5';
import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT } from '@/const/message';
import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { chatService } from '@/services/chat';
import { CreateMessageParams, messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { ChatToolPayload, MessageToolCall } from '@/types/message';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../../slices/message/selectors';

const n = setNamespace('plugin');

export interface ChatPluginAction {
  createAssistantMessageByPlugin: (content: string, parentId: string) => Promise<void>;
  fillPluginMessageContent: (
    id: string,
    content: string,
    triggerAiMessage?: boolean,
  ) => Promise<void>;
  internal_transformToolCalls: (toolCalls: MessageToolCall[]) => ChatToolPayload[];
  invokeBuiltinTool: (id: string, payload: ChatToolPayload) => Promise<void>;
  invokeDefaultTypePlugin: (id: string, payload: any) => Promise<string | undefined>;
  invokeMarkdownTypePlugin: (id: string, payload: ChatToolPayload) => Promise<void>;
  invokeStandaloneTypePlugin: (id: string, payload: ChatToolPayload) => Promise<void>;
  runPluginApi: (id: string, payload: ChatToolPayload) => Promise<string | undefined>;
  triggerAIMessage: (params: { parentId?: string; traceId?: string }) => Promise<void>;
  triggerToolCalls: (id: string) => Promise<void>;

  updatePluginState: (id: string, key: string, value: any) => Promise<void>;
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

    await messageService.createMessage(newMessage);
    await get().refreshMessages();
  },

  fillPluginMessageContent: async (id, content, triggerAiMessage) => {
    const { triggerAIMessage, internal_updateMessageContent } = get();

    await internal_updateMessageContent(id, content);

    if (triggerAiMessage) await triggerAIMessage({ parentId: id });
  },

  internal_transformToolCalls: (toolCalls) => {
    return toolCalls
      .map((toolCall): ChatToolPayload | null => {
        let payload: ChatToolPayload;

        const [identifier, apiName, type] = toolCall.function.name.split(PLUGIN_SCHEMA_SEPARATOR);

        if (!apiName) return null;

        payload = {
          apiName,
          arguments: toolCall.function.arguments,
          id: toolCall.id,
          identifier,
          type: (type ?? 'default') as any,
        };

        // if the apiName is md5, try to find the correct apiName in the plugins
        if (apiName.startsWith(PLUGIN_SCHEMA_API_MD5_PREFIX)) {
          const md5 = apiName.replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '');
          const manifest = pluginSelectors.getPluginManifestById(identifier)(
            useToolStore.getState(),
          );

          const api = manifest?.api.find((api) => Md5.hashStr(api.name).toString() === md5);
          if (api) {
            payload.apiName = api.name;
          }
        }

        return payload;
      })
      .filter(Boolean) as ChatToolPayload[];
  },

  invokeBuiltinTool: async (id, payload) => {
    const { internal_toggleChatLoading, internal_updateMessageContent } = get();
    const params = JSON.parse(payload.arguments);
    internal_toggleChatLoading(true, id, n('invokeBuiltinTool') as string);
    let data;
    try {
      data = await useToolStore.getState().invokeBuiltinTool(payload.apiName, params);
    } catch (error) {
      console.log(error);
    }
    internal_toggleChatLoading(false);

    if (!data) return;

    await internal_updateMessageContent(id, data);

    // postToolCalling
    // @ts-ignore
    const { [payload.apiName]: action } = get();
    if (!action) return;

    let content;

    try {
      content = JSON.parse(data);
    } catch {}

    if (!content) return;

    await action(id, content);
  },

  invokeDefaultTypePlugin: async (id, payload) => {
    const { runPluginApi } = get();

    const data = await runPluginApi(id, payload);

    if (!data) return;

    return data;
  },

  invokeMarkdownTypePlugin: async (id, payload) => {
    const { runPluginApi } = get();

    await runPluginApi(id, payload);
  },

  invokeStandaloneTypePlugin: async (id, payload) => {
    const result = await useToolStore.getState().validatePluginSettings(payload.identifier);
    if (!result) return;

    // if the plugin settings is not valid, then set the message with error type
    if (!result.valid) {
      await messageService.updateMessageError(id, {
        body: {
          error: result.errors,
          message: '[plugin] your settings is invalid with plugin manifest setting schema',
        },
        message: t('response.PluginSettingsInvalid', { ns: 'error' }),
        type: PluginErrorType.PluginSettingsInvalid as any,
      });

      await get().refreshMessages();
      return;
    }
  },

  runPluginApi: async (id, payload) => {
    const { internal_updateMessageContent, refreshMessages, internal_toggleChatLoading } = get();
    let data: string;

    try {
      const abortController = internal_toggleChatLoading(
        true,
        id,
        n('fetchPlugin/start') as string,
      );

      const message = chatSelectors.getMessageById(id)(get());

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
        await messageService.updateMessageError(id, error as any);
        await refreshMessages();
      }

      data = '';
    }

    internal_toggleChatLoading(false, id, n('fetchPlugin/end') as string);
    // 如果报错则结束了
    if (!data) return;

    await internal_updateMessageContent(id, data);

    return data;
  },

  triggerAIMessage: async ({ parentId, traceId }) => {
    const { internal_coreProcessMessage } = get();
    const chats = chatSelectors.currentChats(get());
    await internal_coreProcessMessage(chats, parentId ?? chats.at(-1)!.id, { traceId });
  },

  triggerToolCalls: async (assistantId) => {
    const message = chatSelectors.getMessageById(assistantId)(get());
    if (!message || !message.tools) return;

    const {
      invokeDefaultTypePlugin,
      invokeMarkdownTypePlugin,
      invokeStandaloneTypePlugin,
      invokeBuiltinTool,
      triggerAIMessage,
    } = get();

    let shouldCreateMessage = false;
    let latestToolId = '';
    const messagePools = message.tools.map(async (payload) => {
      const toolMessage: CreateMessageParams = {
        content: LOADING_FLAT,
        parentId: assistantId,
        plugin: payload,
        role: 'tool',
        sessionId: get().activeId,
        tool_call_id: payload.id,
        topicId: get().activeTopicId, // if there is activeTopicId，then add it to topicId
      };

      const id = await get().internal_createMessage(toolMessage);

      switch (payload.type) {
        case 'standalone': {
          await invokeStandaloneTypePlugin(id, payload);
          break;
        }

        case 'markdown': {
          await invokeMarkdownTypePlugin(id, payload);
          break;
        }

        case 'builtin': {
          await invokeBuiltinTool(id, payload);
          break;
        }

        default: {
          const data = await invokeDefaultTypePlugin(id, payload);
          if (data) {
            shouldCreateMessage = true;
            latestToolId = id;
          }
        }
      }
    });

    await Promise.all(messagePools);

    // only default type tool calls should trigger AI message
    if (!shouldCreateMessage) return;

    const traceId = chatSelectors.getTraceIdByMessageId(latestToolId)(get());

    await triggerAIMessage({ traceId });
  },

  updatePluginState: async (id, key, value) => {
    const { refreshMessages } = get();

    await messageService.updateMessagePluginState(id, key, value);
    await refreshMessages();
  },
});
