import OpenAI from 'openai';

import { getLLMConfig } from '@/config/llm';
import { ChatErrorType } from '@/types/fetch';

// create OpenAI instance
export const createOpenai = (userApiKey: string | null, endpoint?: string | null) => {
  // 1. 获取配置
  const { OPENAI_API_KEY } = getLLMConfig();
  const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

  // 2. 确定 baseURL
  const baseURL = endpoint ? endpoint : OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined;

  // 3. 确定 API Key
  const apiKey = !userApiKey ? OPENAI_API_KEY : userApiKey;

  // 4. 检查 API Key
  if (!apiKey) throw new Error('OPENAI_API_KEY is empty', { cause: ChatErrorType.NoOpenAIAPIKey });

  // 5. 创建实例
  return new OpenAI({ apiKey, baseURL });
};
