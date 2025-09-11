/**
 * @see https://github.com/lobehub/lobe-chat/discussions/6563
 */
import OpenAI, { ClientOptions } from 'openai';
import { Stream } from 'openai/streaming';

import type { ChatModelCard } from '@/types/llm';

import { LobeOpenAI } from '../../providers/openai';
import { CreateImagePayload, CreateImageResponse, ILobeAgentRuntimeErrorType } from '../../types';
import {
  type ChatCompletionErrorPayload,
  ChatMethodOptions,
  ChatStreamCallbacks,
  ChatStreamPayload,
  EmbeddingsOptions,
  EmbeddingsPayload,
  TextToImagePayload,
  TextToSpeechPayload,
} from '../../types';
import { postProcessModelList } from '../../utils/postProcessModelList';
import { LobeRuntimeAI } from '../BaseAI';
import { CreateImageOptions, CustomClientOptions } from '../openaiCompatibleFactory';
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
  routers: RouterInstance[] | ((options: ClientOptions & Record<string, any>) => RouterInstance[]);
}

export const createRouterRuntime = ({
  id,
  routers,
  apiKey: DEFAULT_API_LEY,
  models,
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

      // 支持动态 routers 配置
      const resolvedRouters = typeof routers === 'function' ? routers(_options) : routers;

      if (resolvedRouters.length === 0) {
        throw new Error('empty providers');
      }

      this._runtimes = resolvedRouters.map((router) => {
        const providerAI = router.runtime ?? baseRuntimeMap[router.apiType] ?? LobeOpenAI;

        const finalOptions = { ...params, ...options, ...router.options };
        // @ts-ignore
        const runtime: LobeRuntimeAI = new providerAI({ ...finalOptions, id });

        return { id: router.apiType, models: router.models, runtime };
      });

      this._options = _options;
    }

    // Get runtime's models list, supporting both synchronous arrays and asynchronous functions
    private async getRouterMatchModels(runtimeItem: RuntimeItem): Promise<string[]> {
      // If it's a synchronous array, return directly
      if (typeof runtimeItem.models !== 'function') {
        return runtimeItem.models || [];
      }

      // Get model list
      return await runtimeItem.models();
    }

    // Check if it can match a specific model, otherwise default to using the last runtime
    async getRuntimeByModel(model: string) {
      for (const runtimeItem of this._runtimes) {
        const models = await this.getRouterMatchModels(runtimeItem);
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

    async createImage(payload: CreateImagePayload) {
      const runtime = await this.getRuntimeByModel(payload.model);
      return runtime.createImage!(payload);
    }

    async textToImage(payload: TextToImagePayload) {
      const runtime = await this.getRuntimeByModel(payload.model);

      return runtime.textToImage!(payload);
    }

    async models() {
      if (models && typeof models === 'function') {
        // If it's function-style configuration, use the last runtime's client to call the function
        const lastRuntime = this._runtimes.at(-1)?.runtime;
        if (lastRuntime && 'client' in lastRuntime) {
          const modelList = await models({ client: (lastRuntime as any).client });
          return await postProcessModelList(modelList);
        }
      }
      return this._runtimes.at(-1)?.runtime.models?.();
    }

    async embeddings(payload: EmbeddingsPayload, options?: EmbeddingsOptions) {
      const runtime = await this.getRuntimeByModel(payload.model);

      return runtime.embeddings!(payload, options);
    }

    async textToSpeech(payload: TextToSpeechPayload, options?: EmbeddingsOptions) {
      const runtime = await this.getRuntimeByModel(payload.model);

      return runtime.textToSpeech!(payload, options);
    }
  };
};

export type UniformRuntime = InstanceType<ReturnType<typeof createRouterRuntime>>;
