import OpenAI, { ClientOptions } from 'openai';

import { getServerConfig } from '@/config/server';

// 创建 Azure OpenAI 实例
export const createAzureOpenai = (params: {
  apiVersion: string;
  endpoint: string;
  userApiKey?: string | null;
}) => {
  const { AZURE_API_KEY } = getServerConfig();

  const baseURL = params.endpoint;
  const apiKey = !params.userApiKey ? AZURE_API_KEY : params.userApiKey;

  const config: ClientOptions = {
    apiKey: apiKey,
    baseURL,
    defaultHeaders: { 'api-key': apiKey },
    defaultQuery: {
      'api-version': params.apiVersion,
    },
  };

  return new OpenAI(config);
};
