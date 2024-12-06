import { getLLMConfig } from '@/config/llm';
import { JWTPayload } from '@/const/auth';
import { INBOX_SESSION_ID } from '@/const/session';
import {
  LOBE_CHAT_OBSERVATION_ID,
  LOBE_CHAT_TRACE_ID,
  TracePayload,
  TraceTagMap,
} from '@/const/trace';
import { AgentRuntime, ChatStreamPayload, ModelProvider } from '@/libs/agent-runtime';
import { TraceClient } from '@/libs/traces';

import apiKeyManager from './apiKeyManager';

export interface AgentChatOptions {
  enableTrace?: boolean;
  provider: string;
  trace?: TracePayload;
}

/**
 * Retrieves the options object from environment and apikeymanager
 * based on the provider and payload.
 *
 * @param provider - The model provider.
 * @param payload - The JWT payload.
 * @returns The options object.
 */
const getLlmOptionsFromPayload = (provider: string, payload: JWTPayload) => {
  const llmConfig = getLLMConfig() as Record<string, any>;

  switch (provider) {
    default: {
      let upperProvider = provider.toUpperCase();

      if (!(`${upperProvider}_API_KEY` in llmConfig)) {
        upperProvider = ModelProvider.OpenAI.toUpperCase(); // Use OpenAI options as default
      }

      const apiKey = apiKeyManager.pick(payload?.apiKey || llmConfig[`${upperProvider}_API_KEY`]);
      const baseURL = payload?.endpoint || process.env[`${upperProvider}_PROXY_URL`];

      return baseURL ? { apiKey, baseURL } : { apiKey };
    }

    case ModelProvider.Ollama: {
      const baseURL = payload?.endpoint || process.env.OLLAMA_PROXY_URL;

      return { baseURL };
    }

    case ModelProvider.Azure: {
      const { AZURE_API_KEY, AZURE_API_VERSION, AZURE_ENDPOINT } = llmConfig;
      const apikey = apiKeyManager.pick(payload?.apiKey || AZURE_API_KEY);
      const endpoint = payload?.endpoint || AZURE_ENDPOINT;
      const apiVersion = payload?.azureApiVersion || AZURE_API_VERSION;
      return { apiVersion, apikey, endpoint };
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

    case ModelProvider.SenseNova: {
      const { SENSENOVA_ACCESS_KEY_ID, SENSENOVA_ACCESS_KEY_SECRET } = llmConfig;

      const sensenovaAccessKeyID = apiKeyManager.pick(
        payload?.sensenovaAccessKeyID || SENSENOVA_ACCESS_KEY_ID,
      );
      const sensenovaAccessKeySecret = apiKeyManager.pick(
        payload?.sensenovaAccessKeySecret || SENSENOVA_ACCESS_KEY_SECRET,
      );

      const apiKey = sensenovaAccessKeyID + ':' + sensenovaAccessKeySecret;

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
export const initAgentRuntimeWithUserPayload = (
  provider: string,
  payload: JWTPayload,
  params: any = {},
) => {
  return AgentRuntime.initializeWithProviderOptions(provider, {
    [provider]: { ...getLlmOptionsFromPayload(provider, payload), ...params },
  });
};

export const createTraceOptions = (
  payload: ChatStreamPayload,
  { trace: tracePayload, provider }: AgentChatOptions,
) => {
  const { messages, model, tools, ...parameters } = payload;
  // create a trace to monitor the completion
  const traceClient = new TraceClient();
  const trace = traceClient.createTrace({
    id: tracePayload?.traceId,
    input: messages,
    metadata: { provider },
    name: tracePayload?.traceName,
    sessionId: `${tracePayload?.sessionId || INBOX_SESSION_ID}@${tracePayload?.topicId || 'start'}`,
    tags: tracePayload?.tags,
    userId: tracePayload?.userId,
  });

  const generation = trace?.generation({
    input: messages,
    metadata: { provider },
    model,
    modelParameters: parameters as any,
    name: `Chat Completion (${provider})`,
    startTime: new Date(),
  });

  return {
    callback: {
      experimental_onToolCall: async () => {
        trace?.update({
          tags: [...(tracePayload?.tags || []), TraceTagMap.ToolsCall],
        });
      },

      onCompletion: async (completion: string) => {
        generation?.update({
          endTime: new Date(),
          metadata: { provider, tools },
          output: completion,
        });

        trace?.update({ output: completion });
      },

      onFinal: async () => {
        await traceClient.shutdownAsync();
      },

      onStart: () => {
        generation?.update({ completionStartTime: new Date() });
      },
    },
    headers: {
      [LOBE_CHAT_OBSERVATION_ID]: generation?.id,
      [LOBE_CHAT_TRACE_ID]: trace?.id,
    },
  };
};
