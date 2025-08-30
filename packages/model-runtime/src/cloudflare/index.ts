import { ChatModelCard } from '@/types/llm';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatMethodOptions, ChatStreamPayload, ModelProvider } from '../types';
import {
  CloudflareStreamTransformer,
  DEFAULT_BASE_URL_PREFIX,
  desensitizeCloudflareUrl,
  fillUrl,
} from '../utils/cloudflareHelpers';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { createCallbacksTransformer } from '../utils/streams';

export interface CloudflareModelCard {
  description: string;
  name: string;
  properties?: Record<string, string>;
  task?: {
    description?: string;
    name: string;
  };
}

export interface LobeCloudflareParams {
  apiKey?: string;
  baseURLOrAccountID?: string;
}

export class LobeCloudflareAI implements LobeRuntimeAI {
  baseURL: string;
  accountID: string;
  apiKey?: string;

  constructor({ apiKey, baseURLOrAccountID }: LobeCloudflareParams = {}) {
    if (!baseURLOrAccountID) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);
    }
    if (baseURLOrAccountID.startsWith('http')) {
      this.baseURL = baseURLOrAccountID.endsWith('/')
        ? baseURLOrAccountID
        : baseURLOrAccountID + '/';
      // Try get accountID from baseURL
      this.accountID = baseURLOrAccountID.replaceAll(/^.*\/([\dA-Fa-f]{32})\/.*$/g, '$1');
    } else {
      if (!apiKey) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);
      }
      this.accountID = baseURLOrAccountID;
      this.baseURL = fillUrl(baseURLOrAccountID);
    }
    this.apiKey = apiKey;
  }

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions): Promise<Response> {
    try {
      const { model, tools, ...restPayload } = payload;
      const functions = tools?.map((tool) => tool.function);
      const headers = options?.headers || {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      const url = new URL(model, this.baseURL);
      const response = await fetch(url, {
        body: JSON.stringify({ tools: functions, ...restPayload }),
        headers: { 'Content-Type': 'application/json', ...headers },
        method: 'POST',
        signal: options?.signal,
      });

      const desensitizedEndpoint = desensitizeCloudflareUrl(url.toString());

      switch (response.status) {
        case 400: {
          throw AgentRuntimeError.chat({
            endpoint: desensitizedEndpoint,
            error: response,
            errorType: AgentRuntimeErrorType.ProviderBizError,
            provider: ModelProvider.Cloudflare,
          });
        }
      }

      // Only tee when debugging
      let responseBody: ReadableStream;
      if (process.env.DEBUG_CLOUDFLARE_CHAT_COMPLETION === '1') {
        const [prod, useForDebug] = response.body!.tee();
        debugStream(useForDebug).catch();
        responseBody = prod;
      } else {
        responseBody = response.body!;
      }

      return StreamingResponse(
        responseBody
          .pipeThrough(new TransformStream(new CloudflareStreamTransformer()))
          .pipeThrough(createCallbacksTransformer(options?.callback)),
        { headers: options?.headers },
      );
    } catch (error) {
      const desensitizedEndpoint = desensitizeCloudflareUrl(this.baseURL);

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: error as any,
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Cloudflare,
      });
    }
  }

  async models(): Promise<ChatModelCard[]> {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('model-bank');

    const url = `${DEFAULT_BASE_URL_PREFIX}/client/v4/accounts/${this.accountID}/ai/models/search`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const json = await response.json();

    const modelList: CloudflareModelCard[] = json.result;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.name.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: model.properties?.max_total_tokens
            ? Number(model.properties.max_total_tokens)
            : (knownModel?.contextWindowTokens ?? undefined),
          displayName:
            knownModel?.displayName ??
            (model.properties?.['beta'] === 'true' ? `${model.name} (Beta)` : undefined),
          enabled: knownModel?.enabled || false,
          functionCall:
            model.description.toLowerCase().includes('function call') ||
            model.properties?.['function_calling'] === 'true' ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.name,
          reasoning:
            model.name.toLowerCase().includes('deepseek-r1') ||
            knownModel?.abilities?.reasoning ||
            false,
          vision:
            model.name.toLowerCase().includes('vision') ||
            model.task?.name.toLowerCase().includes('image-to-text') ||
            model.description.toLowerCase().includes('vision') ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  }
}
