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

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434/v1';

export class LobeOllamaAI implements LobeRuntimeAI {
  private _llm: OpenAI;

  baseURL: string;

  constructor(baseURL: string = DEFAULT_BASE_URL) {
    if (!baseURL) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOllamaArgs);

    this._llm = new OpenAI({ apiKey: 'ollama', baseURL });
    this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload) {
    try {
      const response = await this._llm.chat.completions.create(
        payload as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
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
              errorType: AgentRuntimeErrorType.InvalidOllamaArgs,
              provider: ModelProvider.Ollama,
            });
          }

          default: {
            break;
          }
        }
      }

      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.OllamaBizError;

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.Ollama,
      });
    }
  }
}

export default LobeOllamaAI;
