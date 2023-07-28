import { merge } from 'lodash-es';

import { LOBE_CHAT_ACCESS_CODE, OPENAI_API_KEY_HEADER_KEY } from '@/const/fetch';
import { initialLobeAgentConfig } from '@/store/session';
import { useSettings } from '@/store/settings';
import type { OpenAIStreamPayload } from '@/types/openai';

import { URLS } from './url';

interface FetchChatModelOptions {
  signal?: AbortSignal | undefined;
  withPlugin?: boolean;
}

/**
 * 专门用于对话的 fetch
 */
export const fetchChatModel = (
  params: Partial<OpenAIStreamPayload>,
  options?: FetchChatModelOptions,
) => {
  const payload = merge(
    {
      model: initialLobeAgentConfig.model,
      stream: true,
      ...initialLobeAgentConfig.params,
    },
    params,
  );

  return fetch(options?.withPlugin ? URLS.plugins : URLS.openai, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      [LOBE_CHAT_ACCESS_CODE]: useSettings.getState().settings.password || '',
      [OPENAI_API_KEY_HEADER_KEY]: useSettings.getState().settings.OPENAI_API_KEY || '',
    },
    method: 'POST',
    signal: options?.signal,
  });
};
