// sort-imports-ignore
import '@anthropic-ai/sdk/shims/web';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  ChatStreamPayload,
  ModelProvider,
  OpenAIChatMessage,
  UserMessageContentPart,
} from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { parseDataUri } from '../utils/uriParser';

export class LobeAnthropicAI implements LobeRuntimeAI {
  private client: Anthropic;

  constructor({ apiKey }: ClientOptions) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidAnthropicAPIKey);

    this.client = new Anthropic({ apiKey });
  }

  private buildAnthropicMessages = (
    messages: OpenAIChatMessage[],
  ): Anthropic.Messages.MessageParam[] =>
    messages.map((message) => this.convertToAnthropicMessage(message));

  private convertToAnthropicMessage = (
    message: OpenAIChatMessage,
  ): Anthropic.Messages.MessageParam => {
    const content = message.content as string | UserMessageContentPart[];

    return {
      content:
        typeof content === 'string' ? content : content.map((c) => this.convertToAnthropicBlock(c)),
      role: message.role === 'function' || message.role === 'system' ? 'assistant' : message.role,
    };
  };

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    const { messages, model, max_tokens, temperature, top_p } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    const requestParams: Anthropic.MessageCreateParams = {
      max_tokens: max_tokens || 4096,
      messages: this.buildAnthropicMessages(user_messages),
      model: model,
      stream: true,
      system: system_message?.content as string,
      temperature: temperature,
      top_p: top_p,
    };

    try {
      const response = await this.client.messages.create(requestParams);
      const [prod, debug] = response.tee();

      if (process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION === '1') {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return new StreamingTextResponse(AnthropicStream(prod, options?.callback), {
        headers: options?.headers,
      });
    } catch (error) {
      if ('status' in (error as any)) {
        switch ((error as Response).status) {
          case 401: {
            throw AgentRuntimeError.chat({
              error: error as any,
              errorType: AgentRuntimeErrorType.InvalidAnthropicAPIKey,
              provider: ModelProvider.Anthropic,
            });
          }
          default: {
            break;
          }
        }
      }
      throw AgentRuntimeError.chat({
        error: error as any,
        errorType: AgentRuntimeErrorType.AnthropicBizError,
        provider: ModelProvider.Anthropic,
      });
    }
  }

  private convertToAnthropicBlock(
    content: UserMessageContentPart,
  ): Anthropic.ContentBlock | Anthropic.ImageBlockParam {
    switch (content.type) {
      case 'text': {
        return content;
      }

      case 'image_url': {
        const { mimeType, base64 } = parseDataUri(content.image_url.url);

        return {
          source: {
            data: base64 as string,
            media_type: mimeType as Anthropic.ImageBlockParam.Source['media_type'],
            type: 'base64',
          },
          type: 'image',
        };
      }
    }
  }
}

export default LobeAnthropicAI;
