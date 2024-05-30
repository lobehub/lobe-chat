import { CohereClient, CohereError, CohereTimeoutError } from "cohere-ai";
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider, UserMessageContentPart } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';

// TODO: FOR COHERE create cohereHelpers
import { buildCohereMessages, buildCohereTools } from '../utils/cohereHelpers';
import { StreamingResponse } from '../utils/response';

// TODO: FOR COHERE create stream util for cohere
import { AnthropicStream } from '../utils/streams';

const DEFAULT_BASE_URL = 'https://api.cohere.ai';

export class LobeCohereAI implements LobeRuntimeAI {
  private client: CohereClient;

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL }: ClientOptions) {
    // TODO:
    // if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidAnthropicAPIKey);

    this.client = new CohereClient({ token: apiKey });
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const coherePayload = this.buildCoherePayload(payload);

      // if there is no tool, we can use the normal chat API
      // TODO: FOR COHERE Check this once created '../utils/cohereHelpers'
      if (!coherePayload.tools || coherePayload.tools.length === 0) {
        const response = await this.client.chatStream(
          { ...coherePayload },
          {
            signal: options?.signal,
          },
        );

        const [prod, debug] = response.tee();

        // TODO: FOR COHERE set env somewhere
        if (process.env.DEBUG_COHERE_CHAT_COMPLETION === '1') {
          debugStream(debug.toReadableStream()).catch(console.error);
        }
        // TODO: FOR COHERE
        return StreamingResponse(AnthropicStream(prod, options?.callback), {
          headers: options?.headers,
        });
      }

      // or we should call the tool API
      const response = await this.client.beta.tools.messages.create(
        { ...coherePayload, stream: false },
        { signal: options?.signal },
      );

      if (process.env.DEBUG_COHERE_CHAT_COMPLETION === '1') {
        console.log('\n[no stream response]\n');
        console.log(JSON.stringify(response) + '\n');
      }

      const stream = this.transformResponseToStream(response);
      // TODO: FOR COHERE
      return StreamingResponse(AnthropicStream(stream, options?.callback), {
        headers: options?.headers,
      });
    } catch (error) {
      let desensitizedEndpoint = this.baseURL;

      if (this.baseURL !== DEFAULT_BASE_URL) {
        desensitizedEndpoint = desensitizeUrl(this.baseURL);
      }

      if ('status' in (error as any)) {
        switch ((error as Response).status) {
          case 401: {
            throw AgentRuntimeError.chat({
              endpoint: desensitizedEndpoint,
              error: error as any,
              // TODO: FOR COHERE
              errorType: AgentRuntimeErrorType.InvalidAnthropicAPIKey,
              provider: ModelProvider.Cohere,
            });
          }

          case 403: {
            throw AgentRuntimeError.chat({
              endpoint: desensitizedEndpoint,
              error: error as any,
              errorType: AgentRuntimeErrorType.LocationNotSupportError,
              provider: ModelProvider.Cohere,
            });
          }
          default: {
            break;
          }
        }
      }
      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: error as any,
        // TODO: FOR COHERE
        errorType: AgentRuntimeErrorType.AnthropicBizError,
        provider: ModelProvider.Cohere,
      });
    }
  }

  private buildCoherePayload(payload: ChatStreamPayload) {
    const { messages, model, max_tokens = 4096, temperature, top_p, tools } = payload;
    const systemMessages = messages.filter((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role === 'user');
    const chatHistory = systemMessages.concat(userMessages).slice(0, -1); // Include all messages except the last user message
    const message = userMessages[userMessages.length - 1].content; // Last user message as input
    const p = top_p ?? 0.75; // Default value for p if not provided
  
    return {
      max_tokens,
      model,
      temperature,
      tools: buildCohereTools(tools),
      p,
      message: typeof message === 'string' ? message : message.join(' '),
      chat_history: chatHistory.map((m) => ({ role: m.role.toUpperCase(), message: m.content })),
    };
  }  

  private transformResponseToStream = (response: any) => {
    return new ReadableStream<any>({
      start(controller) {
        response.content.forEach((content) => {
          switch (content.type) {
            case 'text': {
              controller.enqueue({
                delta: { text: content.text, type: 'text_delta' },
                type: 'content_block_delta',
              } as any);
              break;
            }
            case 'tool_use': {
              controller.enqueue({
                delta: {
                  tool_use: { id: content.id, input: content.input, name: content.name },
                  type: 'tool_use',
                },
                type: 'content_block_delta',
              } as any);
            }
          }
        });

        controller.enqueue({ type: 'message_stop' } as any);

        controller.close();
      },
    });
  };
}

export default LobeCohereAI;
