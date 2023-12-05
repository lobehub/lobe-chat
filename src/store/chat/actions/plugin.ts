import { StateCreator } from 'zustand/vanilla';

import { PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { ChatPluginPayload } from '@/types/chatMessage';
import { OpenAIFunctionCall } from '@/types/openai/functionCall';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../selectors';

const n = setNamespace('plugin');

export interface ChatPluginAction {
  fillPluginMessageContent: (id: string, content: string) => Promise<void>;
  runPluginDefaultType: (id: string, payload: any) => Promise<void>;
  triggerFunctionCall: (id: string) => Promise<void>;
  updatePluginState: (id: string, key: string, value: any) => Promise<void>;
}

export const chatPlugin: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPluginAction
> = (set, get) => ({
  fillPluginMessageContent: async (id, content) => {
    const { coreProcessMessage, refreshMessages } = get();

    await messageService.updateMessageContent(id, content);
    await refreshMessages();

    const chats = chatSelectors.currentChats(get());
    await coreProcessMessage(chats, id);
  },
  runPluginDefaultType: async (id, payload) => {
    const { refreshMessages, coreProcessMessage, toggleChatLoading } = get();
    let data: string;
    try {
      const abortController = toggleChatLoading(true, id, n('fetchPlugin') as string);
      data = await chatService.runPluginApi(payload, { signal: abortController?.signal });
    } catch (error) {
      await messageService.updateMessageError(id, error as any);
      await refreshMessages();

      data = '';
    }
    toggleChatLoading(false);
    // 如果报错则结束了
    if (!data) return;

    await messageService.updateMessageContent(id, data);
    await refreshMessages();

    const chats = chatSelectors.currentChats(get());
    await coreProcessMessage(chats, id);
  },
  triggerFunctionCall: async (id) => {
    const { runPluginDefaultType, refreshMessages } = get();

    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    let payload = { apiName: '', identifier: '' } as ChatPluginPayload;

    // 识别到内容是 function_call 的情况下
    // 将 function_call 转换为 plugin request payload
    if (message.content) {
      const { function_call } = JSON.parse(message.content) as {
        function_call: OpenAIFunctionCall;
      };

      const [identifier, apiName, type] = function_call.name.split(PLUGIN_SCHEMA_SEPARATOR);

      payload = {
        apiName,
        arguments: function_call.arguments,
        identifier,
        type: (type ?? 'default') as any,
      };
    } else {
      if (message.plugin) payload = message.plugin;
    }

    if (!payload.apiName) return;

    await messageService.updateMessage(id, {
      content: !!message.content ? '' : undefined,
      plugin: payload,
      role: 'function',
    });
    await refreshMessages();

    if (payload.type === 'standalone') {
      // TODO: need to auth user's settings
    } else runPluginDefaultType(id, payload);
  },
  updatePluginState: async (id, key, value) => {
    const { refreshMessages } = get();

    await messageService.updateMessagePluginState(id, key, value);
    await refreshMessages();
  },
});
