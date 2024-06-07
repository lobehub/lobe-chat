// sort-imports-ignore
import '@anthropic-ai/sdk/shims/web';
import Anthropic from '@anthropic-ai/sdk';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { buildAnthropicMessages, buildAnthropicTools } from '../utils/anthropicHelpers';
import { StreamingResponse } from '../utils/response';
import { AnthropicStream } from '../utils/streams';

const DEFAULT_BASE_URL = 'https://api.anthropic.com';

export class LobeAnthropicAI implements LobeRuntimeAI {
  private client: Anthropic;

  baseURL: string;

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL }: ClientOptions) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new Anthropic({ apiKey, baseURL });
    this.baseURL = this.client.baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const anthropicPayload = this.buildAnthropicPayload(payload);

      // if there is no tool, we can use the normal chat API
      if (!anthropicPayload.tools || anthropicPayload.tools.length === 0) {
        const response = await this.client.messages.create(
          { ...anthropicPayload, stream: true },
          {
            signal: options?.signal,
          },
        );

        const [prod, debug] = response.tee();

        if (process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION === '1') {
          debugStream(debug.toReadableStream()).catch(console.error);
        }

        return StreamingResponse(AnthropicStream(prod, options?.callback), {
          headers: options?.headers,
        });
      }

      // or we should call the tool API
      const response = await this.client.beta.tools.messages.create(
        { ...anthropicPayload, stream: false },
        { signal: options?.signal },
      );

      if (process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION === '1') {
        console.log('\n[no stream response]\n');
        console.log(JSON.stringify(response) + '\n');
      }

      const stream = this.transformResponseToStream(response);

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
              errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
              provider: ModelProvider.Anthropic,
            });
          }

          case 403: {
            throw AgentRuntimeError.chat({
              endpoint: desensitizedEndpoint,
              error: error as any,
              errorType: AgentRuntimeErrorType.LocationNotSupportError,
              provider: ModelProvider.Anthropic,
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
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Anthropic,
      });
    }
  }

  private buildAnthropicPayload(payload: ChatStreamPayload) {
    const { messages, model, max_tokens = 4096, temperature, top_p, tools } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    return {
      max_tokens,
      messages: buildAnthropicMessages(user_messages),
      model,
      system: system_message?.content as string,
      temperature,
      // TODO: Anthropic sdk don't have tools interface currently
      // @ts-ignore
      tools: buildAnthropicTools(tools),
      top_p,
    } satisfies Anthropic.MessageCreateParams;
  }

  private transformResponseToStream = (response: Anthropic.Beta.Tools.ToolsBetaMessage) => {
    return new ReadableStream<Anthropic.MessageStreamEvent>({
      start(controller) {
        response.content.forEach((content) => {
          switch (content.type) {
            case 'text': {
              controller.enqueue({
                delta: { text: content.text, type: 'text_delta' },
                type: 'content_block_delta',
              } as Anthropic.ContentBlockDeltaEvent);
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

        controller.enqueue({ type: 'message_stop' } as Anthropic.MessageStopEvent);

        controller.close();
      },
    });
  };
}

export default LobeAnthropicAI;
