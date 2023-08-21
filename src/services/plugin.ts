import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';

import { LOBE_CHAT_ACCESS_CODE } from '@/const/fetch';
import { useGlobalStore } from '@/store/global';

import { URLS } from './url';

interface FetchChatModelOptions {
  signal?: AbortSignal | undefined;
  withPlugin?: boolean;
}

/**
 * 专门用于对话的 fetch
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
