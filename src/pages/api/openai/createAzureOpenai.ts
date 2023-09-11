import OpenAI, { ClientOptions } from 'openai';

import { getServerConfig } from '@/config/server';

// 创建 Azure OpenAI 实例
export const createAzureOpenai = (params: {
  apiVersion: string;
  endpoint: string;
  userApiKey?: string | null;
}) => {
  const { AZURE_API_KEY, OPENAI_PROXY_URL, AZURE_API_VERSION } = getServerConfig();

  const baseURL = params.endpoint ?? OPENAI_PROXY_URL;
  const apiKey = !params.userApiKey ? AZURE_API_KEY : params.userApiKey;
  const apiVersion = params.apiVersion ?? AZURE_API_VERSION ?? '2023-08-01-preview';

  const config: ClientOptions = {
    apiKey: apiKey,
    baseURL,
    defaultHeaders: { 'api-key': apiKey },
    defaultQuery: { 'api-version': apiVersion },
  };

  return new OpenAI(config);
};
