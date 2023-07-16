import { merge } from 'lodash-es';

import type { OpenAIStreamPayload } from '@/types/openai';

import { URLS } from './url';

/**
 * 专门用于对话的 fetch
 */
export const fetchChatModel = (
  params: Partial<OpenAIStreamPayload>,
  signal?: AbortSignal | undefined,
) => {
  const payload = merge(
    {
      frequency_penalty: 0,
      model: 'gpt-3.5-turbo',
      presence_penalty: 0,
      stream: true,
      temperature: 0.6,
      top_p: 1,
    },
    params,
  );

  return fetch(URLS.openai, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal,
  });
};
