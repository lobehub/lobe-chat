import OpenAI, { ClientOptions } from 'openai';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';
import { TextToImagePayload } from '@/libs/agent-runtime/types/textToImage';
import { ChatModelCard } from '@/types/llm';

import { LobeRuntimeAI } from '../../BaseAI';
import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../../error';
import {
  ChatCompetitionOptions,
  ChatCompletionErrorPayload,
  ChatStreamPayload,
  EmbeddingItem,
  EmbeddingsOptions,
  EmbeddingsPayload,
} from '../../types';
import { AgentRuntimeError } from '../createError';
import { debugResponse, debugStream } from '../debugStream';
import { desensitizeUrl } from '../desensitizeUrl';
import { handleOpenAIError } from '../handleOpenAIError';
import { StreamingResponse } from '../response';
import { OpenAIStream } from '../streams';

// the model contains the following keywords is not a chat model, so we should filter them out
const CHAT_MODELS_BLOCK_LIST = [
  'embedding',
  'davinci',
  'curie',
  'moderation',
  'ada',
  'babbage',
  'tts',
  'whisper',
  'dall-e',
];

type ConstructorOptions<T extends Record<string, any> = any> = ClientOptions & T;

interface OpenAICompatibleFactoryOptions<T extends Record<string, any> = any> {
  baseURL?: string;
  chatCompletion?: {
    handleError?: (
      error: any,
      options: ConstructorOptions<T>,
    ) => Omit<ChatCompletionErrorPayload, 'provider'> | undefined;
    handlePayload?: (
      payload: ChatStreamPayload,
      options: ConstructorOptions<T>,
    ) => OpenAI.ChatCompletionCreateParamsStreaming;
    noUserId?: boolean;
  };
  constructorOptions?: ConstructorOptions<T>;
  debug?: {
    chatCompletion: () => boolean;
  };
  errorType?: {
    bizError: ILobeAgentRuntimeErrorType;
    invalidAPIKey: ILobeAgentRuntimeErrorType;
  };
  models?:
    | ((params: { apiKey: string }) => Promise<ChatModelCard[]>)
    | {
        transformModel?: (model: OpenAI.Model) => ChatModelCard;
      };
  provider: string;
}

/**
 * make the OpenAI response data as a stream
 */
export function transformResponseToStream(data: OpenAI.ChatCompletion) {
  return new ReadableStream({
    start(controller) {
      const chunk: OpenAI.ChatCompletionChunk = {
        choices: data.choices.map((choice: OpenAI.ChatCompletion.Choice) => ({
          delta: {
            content: choice.message.content,
            role: choice.message.role,
            tool_calls: choice.message.tool_calls?.map(
              (tool, index): OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall => ({
                function: tool.function,
                id: tool.id,
                index,
                type: tool.type,
              }),
            ),
          },
          finish_reason: null,
          index: choice.index,
          logprobs: choice.logprobs,
        })),
        created: data.created,
        id: data.id,
        model: data.model,
        object: 'chat.completion.chunk',
      };

      controller.enqueue(chunk);

      controller.enqueue({
        choices: data.choices.map((choice: OpenAI.ChatCompletion.Choice) => ({
          delta: {
            content: null,
            role: choice.message.role,
          },
          finish_reason: choice.finish_reason,
          index: choice.index,
          logprobs: choice.logprobs,
        })),
        created: data.created,
        id: data.id,
        model: data.model,
        object: 'chat.completion.chunk',
        system_fingerprint: data.system_fingerprint,
      } as OpenAI.ChatCompletionChunk);
      controller.close();
    },
  });
}

