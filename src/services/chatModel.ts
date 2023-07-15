import { merge } from 'lodash-es';

import type { OpenAIStreamPayload } from '@/pages/api/OpenAIStream';

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
      model: 'gpt-3.5-turbo',
      stream: true,
      temperature: 0.6,
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
