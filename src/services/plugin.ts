import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';

import { LOBE_PLUGIN_SETTINGS } from '@/const/fetch';
import { PLUGINS_INDEX_URL } from '@/const/url';
import { usePluginStore } from '@/store/plugin';

import { URLS } from './url';

interface FetchChatModelOptions {
  signal?: AbortSignal | undefined;
  withPlugin?: boolean;
}

/**
 * 请求插件结果´
 */
export const fetchPlugin = async (
  params: PluginRequestPayload,
  options?: FetchChatModelOptions,
) => {
  const settings = usePluginStore.getState().pluginsSettings?.[params.identifier];

  const res = await fetch(URLS.plugins, {
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      [LOBE_PLUGIN_SETTINGS]: JSON.stringify(settings) || '',
    },
    method: 'POST',
    signal: options?.signal,
  });

  return await res.text();
};

/**
 * 请求插件列表
 */
export const getPluginList = async () => {
  const res = await fetch(PLUGINS_INDEX_URL);

  return res.json();
};
