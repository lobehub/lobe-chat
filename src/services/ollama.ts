import { ListResponse, Ollama as OllamaBrowser, ProgressResponse } from 'ollama/browser';

import { createErrorResponse } from '@/app/api/errorResponse';
import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelConfigSelectors } from '@/store/global/selectors';
import { ChatErrorType } from '@/types/fetch';
import { getMessageError } from '@/utils/fetch';

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434/v1';

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
    const config = modelConfigSelectors.ollamaConfig(useGlobalStore.getState());

    const url = new URL(config.endpoint || DEFAULT_BASE_URL);
    return url.host;
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

  pullModel = async (model: string): Promise<AsyncGenerator<ProgressResponse>> => {
    let response: Response | AsyncGenerator<ProgressResponse>;
    try {
      response = await this.getOllamaClient().pull({ insecure: true, model, stream: true });
      return response;
    } catch {
      response = createErrorResponse(ChatErrorType.OllamaServiceUnavailable, {
        host: this.getHost(),
        message: 'please check whether your ollama service is available',
        provider: ModelProvider.Ollama,
      });
    }

    if (!response.ok) {
      const messageError = await getMessageError(response);
      throw messageError;
    }
    return response.json();
  };

  getModels = async (): Promise<ListResponse> => {
    let response: Response | ListResponse;
    try {
      const response = await this.getOllamaClient().list();
      return response;
    } catch {
      response = createErrorResponse(ChatErrorType.OllamaServiceUnavailable, {
        host: this.getHost(),
        message: 'please check whether your ollama service is available',
        provider: ModelProvider.Ollama,
      });
    }

    if (!response.ok) {
      const messageError = await getMessageError(response);
      throw messageError;
    }
    return response.json();
  };
}

export const ollamaService = new OllamaService();
