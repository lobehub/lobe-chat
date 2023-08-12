import { useSettings } from 'src/store/global';

import { LOBE_CHAT_ACCESS_CODE } from '@/const/fetch';
import { OpenAIPluginPayload } from '@/types/plugin';

import { URLS } from './url';

interface FetchChatModelOptions {
  signal?: AbortSignal | undefined;
  withPlugin?: boolean;
}

/**
 * 专门用于对话的 fetch
 */
export const fetchPlugin = async (
  params: Partial<OpenAIPluginPayload>,
  options?: FetchChatModelOptions,
) => {
  const res = await fetch(URLS.plugins, {
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      [LOBE_CHAT_ACCESS_CODE]: useSettings.getState().settings.password || '',
    },
    method: 'POST',
    signal: options?.signal,
  });

  return await res.text();
};
