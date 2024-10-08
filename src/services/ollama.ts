import { ListResponse, Ollama as OllamaBrowser, ProgressResponse } from 'ollama/browser';

import { ModelProvider } from '@/libs/agent-runtime';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';
import { ChatErrorType } from '@/types/fetch';
import { createErrorResponse } from '@/utils/errorResponse';
import { getMessageError } from '@/utils/fetch';

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434';

interface OllamaServiceParams {
  fetch?: typeof fetch;
}

export class OllamaService {
  private _host: string;
  private _client: OllamaBrowser;
  private _fetch?: typeof fetch;

  constructor(params: OllamaServiceParams = {}) {
    this._host = this.getHost();
    this._fetch = params.fetch;
    this._client = new OllamaBrowser({ fetch: params?.fetch, host: this._host });
  }

  getHost = (): string => {
    const config = keyVaultsConfigSelectors.ollamaConfig(useUserStore.getState());

    return config.baseURL || DEFAULT_BASE_URL;
  };

  getOllamaClient = () => {
    if (this.getHost() !== this._host) {
      this._host = this.getHost();
      this._client = new OllamaBrowser({ fetch: this._fetch, host: this.getHost() });
    }
    return this._client;
  };

  abort = () => {
    this._client.abort();
  };

  pullModel = async (model: string): Promise<AsyncIterable<ProgressResponse>> => {
    let response: Response | AsyncIterable<ProgressResponse>;
    try {
      response = await this.getOllamaClient().pull({ insecure: true, model, stream: true });
      return response;
    } catch {
      response = createErrorResponse(ChatErrorType.OllamaServiceUnavailable, {
        host: this.getHost(),
        message: 'please check whether your ollama service is available or set the CORS rules',
        provider: ModelProvider.Ollama,
      });
    }

    if (!response.ok) {
      throw await getMessageError(response);
    }
    return response.json();
  };

  getModels = async (): Promise<ListResponse> => {
    let response: Response | ListResponse;
    try {
      return await this.getOllamaClient().list();
    } catch {
      response = createErrorResponse(ChatErrorType.OllamaServiceUnavailable, {
        host: this.getHost(),
        message: 'please check whether your ollama service is available or set the CORS rules',
        provider: ModelProvider.Ollama,
      });
    }

    if (!response.ok) {
      throw await getMessageError(response);
    }
    return response.json();
  };
}

export const ollamaService = new OllamaService();
