import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import OpenAI, { ClientOptions } from 'openai';
import { Stream } from 'openai/streaming';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';
import type { ChatModelCard } from '@/types/llm';

import { LobeRuntimeAI } from '../../BaseAI';
import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../../error';
import type {
  ChatCompetitionOptions,
  ChatCompletionErrorPayload,
  ChatStreamPayload,
  Embeddings,
  EmbeddingsOptions,
  EmbeddingsPayload,
  ModelProvider,
  TextToImagePayload,
  TextToSpeechOptions,
  TextToSpeechPayload,
} from '../../types';
import { ChatStreamCallbacks } from '../../types';
import { AgentRuntimeError } from '../createError';
import { debugResponse, debugStream } from '../debugStream';
import { desensitizeUrl } from '../desensitizeUrl';
import { handleOpenAIError } from '../handleOpenAIError';
import { convertOpenAIMessages } from '../openaiHelpers';
import { StreamingResponse } from '../response';
import { OpenAIStream, OpenAIStreamOptions } from '../streams';

// the model contains the following keywords is not a chat model, so we should filter them out
export const CHAT_MODELS_BLOCK_LIST = [
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

export interface CustomClientOptions<T extends Record<string, any> = any> {
  createChatCompletionStream?: (
    client: any,
    payload: ChatStreamPayload,
    instance: any,
  ) => ReadableStream<any>;
  createClient?: (options: ConstructorOptions<T>) => any;
}

interface OpenAICompatibleFactoryOptions<T extends Record<string, any> = any> {
  apiKey?: string;
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
    handleStream?: (
      stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
      callbacks?: ChatStreamCallbacks,
    ) => ReadableStream;
    handleStreamBizErrorType?: (error: {
      message: string;
      name: string;
    }) => ILobeAgentRuntimeErrorType | undefined;
    handleTransformResponseToStream?: (
      data: OpenAI.ChatCompletion,
    ) => ReadableStream<OpenAI.ChatCompletionChunk>;
    noUserId?: boolean;
  };
  constructorOptions?: ConstructorOptions<T>;
  customClient?: CustomClientOptions<T>;
  debug?: {
    chatCompletion: () => boolean;
  };
  errorType?: {
    bizError: ILobeAgentRuntimeErrorType;
    invalidAPIKey: ILobeAgentRuntimeErrorType;
  };
  models?:
    | ((params: { client: OpenAI }) => Promise<ChatModelCard[]>)
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
  apiKey: DEFAULT_API_LEY,
  errorType,
  debug,
  constructorOptions,
  chatCompletion,
  models,
  customClient,
}: OpenAICompatibleFactoryOptions<T>) => {
  const ErrorType = {
    bizError: errorType?.bizError || AgentRuntimeErrorType.ProviderBizError,
    invalidAPIKey: errorType?.invalidAPIKey || AgentRuntimeErrorType.InvalidProviderAPIKey,
  };

  return class LobeOpenAICompatibleAI implements LobeRuntimeAI {
    client!: OpenAI;

    baseURL!: string;
    protected _options: ConstructorOptions<T>;

    constructor(options: ClientOptions & Record<string, any> = {}) {
      const _options = {
        ...options,
        apiKey: options.apiKey?.trim() || DEFAULT_API_LEY,
        baseURL: options.baseURL?.trim() || DEFAULT_BASE_URL,
      };
      const { apiKey, baseURL = DEFAULT_BASE_URL, ...res } = _options;
      this._options = _options as ConstructorOptions<T>;

      if (!apiKey) throw AgentRuntimeError.createError(ErrorType?.invalidAPIKey);

      const initOptions = { apiKey, baseURL, ...constructorOptions, ...res };

      // if the custom client is provided, use it as client
      if (customClient?.createClient) {
        this.client = customClient.createClient(initOptions as any);
      } else {
        this.client = new OpenAI(initOptions);
      }

      this.baseURL = baseURL || this.client.baseURL;
    }

    async chat({ responseMode, ...payload }: ChatStreamPayload, options?: ChatCompetitionOptions) {
      try {
        const postPayload = chatCompletion?.handlePayload
          ? chatCompletion.handlePayload(payload, this._options)
          : ({
              ...payload,
              stream: payload.stream ?? true,
            } as OpenAI.ChatCompletionCreateParamsStreaming);

        const messages = await convertOpenAIMessages(postPayload.messages);

        let response: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;

        const streamOptions: OpenAIStreamOptions = {
          bizErrorTypeTransformer: chatCompletion?.handleStreamBizErrorType,
          callbacks: options?.callback,
          provider,
        };
        if (customClient?.createChatCompletionStream) {
          response = customClient.createChatCompletionStream(this.client, payload, this) as any;
        } else {
          response = await this.client.chat.completions.create(
            {
              ...postPayload,
              messages,
              ...(chatCompletion?.noUserId ? {} : { user: options?.user }),
            },
            {
              // https://github.com/lobehub/lobe-chat/pull/318
              headers: { Accept: '*/*', ...options?.requestHeaders },
              signal: options?.signal,
            },
          );
        }

        if (postPayload.stream) {
          const [prod, useForDebug] = response.tee();

          if (debug?.chatCompletion?.()) {
            const useForDebugStream =
              useForDebug instanceof ReadableStream ? useForDebug : useForDebug.toReadableStream();

            debugStream(useForDebugStream).catch(console.error);
          }

          const streamHandler = chatCompletion?.handleStream || OpenAIStream;
          return StreamingResponse(streamHandler(prod, streamOptions), {
            headers: options?.headers,
          });
        }

        if (debug?.chatCompletion?.()) {
          debugResponse(response);
        }

        if (responseMode === 'json') return Response.json(response);

        const transformHandler =
          chatCompletion?.handleTransformResponseToStream || transformResponseToStream;
        const stream = transformHandler(response as unknown as OpenAI.ChatCompletion);

        const streamHandler = chatCompletion?.handleStream || OpenAIStream;
        return StreamingResponse(streamHandler(stream, streamOptions), {
          headers: options?.headers,
        });
      } catch (error) {
        throw this.handleError(error);
      }
    }

    async models() {
      if (typeof models === 'function') return models({ client: this.client });

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

          if (knownModel) {
            dayjs.extend(utc);

            return {
              ...knownModel,
              releasedAt:
                knownModel.releasedAt ?? dayjs.utc(item.created * 1000).format('YYYY-MM-DD'),
            };
          }

          return { id: item.id };
        })

        .filter(Boolean) as ChatModelCard[];
    }

    async embeddings(
      payload: EmbeddingsPayload,
      options?: EmbeddingsOptions,
    ): Promise<Embeddings[]> {
      try {
        const res = await this.client.embeddings.create(
          { ...payload, user: options?.user },
          { headers: options?.headers, signal: options?.signal },
        );

        return res.data.map((item) => item.embedding);
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

    async textToSpeech(payload: TextToSpeechPayload, options?: TextToSpeechOptions) {
      try {
        const mp3 = await this.client.audio.speech.create(payload as any, {
          headers: options?.headers,
          signal: options?.signal,
        });

        return mp3.arrayBuffer();
      } catch (error) {
        throw this.handleError(error);
      }
    }

    protected handleError(error: any): ChatCompletionErrorPayload {
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
              provider: provider as ModelProvider,
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
        provider: provider as ModelProvider,
      });
    }
  };
};
