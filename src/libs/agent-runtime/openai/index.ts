import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

import { AgentRuntimeErrorType, ModelProvider } from '@/libs/agent-runtime';
import { AgentRuntimeError } from '@/libs/agent-runtime/utils/createError';
import { debugStream } from '@/libs/agent-runtime/utils/debugStream';
import { desensitizeUrl } from '@/libs/agent-runtime/utils/desensitizeUrl';
import { DEBUG_CHAT_COMPLETION } from '@/libs/agent-runtime/utils/env';
import { handleOpenAIError } from '@/libs/agent-runtime/utils/handleOpenAIError';
import { ChatStreamPayload } from '@/types/openai/chat';

import { LobeRuntimeAI } from '../BaseAI';
import { createBizOpenAI } from './createBizOpenAI';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export class LobeOpenAI implements LobeRuntimeAI {
  private _llm: OpenAI;

  constructor(req: Request, model: string) {
    this._llm = createBizOpenAI(req, model);
    this.baseURL = this._llm.baseURL;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload) {
    // ============  1. preprocess messages   ============ //
    const { messages, ...params } = payload;

    // ============  2. send api   ============ //

    try {
      const response = await this._llm.chat.completions.create(
        {
          messages,
          ...params,
          stream: true,
        } as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
        { headers: { Accept: '*/*' } },
      );

      const stream = OpenAIStream(response);

      const [debug, prod] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }

      return new StreamingTextResponse(prod);
    } catch (error) {
      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.OpenAIBizError;

      let desensitizedEndpoint = this.baseURL;

      // refs: https://github.com/lobehub/lobe-chat/issues/842
      if (this.baseURL !== DEFAULT_BASE_URL) {
        desensitizedEndpoint = desensitizeUrl(this.baseURL);
      }

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.OpenAI,
      });
    }
  }
}
