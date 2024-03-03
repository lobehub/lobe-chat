import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { handleOpenAIError } from '../utils/handleOpenAIError';

export class LobeAnthropicAI implements LobeRuntimeAI {
  private client: Anthropic;

  constructor({ apiKey }: ClientOptions) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidAnthropicAPIKey);

    this.client = new Anthropic({ apiKey });
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    const { messages, model, max_tokens, temperature, top_p } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    const requestPramas: Anthropic.MessageCreateParams = {
      max_tokens: max_tokens || 1024,
      messages: user_messages as Anthropic.Messages.MessageParam[],
      model: model,
      stream: true,
      system: system_message?.content as string,
      temperature: temperature,
      top_p: top_p,
    };

    try {
      const response = await this.client.messages.create(requestPramas);
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
          case 403: {
            throw AgentRuntimeError.chat({
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

      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.AnthropicBizError;

      throw AgentRuntimeError.chat({
        error: errorResult,
        errorType,
        provider: ModelProvider.Anthropic,
      });
    }
  }
}

export default LobeAnthropicAI;
