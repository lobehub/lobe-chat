import Anthropic, { ClientOptions } from '@anthropic-ai/sdk';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  type ChatCompletionErrorPayload,
  ChatMethodOptions,
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
import { processModelList, MODEL_LIST_CONFIGS } from '../utils/modelParse';

export interface AnthropicModelCard {
  created_at: string;
  display_name: string;
  id: string;
}

type anthropicTools = Anthropic.Tool | Anthropic.WebSearchTool20250305;

const modelsWithSmallContextWindow = new Set(['claude-3-opus-20240229', 'claude-3-haiku-20240307']);

// Opus 4.1 models that don't allow both temperature and top_p parameters
const opus41Models = new Set(['claude-opus-4-1', 'claude-opus-4-1-20250805']);

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

  constructor({
    apiKey,
    baseURL = DEFAULT_BASE_URL,
    id,
    defaultHeaders,
    ...res
  }: AnthropicAIParams = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    const betaHeaders = process.env.ANTHROPIC_BETA_HEADERS;

    this.client = new Anthropic({
      apiKey,
      baseURL,
      defaultHeaders: { ...defaultHeaders, 'anthropic-beta': betaHeaders },
      ...res,
    });
    this.baseURL = this.client.baseURL;
    this.apiKey = apiKey;
    this.id = id || ModelProvider.Anthropic;
  }

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
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
      enabledSearch,
    } = payload;

    const { default: anthropicModels } = await import('@/config/aiModels/anthropic');
    const modelConfig = anthropicModels.find((m) => m.id === model);
    const defaultMaxOutput = modelConfig?.maxOutput;

    // 配置优先级：用户设置 > 模型配置 > 硬编码默认值
    const getMaxTokens = () => {
      if (max_tokens) return max_tokens;
      if (defaultMaxOutput) return defaultMaxOutput;
      return undefined;
    };

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

    let postTools: anthropicTools[] | undefined = buildAnthropicTools(tools, {
      enabledContextCaching,
    });

    if (enabledSearch) {
      // Limit the number of searches per request
      const maxUses = process.env.ANTHROPIC_MAX_USES;

      const webSearchTool: Anthropic.WebSearchTool20250305 = {
        name: 'web_search',
        type: 'web_search_20250305',
        ...(maxUses &&
          Number.isInteger(Number(maxUses)) &&
          Number(maxUses) > 0 && {
            max_uses: Number(maxUses),
          }),
      };

      // 如果已有工具，则添加到现有工具列表中；否则创建新的工具列表
      if (postTools && postTools.length > 0) {
        postTools = [...postTools, webSearchTool];
      } else {
        postTools = [webSearchTool];
      }
    }

    if (!!thinking && thinking.type === 'enabled') {
      const maxTokens = getMaxTokens() || 32_000; // Claude Opus 4 has minimum maxOutput

      // `temperature` may only be set to 1 when thinking is enabled.
      // `top_p` must be unset when thinking is enabled.
      return {
        max_tokens: maxTokens,
        messages: postMessages,
        model,
        system: systemPrompts,
        thinking: {
          ...thinking,
          budget_tokens: thinking?.budget_tokens
            ? Math.min(thinking.budget_tokens, maxTokens - 1) // `max_tokens` must be greater than `thinking.budget_tokens`.
            : 1024,
        },
        tools: postTools,
      } satisfies Anthropic.MessageCreateParams;
    }

    // For Opus 4.1 models, we can only set either temperature OR top_p, not both
    const isOpus41Model = opus41Models.has(model);
    const shouldSetTemperature = payload.temperature !== undefined;

    return {
      // claude 3 series model hax max output token of 4096, 3.x series has 8192
      // https://docs.anthropic.com/en/docs/about-claude/models/all-models#:~:text=200K-,Max%20output,-Normal%3A
      max_tokens: getMaxTokens() || (modelsWithSmallContextWindow.has(model) ? 4096 : 8192),
      messages: postMessages,
      model,
      system: systemPrompts,
      // For Opus 4.1 models: prefer temperature over top_p if both are provided
      temperature: isOpus41Model
        ? shouldSetTemperature
          ? temperature / 2
          : undefined
        : payload.temperature !== undefined
          ? temperature / 2
          : undefined,
      tools: postTools,
      // For Opus 4.1 models: only set top_p if temperature is not set
      top_p: isOpus41Model ? (shouldSetTemperature ? undefined : top_p) : top_p,
    } satisfies Anthropic.MessageCreateParams;
  }

  async models() {
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

    const standardModelList = modelList.map((model) => ({
          created: model.created_at,
          displayName: model.display_name,
          id: model.id,
        }));
    return processModelList(standardModelList, MODEL_LIST_CONFIGS.anthropic, 'anthropic');
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
