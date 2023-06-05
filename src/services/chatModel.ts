import { OpenAIStreamPayload } from '@/pages/api/OpenAIStream';
import { OpenAIRequestParams } from '@/types';
import { genChatMessages } from '@/utils/genChatMessages';
import { URLS } from './url';

/**
 * 专门用于对话的 fetch
 */
export const fetchChatModel = (params: OpenAIRequestParams, signal?: AbortSignal | undefined) => {
  const { message, messages, systemRole } = params;

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: genChatMessages({
      message,
      messages,
      systemRole: systemRole || '你是一名人工智能助理，请使用中文回答下来的问题',
    }),
    temperature: 0.6,
    stream: true,
  };

  return fetch(URLS.openai, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });
};
