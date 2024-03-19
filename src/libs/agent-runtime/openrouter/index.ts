import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI, { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { handleOpenAIError } from '../utils/handleOpenAIError';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

export class LobeOpenRouterAI implements LobeRuntimeAI {
  private client: OpenAI;

  baseURL: string;

  constructor({ apiKey, baseURL = DEFAULT_BASE_URL, ...res }: ClientOptions) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOpenRouterAPIKey);
    
    this.client = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        "HTTP-Referer": "https://chat-preview.lobehub.com",
        "X-Title": "Lobe Chat"
      },
      ...res
    });
    this.baseURL = this.client.baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const response = await this.client.chat.completions.create(
        payload as unknown as OpenAI.ChatCompletionCreateParamsStreaming
      );
      const [prod, debug] = response.tee();

      if (process.env.DEBUG_OPENROUTER_CHAT_COMPLETION === '1') {
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
              errorType: AgentRuntimeErrorType.InvalidOpenRouterAPIKey,
              provider: ModelProvider.OpenRouter,
            });
          }

          default: {
            break;
          }
        }
      }

      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.OpenRouterBizError;

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.OpenRouter,
      });
    }
  }
}

export default LobeOpenRouterAI;
