import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';
import { handleOpenAIError } from '../utils/handleOpenAIError';

const DEFAULT_BASE_URL = 'https://api.perplexity.ai';

export class LobePerplexityAI implements LobeRuntimeAI {
  private _llm: OpenAI;

  baseURL: string;

  constructor(apiKey?: string, baseURL: string = DEFAULT_BASE_URL) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidPerplexityAPIKey);

    this._llm = new OpenAI({ apiKey, baseURL });
    this.baseURL = this._llm.baseURL;
  }

  async chat(payload: ChatStreamPayload) {
    try {
      // Set a default frequency penalty value greater than 0
      const defaultFrequencyPenalty = 0.1;
      const chatPayload = {
        ...payload,
        frequency_penalty: payload.frequency_penalty || defaultFrequencyPenalty,
      };
      const response = await this._llm.chat.completions.create(
        chatPayload as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      );

      const stream = OpenAIStream(response);

      const [debug, returnStream] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }

      return new StreamingTextResponse(returnStream);
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
              errorType: AgentRuntimeErrorType.InvalidPerplexityAPIKey,
              provider: ModelProvider.Perplexity,
            });
          }

          default: {
            break;
          }
        }
      }

      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.PerplexityBizError;

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.Perplexity,
      });
    }
  }
}

export default LobePerplexityAI;
