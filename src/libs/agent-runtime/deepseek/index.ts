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

interface DeepSeekBaseResponse {
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

type DeepSeekResponse = Partial<OpenAI.ChatCompletionChunk> & DeepSeekBaseResponse;

function throwIfErrorResponse(data: DeepSeekResponse) {
  if (!data.base_resp?.status_code || data.base_resp?.status_code < 1000) {
    return;
  }
  if (data.base_resp?.status_code === 1004) {
    throw AgentRuntimeError.chat({
      error: {
        code: data.base_resp.status_code,
        message: data.base_resp.status_msg,
      },
      errorType: AgentRuntimeErrorType.InvalidDeepSeekAPIKey,
      provider: ModelProvider.DeepSeek,
    });
  }
  throw AgentRuntimeError.chat({
    error: {
      code: data.base_resp.status_code,
      message: data.base_resp.status_msg,
    },
    errorType: AgentRuntimeErrorType.DeepSeekBizError,
    provider: ModelProvider.DeepSeek,
  });
}

function parseDeepSeekResponse(chunk: string): string | undefined {
  let body = chunk;
  if (body.startsWith('data:')) {
    body = body.slice(5).trim();
  }
  if (isEmpty(body)) {
    return;
  }
  const data = JSON.parse(body) as DeepSeekResponse;
  if (data.choices?.at(0)?.delta?.content) {
    return data.choices.at(0)?.delta.content || undefined;
  }
}

export class LobeDeepSeekAI implements LobeRuntimeAI {
  apiKey: string;

  constructor({ apiKey }: { apiKey?: string }) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidDeepSeekAPIKey);

    this.apiKey = apiKey;
  }

  async chat(
    payload: ChatStreamPayload,
    options?: ChatCompetitionOptions,
  ): Promise<StreamingTextResponse> {
    try {
      let streamController: ReadableStreamDefaultController | undefined;
      const readableStream = new ReadableStream({
        start(controller) {
          streamController = controller;
        },
      });

      const response = await fetch('https://api.DeepSeek.chat/v1/text/chatcompletion_v2', {
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
          errorType: AgentRuntimeErrorType.DeepSeekBizError,
          provider: ModelProvider.DeepSeek,
        });
      }

      const [prod, body2] = response.body.tee();
      const [prod2, debug] = body2.tee();

      if (process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      this.parseResponse(prod.getReader(), streamController);

      // wait for the first response, and throw error if minix returns an error
      await this.parseFirstResponse(prod2.getReader());

      return new StreamingTextResponse(readableStream, { headers: options?.headers });
    } catch (error) {
      console.log('error', error);
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
        errorType: AgentRuntimeErrorType.DeepSeekBizError,
        provider: ModelProvider.DeepSeek,
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

  private async parseResponse(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    streamController: ReadableStreamDefaultController | undefined,
  ) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value, { stream: true });
      const text = parseDeepSeekResponse(chunkValue);
      streamController?.enqueue(encoder.encode(text));
    }

    streamController?.close();
  }

  private async parseFirstResponse(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder();

    const { value } = await reader.read();
    const chunkValue = decoder.decode(value, { stream: true });
    let data;
    try {
      data = JSON.parse(chunkValue) as DeepSeekResponse;
    } catch {
      // parse error, skip it
      return;
    }
    throwIfErrorResponse(data);
  }
}

export default LobeDeepSeekAI;