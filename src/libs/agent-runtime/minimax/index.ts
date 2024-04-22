import { StreamingTextResponse } from 'ai';
import { isEmpty } from 'lodash-es';
import OpenAI from 'openai';

import { debugStream } from '@/libs/agent-runtime/utils/debugStream';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  ChatCompletionErrorPayload,
  ChatStreamPayload,
  ModelProvider,
} from '../types';
import { AgentRuntimeError } from '../utils/createError';

interface MinimaxBaseResponse {
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

type MinimaxResponse = Partial<OpenAI.ChatCompletionChunk> & MinimaxBaseResponse;

function throwIfErrorResponse(data: MinimaxResponse) {
  // error status code
  // https://www.minimaxi.com/document/guides/chat-model/pro/api?id=6569c85948bc7b684b30377e#3.1.3%20%E8%BF%94%E5%9B%9E(response)%E5%8F%82%E6%95%B0
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

function parseMinimaxResponse(chunk: string): string | undefined {
  let body = chunk;
  if (body.startsWith('data:')) {
    body = body.slice(5).trim();
  }
  if (isEmpty(body)) {
    return;
  }
  const data = JSON.parse(body) as MinimaxResponse;
  throwIfErrorResponse(data);
  if (data.choices?.at(0)?.delta?.content) {
    return data.choices.at(0)?.delta.content || undefined;
  }
}

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
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let dataResponse: MinimaxResponse | undefined;
      let streamController: ReadableStreamDefaultController | undefined;
      const readableStream = new ReadableStream({
        start(controller) {
          streamController = controller;
        },
      });

      const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
        body: JSON.stringify(this.buildCompletionsParams(payload)),
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!response.body || !response.ok) {
        throw AgentRuntimeError.chat({
          error: {
            status: response.status,
            statusText: response.statusText,
          },
          errorType: AgentRuntimeErrorType.MinimaxBizError,
          provider: ModelProvider.Minimax,
        });
      }

      const [prod, debug] = response.body.tee();

      if (process.env.DEBUG_MINIMAX_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      const reader = prod.getReader();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        const text = parseMinimaxResponse(chunkValue);
        streamController?.enqueue(encoder.encode(text));
      }

      streamController?.close();
      if (dataResponse) {
        throwIfErrorResponse(dataResponse);
      }

      return new StreamingTextResponse(readableStream, { headers: options?.headers });
    } catch (error) {
      const err = error as Error | ChatCompletionErrorPayload;
      if ('provider' in err) {
        throw error;
      }
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
}

export default LobeMinimaxAI;
