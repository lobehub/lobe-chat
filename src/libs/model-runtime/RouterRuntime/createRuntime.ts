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
  models?: string[] | (() => Promise<string[]>);
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

export type RuntimeClass = typeof LobeOpenAI;

interface RouterInstance {
  apiType: keyof typeof baseRuntimeMap;
  models?: string[] | (() => Promise<string[]>);
  options: ProviderIniOptions;
  runtime?: RuntimeClass;
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
    private _modelCache = new Map<string, string[]>();

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

    // 获取 runtime 的 models 列表，支持同步数组和异步函数，带缓存机制
    private async getModels(runtimeItem: RuntimeItem): Promise<string[]> {
      const cacheKey = runtimeItem.id;

      // 如果是同步数组，直接返回不需要缓存
      if (typeof runtimeItem.models !== 'function') {
        return runtimeItem.models || [];
      }

      // 检查缓存
      if (this._modelCache.has(cacheKey)) {
        return this._modelCache.get(cacheKey)!;
      }

      // 获取模型列表并缓存结果
      const models = await runtimeItem.models();
      this._modelCache.set(cacheKey, models);
      return models;
    }

    // 检查下是否能匹配到特定模型，否则默认使用最后一个 runtime
    async getRuntimeByModel(model: string) {
      for (const runtimeItem of this._runtimes) {
        const models = await this.getModels(runtimeItem);
        if (models.includes(model)) {
          return runtimeItem.runtime;
        }
      }
      return this._runtimes.at(-1)!.runtime;
    }

    async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
      try {
        const runtime = await this.getRuntimeByModel(payload.model);

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
      const runtime = await this.getRuntimeByModel(payload.model);

      return runtime.textToImage!(payload);
    }

    async models() {
      return this._runtimes[0].runtime.models?.();
    }

    async embeddings(payload: EmbeddingsPayload, options?: EmbeddingsOptions) {
      const runtime = await this.getRuntimeByModel(payload.model);

      return runtime.embeddings!(payload, options);
    }

    async textToSpeech(payload: TextToSpeechPayload, options?: EmbeddingsOptions) {
      const runtime = await this.getRuntimeByModel(payload.model);

      return runtime.textToSpeech!(payload, options);
    }

    /**
     * 清除模型列表缓存，强制下次获取时重新加载
     * @param runtimeId - 可选，指定清除特定 runtime 的缓存，不传则清除所有缓存
     */
    clearModelCache(runtimeId?: string) {
      if (runtimeId) {
        this._modelCache.delete(runtimeId);
      } else {
        this._modelCache.clear();
      }
    }
  };
};
