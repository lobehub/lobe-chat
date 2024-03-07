import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI, { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { handleOpenAIError } from '../utils/handleOpenAIError';

const DEFAULT_BASE_URL = 'https://api.mistral.ai/v1';

export class LobeMistralAI implements LobeRuntimeAI {
  private client: OpenAI;

  baseURL: string;

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL, ...res }: ClientOptions) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidMistralAPIKey);

    this.client = new OpenAI({ apiKey, baseURL, ...res });
    this.baseURL = this.client.baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      // Pick supported properties from payload
      const chatPayload = {
        max_tokens: payload.max_tokens,
        messages: payload.messages,
        model: payload.model,
        stream: true,
        temperature: payload.temperature,
        top_p: payload.top_p,
      };
      const response = await this.client.chat.completions.create(
        chatPayload as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      );
      const [prod, debug] = response.tee();

      if (process.env.DEBUG_MISTRAL_CHAT_COMPLETION === '1') {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return new StreamingTextResponse(OpenAIStream(prod, options?.callback), {
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
              errorType: AgentRuntimeErrorType.InvalidMistralAPIKey,
              provider: ModelProvider.Mistral,
            });
          }

          default: {
            break;
          }
        }
      }

      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.MistralBizError;

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.Mistral,
      });
    }
  }
}

export default LobeMistralAI;
