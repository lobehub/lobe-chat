import { getLLMConfig } from '@/config/llm';
import { ClientSecretPayload } from '@/const/auth';
import { AgentRuntimeErrorType, ModelProvider, ModelRuntime } from '@/libs/model-runtime';
import { AgentRuntimeError } from '@/libs/model-runtime/utils/createError';

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
    case ModelProvider.OpenAI: {
      // Check if OpenAI is enabled
      if (!llmConfig.ENABLED_OPENAI) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const apiKey = apiKeyManager.pick(payload?.apiKey || llmConfig.OPENAI_API_KEY);
      const baseURL = payload?.baseURL || process.env.OPENAI_PROXY_URL;

      return baseURL ? { apiKey, baseURL } : { apiKey };
    }

    default: {
      let upperProvider = provider.toUpperCase();
      
      // Check if the provider is enabled
      const enabledKey = `ENABLED_${upperProvider}`;
      if (enabledKey in llmConfig && !llmConfig[enabledKey]) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }

      if (!(`${upperProvider}_API_KEY` in llmConfig)) {
        upperProvider = ModelProvider.OpenAI.toUpperCase(); // Use OpenAI options as default
      }

      const apiKey = apiKeyManager.pick(payload?.apiKey || llmConfig[`${upperProvider}_API_KEY`]);
      const baseURL = payload?.baseURL || process.env[`${upperProvider}_PROXY_URL`];

      return baseURL ? { apiKey, baseURL } : { apiKey };
    }

    case ModelProvider.Ollama: {
      // Check if Ollama is enabled
      if (!llmConfig.ENABLED_OLLAMA) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const baseURL = payload?.baseURL || process.env.OLLAMA_PROXY_URL;

      return { baseURL };
    }

    case ModelProvider.Azure: {
      // Check if Azure OpenAI is enabled
      if (!llmConfig.ENABLED_AZURE_OPENAI) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const { AZURE_API_KEY, AZURE_API_VERSION, AZURE_ENDPOINT } = llmConfig;
      const apiKey = apiKeyManager.pick(payload?.apiKey || AZURE_API_KEY);
      const baseURL = payload?.baseURL || AZURE_ENDPOINT;
      const apiVersion = payload?.azureApiVersion || AZURE_API_VERSION;
      return { apiKey, apiVersion, baseURL };
    }

    case ModelProvider.AzureAI: {
      // Check if AzureAI is enabled
      if (!llmConfig.ENABLED_AZUREAI) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const { AZUREAI_ENDPOINT, AZUREAI_ENDPOINT_KEY } = llmConfig;
      const apiKey = payload?.apiKey || AZUREAI_ENDPOINT_KEY;
      const baseURL = payload?.baseURL || AZUREAI_ENDPOINT;
      return { apiKey, baseURL };
    }

    case ModelProvider.Bedrock: {
      // Check if AWS Bedrock is enabled
      if (!llmConfig.ENABLED_AWS_BEDROCK) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const { AWS_REGION, AWS_BEARER_TOKEN_BEDROCK } = llmConfig;

      let region = AWS_REGION || 'us-east-1';
      let bearerToken: string | undefined = AWS_BEARER_TOKEN_BEDROCK;

      if (payload.apiKey) {
        bearerToken = payload.apiKey;
        region = payload.awsRegion || region;
      }

      return { region, token: bearerToken };
    }

    case ModelProvider.Cloudflare: {
      // Check if Cloudflare is enabled
      if (!llmConfig.ENABLED_CLOUDFLARE) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const { CLOUDFLARE_API_KEY, CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || CLOUDFLARE_API_KEY);
      const baseURLOrAccountID =
        payload.apiKey && payload.cloudflareBaseURLOrAccountID
          ? payload.cloudflareBaseURLOrAccountID
          : CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID;

      return { apiKey, baseURLOrAccountID };
    }

    case ModelProvider.GiteeAI: {
      // Check if GiteeAI is enabled
      if (!llmConfig.ENABLED_GITEE_AI) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const { GITEE_AI_API_KEY } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || GITEE_AI_API_KEY);

      return { apiKey };
    }

    case ModelProvider.Github: {
      // Check if Github is enabled
      if (!llmConfig.ENABLED_GITHUB) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
      const { GITHUB_TOKEN } = llmConfig;

      const apiKey = apiKeyManager.pick(payload?.apiKey || GITHUB_TOKEN);

      return { apiKey };
    }

    case ModelProvider.TencentCloud: {
      // Check if TencentCloud is enabled
      if (!llmConfig.ENABLED_TENCENT_CLOUD) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderNotEnabled, {
          message: `Provider ${provider} is disabled`,
          provider,
        });
      }
      
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
