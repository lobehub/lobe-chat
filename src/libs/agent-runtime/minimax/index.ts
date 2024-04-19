import { AIStream, AIStreamCallbacksAndOptions, AIStreamParser, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';

interface MinimaxBaseResponse {
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

const parseMinimaxStream = (): AIStreamParser => {
  return (data) => {
    const json = JSON.parse(data) as OpenAI.ChatCompletionChunk;

    const delta = json.choices.at(0)?.delta.content;

    return delta || '';
  };
};

const MinimaxStream = (res: Response, cb?: AIStreamCallbacksAndOptions): ReadableStream => {
  return AIStream(res, parseMinimaxStream(), cb);
};

export class LobeMinimaxAI implements LobeRuntimeAI {
  apiKey: string;

  constructor({ apiKey }: { apiKey?: string }) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidMinimaxAPIKey);

    this.apiKey = apiKey;
  }

  async chat(
    payload: ChatStreamPayload,
    options?: ChatCompetitionOptions,
  ): Promise<StreamingTextResponse> {
    try {
      const fetchResponse = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
        body: JSON.stringify(this.buildCompletionsParams(payload)),
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      this.throwIfErrorResponse(fetchResponse.clone());
      const minimaxStream = MinimaxStream(fetchResponse.clone());
      return new StreamingTextResponse(minimaxStream, { headers: options?.headers });
    } catch (error) {
      const err = error as Error;
      const errorResult = {
        cause: err.cause,
        message: err.message,
        name: err.name,
        stack: err.stack,
      };
      throw AgentRuntimeError.chat({
        error: errorResult,
        errorType: AgentRuntimeErrorType.MinimaxBizError,
        provider: ModelProvider.Minimax,
      });
    }
  }

  private buildCompletionsParams(payload: ChatStreamPayload) {
    const { temperature, top_p, ...params } = payload;

    return {
      ...params,
      stream: true,
      temperature: temperature === 0 ? undefined : temperature,
      top_p: top_p === 0 ? undefined : top_p,
    };
  }

  private async throwIfErrorResponse(response: Response) {
    const bodyText = await response.text();
    if (bodyText.startsWith('data:')) {
      // normal chat message
      return;
    }
    // error status code
    // https://www.minimaxi.com/document/guides/chat-model/pro/api?id=6569c85948bc7b684b30377e#3.1.3%20%E8%BF%94%E5%9B%9E(response)%E5%8F%82%E6%95%B0
    const data = JSON.parse(bodyText) as MinimaxBaseResponse;
    if (!data.base_resp?.status_code || data.base_resp?.status_code < 1000) {
      return;
    }
    if (data.base_resp?.status_code === 1004) {
      throw AgentRuntimeError.chat({
        error: {
          code: data.base_resp.status_code,
          message: data.base_resp.status_msg,
        },
        errorType: AgentRuntimeErrorType.InvalidMinimaxAPIKey,
        provider: ModelProvider.Minimax,
      });
    }
    throw AgentRuntimeError.chat({
      error: {
        code: data.base_resp.status_code,
        message: data.base_resp.status_msg,
      },
      errorType: AgentRuntimeErrorType.MinimaxBizError,
      provider: ModelProvider.Minimax,
    });
  }
}

export default LobeMinimaxAI;
