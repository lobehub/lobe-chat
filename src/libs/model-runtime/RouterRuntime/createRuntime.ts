/**
 * @see https://github.com/lobehub/lobe-chat/discussions/6563
 */
import OpenAI, { ClientOptions } from 'openai';
import { Stream } from 'openai/streaming';

import { ILobeAgentRuntimeErrorType } from '@/libs/model-runtime';
import { CreateImagePayload, CreateImageResponse } from '@/libs/model-runtime/types/image';
import {
  CreateImageOptions,
  CustomClientOptions,
} from '@/libs/model-runtime/utils/openaiCompatibleFactory';
import type { ChatModelCard } from '@/types/llm';

import { LobeRuntimeAI } from '../BaseAI';
import { LobeOpenAI } from '../openai';
import {
  type ChatCompletionErrorPayload,
  ChatMethodOptions,
  ChatStreamCallbacks,
  ChatStreamPayload,
  EmbeddingsOptions,
  EmbeddingsPayload,
  TextToImagePayload,
  TextToSpeechPayload,
} from '../types';
import { baseRuntimeMap } from './baseRuntimeMap';

export interface RuntimeItem {
  id: string;
  models?: string[];
  runtime: LobeRuntimeAI;
}

interface ProviderIniOptions extends Record<string, any> {
  accessKeyId?: string;
  accessKeySecret?: string;
  apiKey?: string;
  apiVersion?: string;
  baseURL?: string;
  baseURLOrAccountID?: string;
  dangerouslyAllowBrowser?: boolean;
  region?: string;
  sessionToken?: string;
}

interface RouterInstance {
  apiType: keyof typeof baseRuntimeMap;
  models?: string[];
  options: ProviderIniOptions;
  runtime?: typeof LobeOpenAI;
}

type ConstructorOptions<T extends Record<string, any> = any> = ClientOptions & T;

interface CreateRouterRuntimeOptions<T extends Record<string, any> = any> {
  apiKey?: string;
  chatCompletion?: {
    excludeUsage?: boolean;
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
      { callbacks, inputStartAt }: { callbacks?: ChatStreamCallbacks; inputStartAt?: number },
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
  createImage?: (
    payload: CreateImagePayload,
    options: CreateImageOptions,
  ) => Promise<CreateImageResponse>;
  customClient?: CustomClientOptions<T>;
  debug?: {
    chatCompletion: () => boolean;
    responses?: () => boolean;
  };
  defaultHeaders?: Record<string, any>;
  errorType?: {
    bizError: ILobeAgentRuntimeErrorType;
    invalidAPIKey: ILobeAgentRuntimeErrorType;
  };
  id: string;
  models?:
    | ((params: { client: OpenAI }) => Promise<ChatModelCard[]>)
    | {
        transformModel?: (model: OpenAI.Model) => ChatModelCard;
      };
  responses?: {
    handlePayload?: (
      payload: ChatStreamPayload,
      options: ConstructorOptions<T>,
    ) => ChatStreamPayload;
  };
  routers: RouterInstance[];
}

export const createRouterRuntime = ({
  id,
  routers,
  apiKey: DEFAULT_API_LEY,
  ...params
}: CreateRouterRuntimeOptions) => {
  return class UniformRuntime implements LobeRuntimeAI {
    private _runtimes: RuntimeItem[];
    private _options: ClientOptions & Record<string, any>;

    constructor(options: ClientOptions & Record<string, any> = {}) {
      const _options = {
        ...options,
        apiKey: options.apiKey?.trim() || DEFAULT_API_LEY,
        baseURL: options.baseURL?.trim(),
      };

      if (routers.length === 0) {
        throw new Error('empty providers');
      }

      this._runtimes = routers.map((router) => {
        const providerAI = router.runtime ?? baseRuntimeMap[router.apiType] ?? LobeOpenAI;

        const finalOptions = { ...router.options, ...options };
        // @ts-ignore
        const runtime: LobeRuntimeAI = new providerAI({ ...params, ...finalOptions, id });

        return { id: router.apiType, models: router.models, runtime };
      });

      this._options = _options;
    }

    // 检查下是否能匹配到特定模型，否则默认使用最后一个 runtime
    getRuntimeByModel(model: string) {
      const runtimeItem =
        this._runtimes.find((runtime) => runtime.models && runtime.models.includes(model)) ||
        this._runtimes.at(-1)!;

      return runtimeItem.runtime;
    }

    async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
      try {
        const runtime = this.getRuntimeByModel(payload.model);

        return await runtime.chat!(payload, options);
      } catch (e) {
        if (this._options.chat?.handleError) {
          const error = this._options.chat.handleError(e);

          if (error) {
            throw error;
          }
        }

        throw e;
      }
    }

    async textToImage(payload: TextToImagePayload) {
      const runtime = this.getRuntimeByModel(payload.model);

      return runtime.textToImage!(payload);
    }

    async models() {
      return this._runtimes[0].runtime.models?.();
    }

    async embeddings(payload: EmbeddingsPayload, options?: EmbeddingsOptions) {
      const runtime = this.getRuntimeByModel(payload.model);

      return runtime.embeddings!(payload, options);
    }

    async textToSpeech(payload: TextToSpeechPayload, options?: EmbeddingsOptions) {
      const runtime = this.getRuntimeByModel(payload.model);

      return runtime.textToSpeech!(payload, options);
    }
  };
};
