import { JWTPayload, LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors, settingsSelectors } from '@/store/global/selectors';
import { createJWT } from '@/utils/jwt';

export const getProviderAuthPayload = (provider: string) => {
  switch (provider) {
    case ModelProvider.ZhiPu: {
      return { apiKey: modelProviderSelectors.zhipuAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Moonshot: {
      return { apiKey: modelProviderSelectors.moonshotAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Google: {
      return { apiKey: modelProviderSelectors.googleAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Bedrock: {
      const { accessKeyId, region, secretAccessKey } = modelProviderSelectors.bedrockConfig(
        useGlobalStore.getState(),
      );
      const awsSecretAccessKey = secretAccessKey;
      const awsAccessKeyId = accessKeyId;

      const apiKey = (awsSecretAccessKey || '') + (awsAccessKeyId || '');

      return { apiKey, awsAccessKeyId, awsRegion: region, awsSecretAccessKey };
    }

    case ModelProvider.Azure: {
      const azure = modelProviderSelectors.azureConfig(useGlobalStore.getState());

      return {
        apiKey: azure.apiKey,
        azureApiVersion: azure.apiVersion,
        endpoint: azure.endpoint,
      };
    }

    case ModelProvider.Ollama: {
      const endpoint = modelProviderSelectors.ollamaProxyUrl(useGlobalStore.getState());

      return {
        endpoint,
      };
    }

    case ModelProvider.Perplexity: {
      return { apiKey: modelProviderSelectors.perplexityAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Anthropic: {
      const apiKey = modelProviderSelectors.anthropicAPIKey(useGlobalStore.getState());
      const endpoint = modelProviderSelectors.anthropicProxyUrl(useGlobalStore.getState());
      return { apiKey, endpoint };
    }

    case ModelProvider.Mistral: {
      return { apiKey: modelProviderSelectors.mistralAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Groq: {
      return { apiKey: modelProviderSelectors.groqAPIKey(useGlobalStore.getState()) };
    }

    default:
    case ModelProvider.OpenAI: {
      const openai = modelProviderSelectors.openAIConfig(useGlobalStore.getState());
      const apiKey = openai.OPENAI_API_KEY || '';
      const endpoint = openai.endpoint || '';

      return {
        apiKey,
        azureApiVersion: openai.azureApiVersion,
        endpoint,
        useAzure: openai.useAzure,
      };
    }
  }
};

const createAuthTokenWithPayload = async (payload = {}) => {
  const accessCode = settingsSelectors.password(useGlobalStore.getState());

  return await createJWT<JWTPayload>({ accessCode, ...payload });
};

interface AuthParams {
  // eslint-disable-next-line no-undef
  headers?: HeadersInit;
  payload?: Record<string, any>;
  provider?: string;
}

// eslint-disable-next-line no-undef
export const createHeaderWithAuth = async (params?: AuthParams): Promise<HeadersInit> => {
  let payload = params?.payload || {};

  if (params?.provider) {
    payload = { ...payload, ...getProviderAuthPayload(params?.provider) };
  }

  const token = await createAuthTokenWithPayload(payload);

  // eslint-disable-next-line no-undef
  return { ...params?.headers, [LOBE_CHAT_AUTH_HEADER]: token };
};
