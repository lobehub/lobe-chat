// sort-imports-ignore
import '@anthropic-ai/sdk/shims/web';
import Anthropic from '@anthropic-ai/sdk';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { buildAnthropicMessages, buildAnthropicTools } from '../utils/anthropicHelpers';
import { StreamingResponse } from '../utils/response';
import { AnthropicStream } from '../utils/streams';

import type { ChatModelCard } from '@/types/llm';

export interface AnthropicModelCard {
  display_name: string;
  id: string;
}

const DEFAULT_BASE_URL = 'https://api.anthropic.com';

export class LobeAnthropicAI implements LobeRuntimeAI {
  private client: Anthropic;

  baseURL: string;
  apiKey?: string;

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL, ...res }: ClientOptions = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new Anthropic({ apiKey, baseURL, ...res });
    this.baseURL = this.client.baseURL;
    this.apiKey = apiKey;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const anthropicPayload = await this.buildAnthropicPayload(payload);

      const response = await this.client.messages.create(
        { ...anthropicPayload, stream: true },
        {
          signal: options?.signal,
        },
      );

      const [prod, debug] = response.tee();

      if (process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION === '1') {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return StreamingResponse(AnthropicStream(prod, options?.callback), {
        headers: options?.headers,
      });
    } catch (error) {
      let desensitizedEndpoint = this.baseURL;

      if (this.baseURL !== DEFAULT_BASE_URL) {
        desensitizedEndpoint = desensitizeUrl(this.baseURL);
      }

      if ('status' in (error as any)) {
        switch ((error as Response).status) {
          case 401: {
            throw AgentRuntimeError.chat({
              endpoint: desensitizedEndpoint,
              error: error as any,
              errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
              provider: ModelProvider.Anthropic,
            });
          }

          case 403: {
            throw AgentRuntimeError.chat({
              endpoint: desensitizedEndpoint,
              error: error as any,
              errorType: AgentRuntimeErrorType.LocationNotSupportError,
              provider: ModelProvider.Anthropic,
            });
          }
          default: {
            break;
          }
        }
      }
      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: error as any,
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Anthropic,
      });
    }
  }

  private async buildAnthropicPayload(payload: ChatStreamPayload) {
    const { messages, model, max_tokens = 4096, temperature, top_p, tools } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    return {
      max_tokens,
      messages: await buildAnthropicMessages(user_messages),
      model,
      system: system_message?.content as string,
      temperature: payload.temperature !== undefined ? temperature / 2 : undefined,
      tools: buildAnthropicTools(tools),
      top_p,
    } satisfies Anthropic.MessageCreateParams;
  }

  async models() {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const url = `${this.baseURL}/v1/models`;
    const response = await fetch(url, {
      headers: {
        'anthropic-version': '2023-06-01',
        'x-api-key': `${this.apiKey}`,
      },
      method: 'GET',
    });
    const json = await response.json();
  
    const modelList: AnthropicModelCard[] = json['data'];
  
    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: model.display_name,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.id.toLowerCase().includes('claude-3')
            || knownModel?.abilities?.functionCall
            || false,
          id: model.id,
          reasoning:
            knownModel?.abilities?.reasoning
            || false,
          vision:
            model.id.toLowerCase().includes('claude-3') && !model.id.toLowerCase().includes('claude-3-5-haiku')
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  }
}

export default LobeAnthropicAI;
