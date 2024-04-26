// sort-imports-ignore
import '@anthropic-ai/sdk/shims/web';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { buildAnthropicMessages } from '../utils/anthropicHelpers';

const DEFAULT_BASE_URL = 'https://api.anthropic.com';

export class LobeAnthropicAI implements LobeRuntimeAI {
  private client: Anthropic;

  baseURL: string;

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL }: ClientOptions) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidAnthropicAPIKey);

    this.client = new Anthropic({ apiKey, baseURL });
    this.baseURL = this.client.baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    const { messages, model, max_tokens, temperature, top_p } = payload;
    const system_message = messages.find((m) => m.role === 'system');
    const user_messages = messages.filter((m) => m.role !== 'system');

    try {
      const response = await this.client.messages.create(
        {
          max_tokens: max_tokens || 4096,
          messages: buildAnthropicMessages(user_messages),
          model: model,
          stream: true,
          system: system_message?.content as string,
          temperature: temperature,
          top_p: top_p,
        },
        { signal: options?.signal },
      );

      const [prod, debug] = response.tee();

      if (process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION === '1') {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return new StreamingTextResponse(AnthropicStream(prod, options?.callback), {
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
        endpoint: desensitizedEndpoint,
        error: error as any,
        errorType: AgentRuntimeErrorType.AnthropicBizError,
        provider: ModelProvider.Anthropic,
      });
    }
  }
}

export default LobeAnthropicAI;
