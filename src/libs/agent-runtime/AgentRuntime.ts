import { ClientOptions } from 'openai';

import type { TracePayload } from '@/const/trace';

import { LobeRuntimeAI } from './BaseAI';
import { LobeAnthropicAI } from './anthropic';
import { LobeAzureOpenAI } from './azureOpenai';
import { LobeBedrockAI, LobeBedrockAIParams } from './bedrock';
import { LobeDeepSeekAI } from './deepseek';
import { LobeGoogleAI } from './google';
import { LobeGroq } from './groq';
import { LobeMinimaxAI } from './minimax';
import { LobeMistralAI } from './mistral';
import { LobeMoonshotAI } from './moonshot';
import { LobeOllamaAI } from './ollama';
import { LobeOpenAI } from './openai';
import { LobeOpenRouterAI } from './openrouter';
import { LobePerplexityAI } from './perplexity';
import { LobeQwenAI } from './qwen';
import { LobeStepfunAI } from './stepfun';
import { LobeTogetherAI } from './togetherai';
import {
  ChatCompetitionOptions,
  ChatStreamPayload,
  ModelProvider,
  TextToImagePayload,
} from './types';
import { LobeZeroOneAI } from './zeroone';
import { LobeZhipuAI } from './zhipu';

export interface AgentChatOptions {
  enableTrace?: boolean;
  provider: string;
  trace?: TracePayload;
}

class AgentRuntime {
  private _runtime: LobeRuntimeAI;

  constructor(runtime: LobeRuntimeAI) {
    this._runtime = runtime;
  }

  /**
   * Initiates a chat session with the agent.
   *
   * @param payload - The payload containing the chat stream data.
   * @param options - Optional chat competition options.
   * @returns A Promise that resolves to the chat response.
   *
   * @example - Use without trace
   * ```ts
   * const agentRuntime = await initializeWithClientStore(provider, payload);
   * const data = payload as ChatStreamPayload;
   * return await agentRuntime.chat(data);
   * ```
   *
   * @example - Use Langfuse trace
   * ```ts
   * // ============  1. init chat model   ============ //
   * const agentRuntime = await initAgentRuntimeWithUserPayload(provider, jwtPayload);
   * // ============  2. create chat completion   ============ //
   * const data = {
   * // your trace options here
   *  } as ChatStreamPayload;
   * const tracePayload = getTracePayload(req);
   * return await agentRuntime.chat(data, createTraceOptions(data, {
   *   provider,
   *   trace: tracePayload,
   * }));
   * ```
   */
  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    return this._runtime.chat(payload, options);
  }
  async textToImage(payload: TextToImagePayload) {
    return this._runtime.textToImage?.(payload);
  }

  async models() {
    return this._runtime.models?.();
  }

  /**
   * @description Initialize the runtime with the provider and the options
   * @param provider choose a model provider
   * @param params options of the choosed provider
   * @returns the runtime instance
   * Try to initialize the runtime with the provider and the options.
   * @example
   * ```ts
   * const runtime = await AgentRuntime.initializeWithProviderOptions(provider, {
   *    [provider]: {...options},
   * })
   * ```
   * **Note**: If you try to get a AgentRuntime instance from client or server,
   * you should use the methods to get the runtime instance at first.
   * - `src/app/api/chat/agentRuntime.ts: initAgentRuntimeWithUserPayload` on server
   * - `src/services/chat.ts: initializeWithClientStore` on client
   */
  static async initializeWithProviderOptions(
    provider: string,
    params: Partial<{
      anthropic: Partial<ClientOptions>;
      azure: { apiVersion?: string; apikey?: string; endpoint?: string };
      bedrock: Partial<LobeBedrockAIParams>;
      deepseek: Partial<ClientOptions>;
      google: { apiKey?: string; baseURL?: string };
      groq: Partial<ClientOptions>;
      minimax: Partial<ClientOptions>;
      mistral: Partial<ClientOptions>;
      moonshot: Partial<ClientOptions>;
      ollama: Partial<ClientOptions>;
      openai: Partial<ClientOptions>;
      openrouter: Partial<ClientOptions>;
      perplexity: Partial<ClientOptions>;
      qwen: Partial<ClientOptions>;
      stepfun: Partial<ClientOptions>;
      togetherai: Partial<ClientOptions>;
      zeroone: Partial<ClientOptions>;
      zhipu: Partial<ClientOptions>;
    }>,
  ) {
    let runtimeModel: LobeRuntimeAI;

    switch (provider) {
      default:
      case ModelProvider.OpenAI: {
        // Will use the openai as default provider
        runtimeModel = new LobeOpenAI(params.openai ?? (params as any)[provider]);
        break;
      }

      case ModelProvider.Azure: {
        runtimeModel = new LobeAzureOpenAI(
          params.azure?.endpoint,
          params.azure?.apikey,
          params.azure?.apiVersion,
        );
        break;
      }

      case ModelProvider.ZhiPu: {
        runtimeModel = await LobeZhipuAI.fromAPIKey(params.zhipu ?? {});
        break;
      }

      case ModelProvider.Google: {
        runtimeModel = new LobeGoogleAI(params.google ?? {});
        break;
      }

      case ModelProvider.Moonshot: {
        runtimeModel = new LobeMoonshotAI(params.moonshot ?? {});
        break;
      }

      case ModelProvider.Bedrock: {
        runtimeModel = new LobeBedrockAI(params.bedrock ?? {});
        break;
      }

      case ModelProvider.Ollama: {
        runtimeModel = new LobeOllamaAI(params.ollama ?? {});
        break;
      }

      case ModelProvider.Perplexity: {
        runtimeModel = new LobePerplexityAI(params.perplexity ?? {});
        break;
      }

      case ModelProvider.Anthropic: {
        runtimeModel = new LobeAnthropicAI(params.anthropic ?? {});
        break;
      }

      case ModelProvider.DeepSeek: {
        runtimeModel = new LobeDeepSeekAI(params.deepseek ?? {});
        break;
      }

      case ModelProvider.Minimax: {
        runtimeModel = new LobeMinimaxAI(params.minimax ?? {});
        break;
      }

      case ModelProvider.Mistral: {
        runtimeModel = new LobeMistralAI(params.mistral ?? {});
        break;
      }

      case ModelProvider.Groq: {
        runtimeModel = new LobeGroq(params.groq ?? {});
        break;
      }

      case ModelProvider.OpenRouter: {
        runtimeModel = new LobeOpenRouterAI(params.openrouter ?? {});
        break;
      }

      case ModelProvider.TogetherAI: {
        runtimeModel = new LobeTogetherAI(params.togetherai ?? {});
        break;
      }

      case ModelProvider.ZeroOne: {
        runtimeModel = new LobeZeroOneAI(params.zeroone ?? {});
        break;
      }

      case ModelProvider.Qwen: {
        runtimeModel = new LobeQwenAI(params.qwen ?? {});
        break;
      }

      case ModelProvider.Stepfun: {
        runtimeModel = new LobeStepfunAI(params.stepfun ?? {});
        break;
      }
    }

    return new AgentRuntime(runtimeModel);
  }
}

export default AgentRuntime;
