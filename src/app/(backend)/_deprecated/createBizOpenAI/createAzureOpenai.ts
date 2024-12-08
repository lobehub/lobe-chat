import OpenAI, { ClientOptions } from 'openai';
import urlJoin from 'url-join';

import { getLLMConfig } from '@/config/llm';
import { ChatErrorType } from '@/types/fetch';

// create Azure OpenAI Instance
export const createAzureOpenai = (params: {
  apiVersion?: string | null;
  endpoint?: string | null;
  model: string;
  userApiKey?: string | null;
}) => {
  // 1. 获取配置
  const { AZURE_API_VERSION, AZURE_API_KEY } = getLLMConfig();
  const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL || '';

  // 2. 构建 endpoint 和 baseURL
  const endpoint = !params.endpoint ? OPENAI_PROXY_URL : params.endpoint;
  const baseURL = urlJoin(endpoint, `/openai/deployments/${params.model.replace('.', '')}`); // refs: https://test-001.openai.azure.com/openai/deployments/gpt-35-turbo

  // 3. 确定 API 版本和 Key
  const defaultApiVersion = AZURE_API_VERSION || '2023-08-01-preview';
  const apiVersion = !params.apiVersion ? defaultApiVersion : params.apiVersion;
  const apiKey = !params.userApiKey ? AZURE_API_KEY : params.userApiKey;

  // 4. 检查 API Key
  if (!apiKey) throw new Error('AZURE_API_KEY is empty', { cause: ChatErrorType.NoOpenAIAPIKey });

  // 5. 创建配置
  const config: ClientOptions = {
    apiKey,
    baseURL,
    defaultHeaders: { 'api-key': apiKey },
    defaultQuery: { 'api-version': apiVersion },
  };

  // 6. 创建实例
  return new OpenAI(config);
};
