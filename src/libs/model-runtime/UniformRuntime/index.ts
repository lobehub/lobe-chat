import { LobeRuntimeAI } from '../BaseAI';
import { LobeOpenAI } from '../openai';
import { providerRuntimeMap } from '../runtimeMap';
import {
  type ChatCompletionErrorPayload,
  ChatMethodOptions,
  ChatStreamPayload,
  EmbeddingsOptions,
  EmbeddingsPayload,
  TextToImagePayload,
  TextToSpeechPayload,
} from '../types';

export interface RuntimeItem {
  id: string;
  models?: string[];
  runtime: LobeRuntimeAI;
}

interface ProviderInitParams extends Record<string, any> {
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

interface ProviderInstance {
  apiType: keyof typeof providerRuntimeMap;
  models?: string[];
  params: ProviderInitParams;
  runtime?: typeof LobeOpenAI;
}

interface UniformRuntimeOptions {
  chat?: {
    handleError?: (error: any) => Omit<ChatCompletionErrorPayload, 'provider'> | undefined;
  };
}

class UniformRuntime {
  private _runtimes: RuntimeItem[];
  private _options: UniformRuntimeOptions;

  constructor(id: string, providers: ProviderInstance[], options: UniformRuntimeOptions) {
    if (providers.length === 0) {
      throw new Error('empty providers');
    }

    this._runtimes = providers.map((options) => {
      const providerAI = options.runtime ?? providerRuntimeMap[options.apiType] ?? LobeOpenAI;
      const runtime: LobeRuntimeAI = new providerAI({ ...options.params, id });

      return { id: options.apiType, models: options.models, runtime };
    });

    this._options = options;
  }

  // 检查下是否能匹配到特定模型，否则默认使用第一个 runtime
  getRuntimeByModel(model: string) {
    const runtimeItem =
      this._runtimes.find((runtime) => runtime.models && runtime.models.includes(model)) ||
      this._runtimes[0];

    return runtimeItem.runtime;
  }

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
    try {
      const runtime = this.getRuntimeByModel(payload.model);

      return await runtime.chat(payload, options);
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

    return runtime.textToImage?.(payload);
  }

  async models() {
    return this._runtimes[0].runtime.models?.();
  }

  async embeddings(payload: EmbeddingsPayload, options?: EmbeddingsOptions) {
    const runtime = this.getRuntimeByModel(payload.model);

    return runtime.embeddings?.(payload, options);
  }

  async textToSpeech(payload: TextToSpeechPayload, options?: EmbeddingsOptions) {
    const runtime = this.getRuntimeByModel(payload.model);

    return runtime.textToSpeech?.(payload, options);
  }
}

export default UniformRuntime;
