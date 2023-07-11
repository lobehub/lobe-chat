import type { OpenAIStreamPayload } from '@/pages/api/OpenAIStream';
import { merge } from 'lodash-es';

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
      temperature: 0.6,
      stream: true,
    },
    params,
  );

  return fetch(URLS.openai, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });
};
