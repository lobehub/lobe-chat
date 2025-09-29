import { ModelRuntime } from '@lobechat/model-runtime';
import { ClientSecretPayload } from '@lobechat/types';
import { ModelProvider } from 'model-bank';

import { getLLMConfig } from '@/envs/llm';

import apiKeyManager from './apiKeyManager';

export * from './trace';

/**
 * Retrieves the options object from environment and apikeymanager
 * based on the provider and payload.
 *
 * @param provider - The model provider.
 * @param payload - The JWT payload.
 * @returns The options object.
 */
const getParamsFromPayload = (provider: string, payload: ClientSecretPayload) => {
  const llmConfig = getLLMConfig() as Record<string, any>;

  switch (provider) {
    default: {
      let upperProvider = provider.toUpperCase();

      if (!(`${upperProvider}_API_KEY` in llmConfig)) {
        upperProvider = ModelProvider.OpenAI.toUpperCase(); // Use OpenAI options as default
      }

      const apiKey = apiKeyManager.pick(payload?.apiKey || llmConfig[`${upperProvider}_API_KEY`]);
      const baseURL = payload?.baseURL || process.env[`${upperProvider}_PROXY_URL`];

      return baseURL ? { apiKey, baseURL } : { apiKey };
    }

    case ModelProvider.Ollama: {
      const baseURL = payload?.baseURL || process.env.OLLAMA_PROXY_URL;

      return { baseURL };
    }

    case ModelProvider.Azure: {
      const { AZURE_API_KEY, AZURE_API_VERSION, AZURE_ENDPOINT } = llmConfig;
      const apiKey = apiKeyManager.pick(payload?.apiKey || AZURE_API_KEY);
      const baseURL = payload?.baseURL || AZURE_ENDPOINT;
      const apiVersion = payload?.azureApiVersion || AZURE_API_VERSION;
      return { apiKey, apiVersion, baseURL };
    }

    case ModelProvider.AzureAI: {
      const { AZUREAI_ENDPOINT, AZUREAI_ENDPOINT_KEY } = llmConfig;
      const apiKey = payload?.apiKey || AZUREAI_ENDPOINT_KEY;
      const baseURL = payload?.baseURL || AZUREAI_ENDPOINT;
      return { apiKey, baseURL };
    }

    case ModelProvider.Bedrock: {
      const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SESSION_TOKEN } = llmConfig;
      let accessKeyId: string | undefined = AWS_ACCESS_KEY_ID;
      let accessKeySecret: string | undefined = AWS_SECRET_ACCESS_KEY;
      let region = AWS_REGION;
      let sessionToken: string | undefined = AWS_SESSION_TOKEN;
      // if the payload has the api key, use user
      if (payload.apiKey) {
        accessKeyId = payload?.awsAccessKeyId;
        accessKeySecret = payload?.awsSecretAccessKey;
        sessionToken = payload?.awsSessionToken;
        region = payload?.awsRegion;
      }
      return { accessKeyId, accessKeySecret, region, sessionToken };
    }

    case ModelProvider.Cloudflare: {
      const { CLOUDFLARE_API_KEY, CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || CLOUDFLARE_API_KEY);
      const baseURLOrAccountID =
        payload.apiKey && payload.cloudflareBaseURLOrAccountID
          ? payload.cloudflareBaseURLOrAccountID
          : CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID;

      return { apiKey, baseURLOrAccountID };
    }

    case ModelProvider.GiteeAI: {
      const { GITEE_AI_API_KEY } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || GITEE_AI_API_KEY);

      return { apiKey };
    }

    case ModelProvider.Github: {
      const { GITHUB_TOKEN } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || GITHUB_TOKEN);

      return { apiKey };
    }

    case ModelProvider.OllamaCloud: {
      const { OLLAMA_CLOUD_API_KEY } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || OLLAMA_CLOUD_API_KEY);

      return { apiKey };
    }

    case ModelProvider.TencentCloud: {
      const { TENCENT_CLOUD_API_KEY } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || TENCENT_CLOUD_API_KEY);

      return { apiKey };
    }
  }
};

/**
 * Initializes the agent runtime with the user payload in backend
 * @param provider - The provider name.
 * @param payload - The JWT payload.
 * @param params
 * @returns A promise that resolves when the agent runtime is initialized.
 */
export const initModelRuntimeWithUserPayload = (
  provider: string,
  payload: ClientSecretPayload,
  params: any = {},
) => {
  return ModelRuntime.initializeWithProvider(provider, {
    ...getParamsFromPayload(provider, payload),
    ...params,
  });
};
