import {
  AzureKeyCredential,
  ChatRequestMessage,
  GetChatCompletionsOptions,
  OpenAIClient,
} from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';

export class LobeAzureOpenAI implements LobeRuntimeAI {
  client: OpenAIClient;

  constructor(endpoint?: string, apikey?: string, apiVersion?: string) {
    if (!apikey || !endpoint)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidAzureAPIKey);

    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(apikey), { apiVersion });

    this.baseURL = endpoint;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    // ============  1. preprocess messages   ============ //
    const { messages, model, ...params } = payload;

    // ============  2. send api   ============ //

    try {
      const response = await this.client.streamChatCompletions(
        model,
        messages as ChatRequestMessage[],
        { ...params, abortSignal: options?.signal } as GetChatCompletionsOptions,
      );

      const stream = OpenAIStream(response as any);

      const [debug, prod] = stream.tee();

      if (process.env.DEBUG_AZURE_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      return new StreamingTextResponse(prod);
    } catch (e) {
      let error = e as { [key: string]: any; code: string; message: string };

      if (error.code) {
        switch (error.code) {
          case 'DeploymentNotFound': {
            error = { ...error, deployId: model };
          }
        }
      } else {
        error = {
          cause: error.cause,
          message: error.message,
          name: error.name,
        } as any;
      }

      const errorType = error.code
        ? AgentRuntimeErrorType.AzureBizError
        : AgentRuntimeErrorType.AgentRuntimeError;

      throw AgentRuntimeError.chat({
        endpoint: this.baseURL,
        error,
        errorType,
        provider: ModelProvider.Azure,
      });
    }
  }
}
