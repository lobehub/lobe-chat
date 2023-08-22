import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';

import { LOBE_CHAT_ACCESS_CODE } from '@/const/fetch';
import { PLUGINS_INDEX_URL } from '@/const/url';
import { useGlobalStore } from '@/store/global';

import { URLS } from './url';

interface FetchChatModelOptions {
  signal?: AbortSignal | undefined;
  withPlugin?: boolean;
}

/**
 * 请求插件结果
 */
export const fetchPlugin = async (
  params: PluginRequestPayload,
  options?: FetchChatModelOptions,
) => {
  const res = await fetch(URLS.plugins, {
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      [LOBE_CHAT_ACCESS_CODE]: useGlobalStore.getState().settings.password || '',
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
