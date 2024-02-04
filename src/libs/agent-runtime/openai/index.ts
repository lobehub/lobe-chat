import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI, { ClientOptions } from 'openai';
import urlJoin from 'url-join';

import { ChatStreamPayload } from '@/types/openai/chat';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';
import { handleOpenAIError } from '../utils/handleOpenAIError';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

interface AzureOpenAIOptions extends ClientOptions {
  azureOptions?: {
    apiVersion?: string;
    model?: string;
  };
  useAzure?: boolean;
}
export class LobeOpenAI implements LobeRuntimeAI {
  private client: OpenAI;

  constructor(options: AzureOpenAIOptions) {
    if (!options.apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.NoOpenAIAPIKey);

    if (options.useAzure) {
      this.client = LobeOpenAI.initWithAzureOpenAI(options);
    } else {
      this.client = new OpenAI(options);
    }

    this.baseURL = this.client.baseURL;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload) {
    // ============  1. preprocess messages   ============ //
    const { messages, ...params } = payload;

    // ============  2. send api   ============ //

    try {
      const response = await this.client.chat.completions.create(
        {
          messages,
          ...params,
          stream: true,
        } as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
        { headers: { Accept: '*/*' } },
      );

      const stream = OpenAIStream(response);

      const [debug, prod] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }

      return new StreamingTextResponse(prod);
    } catch (error) {
      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.OpenAIBizError;

      let desensitizedEndpoint = this.baseURL;

      // refs: https://github.com/lobehub/lobe-chat/issues/842
      if (this.baseURL !== DEFAULT_BASE_URL) {
        desensitizedEndpoint = desensitizeUrl(this.baseURL);
      }

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.OpenAI,
      });
    }
  }

  static initWithAzureOpenAI(options: AzureOpenAIOptions) {
    const endpoint = options.baseURL!;
    const model = options.azureOptions?.model || '';

    // refs: https://test-001.openai.azure.com/openai/deployments/gpt-35-turbo
    const baseURL = urlJoin(endpoint, `/openai/deployments/${model.replace('.', '')}`);

    const apiVersion = options.azureOptions?.apiVersion || '2023-08-01-preview';
    const apiKey = options.apiKey!;

    const config: ClientOptions = {
      apiKey,
      baseURL,
      defaultHeaders: { 'api-key': apiKey },
      defaultQuery: { 'api-version': apiVersion },
    };

    return new OpenAI(config);
  }
}
