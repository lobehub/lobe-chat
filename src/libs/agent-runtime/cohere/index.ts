import { CohereClient, CohereError, CohereTimeoutError } from 'cohere-ai';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { CohereStream } from '../utils/streams';

// TODO: Add support for Cohere Tools
// import { buildCohereTools } from '../utils/cohereHelpers';
// https://docs.cohere.com/docs/tool-use
import { StreamingResponse } from '../utils/response';

export class LobeCohereAI implements LobeRuntimeAI {
  private client: CohereClient;

  // BaseURL is "built into" the cohere-ai npm package
  // so there's no need to pass it in here.
  constructor({ apiKey }: ClientOptions) {
    if (!apiKey){
      throw AgentRuntimeError.createError(
        AgentRuntimeErrorType.InvalidProviderAPIKey
      );
    }
    this.client = new CohereClient({ token: apiKey });
  }

  async chat(
    payload: ChatStreamPayload, 
    options?: ChatCompetitionOptions
  ): Promise<Response> {
    try {
      const coherePayload = this.buildCoherePayload(payload);

      const stream = await this.client.chatStream(coherePayload);

      return StreamingResponse(CohereStream(stream, options?.callback), {
        headers: options?.headers,
      });

        // TODO: FOR COHERE set env somewhere
        // if (process.env.DEBUG_COHERE_CHAT_COMPLETION === '1') {
        //   debugStream(debug.toReadableStream()).catch(console.error);
        // }
        // TODO: FOR COHERE
    } catch (error) {
      if (error instanceof CohereError) {
        switch (error.statusCode) {
          case 401: {
            throw AgentRuntimeError.chat({
              error,
              errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
              provider: ModelProvider.Cohere,
            });
          }
          case 403: {
            throw AgentRuntimeError.chat({
              error,
              errorType: AgentRuntimeErrorType.LocationNotSupportError,
              provider: ModelProvider.Cohere,
            });
          }
          default: {
            throw AgentRuntimeError.chat({
              error,
              errorType: AgentRuntimeErrorType.ProviderBizError,
              provider: ModelProvider.Cohere,
            });
          }
        }
      } else if (error instanceof CohereTimeoutError) {
        throw AgentRuntimeError.chat({
          error,
          errorType: AgentRuntimeErrorType.ProviderBizError,
          provider: ModelProvider.Cohere,
        });
      }
      throw AgentRuntimeError.chat({
        error: error as Error,
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Cohere,
      });
    }
  }

  private buildCoherePayload(payload: ChatStreamPayload) {
    const { messages, model, max_tokens = 4096, temperature, top_p, tools } = payload;
    const systemMessages = messages.filter((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role === 'user');
    const chatHistory = systemMessages.concat(userMessages).slice(0, -1); // Include all messages except the last user message
    const lastUserMessage = userMessages.at(-1); // Last user message as input

    const message = lastUserMessage ? lastUserMessage.content : '';

    const p = top_p ?? 0.75; // Default value for p if not provided
  
    return {
      chat_history: chatHistory.map((m) => ({ message: m.content, role: m.role.toUpperCase() })),
      max_tokens,
      message: typeof message === 'string' ? message : message.join(' '),
      model,
      p,
      temperature,
      // tools: buildCohereTools(tools),
    };
  }
}

export default LobeCohereAI;
