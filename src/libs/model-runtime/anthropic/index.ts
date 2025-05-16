import Anthropic, { ClientOptions } from '@anthropic-ai/sdk';

import type { ChatModelCard } from '@/types/llm';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  type ChatCompletionErrorPayload,
  ChatStreamPayload,
  ModelProvider,
} from '../types';
import { buildAnthropicMessages, buildAnthropicTools } from '../utils/anthropicHelpers';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { StreamingResponse } from '../utils/response';
import { AnthropicStream } from '../utils/streams';
import { handleAnthropicError } from './handleAnthropicError';

export interface AnthropicModelCard {
  display_name: string;
  id: string;
}

const modelsWithSmallContextWindow = new Set(['claude-3-opus-20240229', 'claude-3-haiku-20240307']);

const DEFAULT_BASE_URL = 'https://api.anthropic.com';

interface AnthropicAIParams extends ClientOptions {
  id?: string;
}

export class LobeAnthropicAI implements LobeRuntimeAI {
  private client: Anthropic;

  baseURL: string;
  apiKey?: string;
  private id: string;

  private isDebug() {
    return process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION === '1';
  }

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL, id, ...res }: AnthropicAIParams = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new Anthropic({ apiKey, baseURL, ...res });
    this.baseURL = this.client.baseURL;
    this.apiKey = apiKey;
    this.id = id || ModelProvider.Anthropic;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const anthropicPayload = await this.buildAnthropicPayload(payload);
      const inputStartAt = Date.now();

      if (this.isDebug()) {
        console.log('[requestPayload]');
        console.log(JSON.stringify(anthropicPayload), '\n');
      }

      const response = await this.client.messages.create(
        {
          ...anthropicPayload,
          metadata: options?.user ? { user_id: options?.user } : undefined,
          stream: true,
        },
        {
          signal: options?.signal,
        },
      );

      const [prod, debug] = response.tee();

      if (this.isDebug()) {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return StreamingResponse(
        AnthropicStream(prod, { callbacks: options?.callback, inputStartAt }),
        {
          headers: options?.headers,
        },
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async buildAnthropicPayload(payload: ChatStreamPayload) {
    const {
      messages,
      model,
      max_tokens,
      temperature,
      top_p,
      tools,
      thinking,
      enabledContextCaching = true,
    } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    const systemPrompts = !!system_message?.content
      ? ([
          {
            cache_control: enabledContextCaching ? { type: 'ephemeral' } : undefined,
            text: system_message?.content as string,
            type: 'text',
          },
        ] as Anthropic.TextBlockParam[])
      : undefined;

    const postMessages = await buildAnthropicMessages(user_messages, { enabledContextCaching });

    const postTools = buildAnthropicTools(tools, { enabledContextCaching });

    if (!!thinking && thinking.type === 'enabled') {
      // claude 3.7 thinking has max output of 64000 tokens
      const maxTokens = !!max_tokens
        ? thinking?.budget_tokens && thinking?.budget_tokens > max_tokens
          ? Math.min(thinking?.budget_tokens + max_tokens, 64_000)
          : max_tokens
        : 64_000;

      // `temperature` may only be set to 1 when thinking is enabled.
      // `top_p` must be unset when thinking is enabled.
      return {
        max_tokens: maxTokens,
        messages: postMessages,
        model,
        system: systemPrompts,
        thinking,
        tools: postTools,
      } satisfies Anthropic.MessageCreateParams;
    }

    return {
      // claude 3 series model hax max output token of 4096, 3.x series has 8192
      // https://docs.anthropic.com/en/docs/about-claude/models/all-models#:~:text=200K-,Max%20output,-Normal%3A
      max_tokens: max_tokens ?? (modelsWithSmallContextWindow.has(model) ? 4096 : 8192),
      messages: postMessages,
      model,
      system: systemPrompts,
      temperature: payload.temperature !== undefined ? temperature / 2 : undefined,
      tools: postTools,
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
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: model.display_name,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.id.toLowerCase().includes('claude-3') ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          reasoning: knownModel?.abilities?.reasoning || false,
          vision:
            (model.id.toLowerCase().includes('claude-3') &&
              !model.id.toLowerCase().includes('claude-3-5-haiku')) ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  }

  private handleError(error: any): ChatCompletionErrorPayload {
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
            provider: this.id,
          });
        }

        case 403: {
          throw AgentRuntimeError.chat({
            endpoint: desensitizedEndpoint,
            error: error as any,
            errorType: AgentRuntimeErrorType.LocationNotSupportError,
            provider: this.id,
          });
        }
        default: {
          break;
        }
      }
    }

    const { errorResult } = handleAnthropicError(error);

    throw AgentRuntimeError.chat({
      endpoint: desensitizedEndpoint,
      error: errorResult,
      errorType: AgentRuntimeErrorType.ProviderBizError,
      provider: this.id,
    });
  }
}

export default LobeAnthropicAI;
