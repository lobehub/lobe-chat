import {
  AzureKeyCredential,
  ChatRequestMessage,
  GetChatCompletionsOptions,
  OpenAIClient,
} from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';
import { handleOpenAIError } from '../utils/handleOpenAIError';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export class LobeAzureOpenAI implements LobeRuntimeAI {
  private _client: OpenAIClient;

  constructor(endpoint?: string, apikey?: string, apiVersion?: string) {
    if (!apikey || !endpoint)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidAzureOpenAIAPIKey);

    this._client = new OpenAIClient(endpoint, new AzureKeyCredential(apikey), { apiVersion });

    this.baseURL = endpoint;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload) {
    // ============  1. preprocess messages   ============ //
    const { messages, model, ...params } = payload;

    // ============  2. send api   ============ //

    try {
      const response = await this._client.streamChatCompletions(
        model,
        messages as ChatRequestMessage[],
        params as GetChatCompletionsOptions,
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
}
