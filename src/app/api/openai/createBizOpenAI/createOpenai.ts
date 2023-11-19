import OpenAI from 'openai';

import { getServerConfig } from '@/config/server';
import { ChatErrorType } from '@/types/fetch';

// create OpenAI instance
export const createOpenai = (userApiKey: string | null, endpoint?: string | null) => {
  const { OPENAI_API_KEY, OPENAI_PROXY_URL } = getServerConfig();

  const baseURL = endpoint ? endpoint : OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined;

  const apiKey = !userApiKey ? OPENAI_API_KEY : userApiKey;

  if (!apiKey) throw new Error('OPENAI_API_KEY is empty', { cause: ChatErrorType.NoAPIKey });

  return new OpenAI({ apiKey, baseURL });
};
