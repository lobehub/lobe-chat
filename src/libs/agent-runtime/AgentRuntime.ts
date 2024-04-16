import { ClientOptions } from 'openai';

import { INBOX_SESSION_ID } from '@/const/session';
import {
  LOBE_CHAT_OBSERVATION_ID,
  LOBE_CHAT_TRACE_ID,
  TracePayload,
  TraceTagMap,
} from '@/const/trace';
import {
  ChatStreamPayload,
  LobeAnthropicAI,
  LobeAzureOpenAI,
  LobeBedrockAI,
  LobeGoogleAI,
  LobeGroq,
  LobeMistralAI,
  LobeMoonshotAI,
  LobeOllamaAI,
  LobeOpenAI,
  LobeOpenRouterAI,
  LobePerplexityAI,
  LobeRuntimeAI,
  LobeTogetherAI,
  LobeZeroOneAI,
  LobeZhipuAI,
  ModelProvider,
} from '@/libs/agent-runtime';
import { LobeBedrockAIParams } from '@/libs/agent-runtime/bedrock';
import { TraceClient } from '@/libs/traces';

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

  async chat(
    payload: ChatStreamPayload,
    { trace: tracePayload, provider, enableTrace }: AgentChatOptions,
  ) {
    const { messages, model, tools, ...parameters } = payload;

    // if not enabled trace then just call the runtime
    if (!enableTrace) return this._runtime.chat(payload);

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

    return this._runtime.chat(payload, {
      callback: {
        experimental_onToolCall: async () => {
          trace?.update({
            tags: [...(tracePayload?.tags || []), TraceTagMap.ToolsCall],
          });
        },

        onCompletion: async (completion) => {
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
    });
  }

  async models() {
    return this._runtime.models?.();
  }

  /**
   * @description Initialize the runtime with the provider and the options
   * @param provider choose a model provider
   * @param params options of the choosed provider
   *
   * ```ts
   * const runtime = await AgentRuntime.initializeWithProviderOptions(provider, {
   *    [provider]: {...options},
   * })
   * ```
   */
  static async initializeWithProviderOptions(
    provider: string,
    params: Partial<{
      anthropic: Partial<ClientOptions>;
      azure: { apiVersion?: string; apikey?: string; endpoint?: string };
      bedrock: Partial<LobeBedrockAIParams>;
      google: { apiKey?: string; baseURL?: string };
      groq: Partial<ClientOptions>;
      mistral: Partial<ClientOptions>;
      moonshot: Partial<ClientOptions>;
      ollama: Partial<ClientOptions>;
      openai: Partial<ClientOptions>;
      openrouter: Partial<ClientOptions>;
      perplexity: Partial<ClientOptions>;
      togetherai: Partial<ClientOptions>;
      zeroone: Partial<ClientOptions>;
      zhipu: Partial<ClientOptions>;
    }>,
  ) {
    let runtimeModel: LobeRuntimeAI;

    switch (provider) {
      default:
      case ModelProvider.OpenAI: {
        runtimeModel = new LobeOpenAI(params.openai ?? {});
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
    }

    return new AgentRuntime(runtimeModel);
  }
}

export default AgentRuntime;
