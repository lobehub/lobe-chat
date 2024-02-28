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

  private buildCompletionsParams(payload: ChatStreamPayload) {
    const { presence_penalty, frequency_penalty = 0.1, ...res } = payload;

    let param;

    // Ensure we are only have one frequency_penalty or frequency_penalty
    if (presence_penalty !== 0) {
      param = { presence_penalty };
    } else {
      param = { frequency_penalty };
    }

    return { ...res, ...param } as unknown as OpenAI.ChatCompletionCreateParamsStreaming;
  }

  async chat(payload: ChatStreamPayload) {
    try {
      const params = this.buildCompletionsParams(payload);

      const response = await this._llm.chat.completions.create(params);

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
