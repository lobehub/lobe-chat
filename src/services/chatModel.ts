import { merge } from 'lodash-es';

import { initialLobeAgentConfig } from '@/store/session';
import type { OpenAIStreamPayload } from '@/types/openai';

import { URLS } from './url';

/**
 * 专门用于对话的 fetch
 */
export const fetchChatModel = (
  params: Partial<OpenAIStreamPayload>,
  options?: { signal?: AbortSignal | undefined; withPlugin?: boolean },
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
    },
    method: 'POST',
    signal: options?.signal,
  });
};
