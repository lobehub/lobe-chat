import OpenAI, { ClientOptions } from 'openai';

import { getServerConfig } from '@/config/server';

// 创建 OpenAI 实例
export const createOpenai = (userApiKey: string | null, endpoint?: string | null) => {
  const { OPENAI_API_KEY, OPENAI_PROXY_URL } = getServerConfig();

  const baseURL = endpoint ? endpoint : OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined;

  const config: ClientOptions = {
    apiKey: !userApiKey ? OPENAI_API_KEY : userApiKey,
    baseURL,
  };

  return new OpenAI(config);
};