export const LobeOpenAICompatibleFactory = <T extends Record<string, any> = any>({
  provider,
  baseURL: DEFAULT_BASE_URL,
  errorType,
  debug,
  constructorOptions,
  chatCompletion,
  models,
}: OpenAICompatibleFactoryOptions<T>) => {
  const ErrorType = {
    bizError: errorType?.bizError || AgentRuntimeErrorType.ProviderBizError,
    invalidAPIKey: errorType?.invalidAPIKey || AgentRuntimeErrorType.InvalidProviderAPIKey,
  };

  return class LobeOpenAICompatibleAI implements LobeRuntimeAI {
    client: OpenAI;

    baseURL: string;
    private _options: ConstructorOptions<T>;

    constructor(options: ClientOptions & Record<string, any> = {}) {
      const _options = { ...options, baseURL: options.baseURL?.trim() || DEFAULT_BASE_URL };
      const { apiKey, baseURL = DEFAULT_BASE_URL, ...res } = _options;
      this._options = _options as ConstructorOptions<T>;

      if (!apiKey) throw AgentRuntimeError.createError(ErrorType?.invalidAPIKey);

      this.client = new OpenAI({ apiKey, baseURL, ...constructorOptions, ...res });
      this.baseURL = this.client.baseURL;
    }

    async chat({ responseMode, ...payload }: ChatStreamPayload, options?: ChatCompetitionOptions) {
      try {
        const postPayload = chatCompletion?.handlePayload
          ? chatCompletion.handlePayload(payload, this._options)
          : ({
              ...payload,
              stream: payload.stream ?? true,
            } as OpenAI.ChatCompletionCreateParamsStreaming);

        const response = await this.client.chat.completions.create(
          {
            ...postPayload,
            ...(chatCompletion?.noUserId ? {} : { user: options?.user }),
          },
          {
            // https://github.com/lobehub/lobe-chat/pull/318
            headers: { Accept: '*/*' },
            signal: options?.signal,
          },
        );

        if (postPayload.stream) {
          const [prod, useForDebug] = response.tee();

          if (debug?.chatCompletion?.()) {
            debugStream(useForDebug.toReadableStream()).catch(console.error);
          }

          return StreamingResponse(OpenAIStream(prod, options?.callback), {
            headers: options?.headers,
          });
        }

        if (debug?.chatCompletion?.()) {
          debugResponse(response);
        }

        if (responseMode === 'json') return Response.json(response);

        const stream = transformResponseToStream(response as unknown as OpenAI.ChatCompletion);

        return StreamingResponse(OpenAIStream(stream, options?.callback), {
          headers: options?.headers,
        });
      } catch (error) {
        throw this.handleError(error);
      }
    }

    async models() {
      if (typeof models === 'function') return models({ apiKey: this.client.apiKey });

      const list = await this.client.models.list();

      return list.data
        .filter((model) => {
          return CHAT_MODELS_BLOCK_LIST.every(
            (keyword) => !model.id.toLowerCase().includes(keyword),
          );
        })
        .map((item) => {
          if (models?.transformModel) {
            return models.transformModel(item);
          }

          const knownModel = LOBE_DEFAULT_MODEL_LIST.find((model) => model.id === item.id);

          if (knownModel) return knownModel;

          return { id: item.id };
        })

        .filter(Boolean) as ChatModelCard[];
    }

    async embeddings(
      payload: EmbeddingsPayload,
      options?: EmbeddingsOptions,
    ): Promise<EmbeddingItem[]> {
      try {
        const res = await this.client.embeddings.create(
          { ...payload, user: options?.user },
          { headers: options?.headers, signal: options?.signal },
        );

        return res.data;
      } catch (error) {
        throw this.handleError(error);
      }
    }

    async textToImage(payload: TextToImagePayload) {
      try {
        const res = await this.client.images.generate(payload);
        return res.data.map((o) => o.url) as string[];
      } catch (error) {
        throw this.handleError(error);
      }
    }

    private handleError(error: any): ChatCompletionErrorPayload {
      let desensitizedEndpoint = this.baseURL;

      // refs: https://github.com/lobehub/lobe-chat/issues/842
      if (this.baseURL !== DEFAULT_BASE_URL) {
        desensitizedEndpoint = desensitizeUrl(this.baseURL);
      }

      if (chatCompletion?.handleError) {
        const errorResult = chatCompletion.handleError(error, this._options);

        if (errorResult)
          return AgentRuntimeError.chat({
            ...errorResult,
            provider,
          } as ChatCompletionErrorPayload);
      }

      if ('status' in (error as any)) {
        switch ((error as Response).status) {
          case 401: {
            return AgentRuntimeError.chat({
              endpoint: desensitizedEndpoint,
              error: error as any,
              errorType: ErrorType.invalidAPIKey,
              provider: provider as any,
            });
          }

          default: {
            break;
          }
        }
      }

      const { errorResult, RuntimeError } = handleOpenAIError(error);

      return AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType: RuntimeError || ErrorType.bizError,
        provider: provider as any,
      });
    }
  };
};
