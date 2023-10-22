import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { StateCreator } from 'zustand/vanilla';

import { PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { fetchPlugin } from '@/services/plugin';
import { SessionStore } from '@/store/session';
import { OpenAIFunctionCall } from '@/types/chatMessage';
import { setNamespace } from '@/utils/storeDebug';

import { sessionSelectors } from '../../session/selectors';
import { chatSelectors } from '../selectors';

const t = setNamespace('chat/plugin');

/**
 * 插件方法
 */
export interface ChatPluginAction {
  runPluginDefaultType: (id: string, payload: any) => Promise<void>;
  runPluginStandaloneType: (id: string, payload: any) => Promise<void>;
  triggerFunctionCall: (id: string) => Promise<void>;
}

export const chatPlugin: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ChatPluginAction
> = (set, get) => ({
  runPluginDefaultType: async (id, payload) => {
    const { dispatchMessage, coreProcessMessage, toggleChatLoading } = get();
    let data: string;
    try {
      const abortController = toggleChatLoading(true, id, t('fetchPlugin') as string);
      data = await fetchPlugin(payload, { signal: abortController?.signal });
    } catch (error) {
      dispatchMessage({ id, key: 'error', type: 'updateMessage', value: error });

      data = '';
    }
    toggleChatLoading(false);
    // 如果报错则结束了
    if (!data) return;

    dispatchMessage({ id, key: 'content', type: 'updateMessage', value: data });

    const chats = chatSelectors.currentChats(get());
    await coreProcessMessage(chats, id);
  },
  runPluginStandaloneType: async (id, payload) => {
    console.log('触发standalone', id, payload);
  },
  triggerFunctionCall: async (id) => {
    const { dispatchMessage, runPluginDefaultType, runPluginStandaloneType } = get();
    const session = sessionSelectors.currentSession(get());

    if (!session) return;

    const message = session.chats[id];
    if (!message) return;

    let payload: PluginRequestPayload = { apiName: '', identifier: '' };

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
        type: type ?? 'default',
      };

      dispatchMessage({ id, key: 'plugin', type: 'updateMessage', value: payload });
      dispatchMessage({ id, key: 'content', type: 'updateMessage', value: '' });
    } else {
      if (message.plugin) {
        payload = message.plugin;
      }
    }

    if (!payload.apiName) return;

    dispatchMessage({ id, key: 'role', type: 'updateMessage', value: 'function' });
    dispatchMessage({ id, key: 'name', type: 'updateMessage', value: payload.identifier });
    dispatchMessage({ id, key: 'plugin', type: 'updateMessage', value: payload });

    if (payload.type === 'standalone') runPluginStandaloneType(id, payload);
    else runPluginDefaultType(id, payload);
  },
});
