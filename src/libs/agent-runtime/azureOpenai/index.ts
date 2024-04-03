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
import { DEBUG_CHAT_COMPLETION } from '../utils/env';

export class LobeAzureOpenAI implements LobeRuntimeAI {
  private _client: OpenAIClient;

  constructor(endpoint?: string, apikey?: string, apiVersion?: string) {
    if (!apikey || !endpoint)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidAzureAPIKey);

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

      // TODO: we need to refactor this part in the future
      const stream = OpenAIStream(response as any);

      const [debug, prod] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }

      return new StreamingTextResponse(prod);
    } catch (e) {
      let error = e as { [key: string]: any; code: string; message: string };

      switch (error.code) {
        case 'DeploymentNotFound': {
          error = { ...error, deployId: model };
        }
      }

      const errorType = error.code
        ? AgentRuntimeErrorType.AzureBizError
        : AgentRuntimeErrorType.AgentRuntimeError;

      throw AgentRuntimeError.chat({
        error,
        errorType,
        provider: ModelProvider.Azure,
      });
    }
  }
}
