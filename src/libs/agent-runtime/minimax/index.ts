import { isEmpty } from 'lodash-es';
import OpenAI from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  ChatCompletionErrorPayload,
  ChatStreamPayload,
  ModelProvider,
} from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { MinimaxStream } from '../utils/streams';

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
      errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
      provider: ModelProvider.Minimax,
    });
  }
  throw AgentRuntimeError.chat({
    error: {
      code: data.base_resp.status_code,
      message: data.base_resp.status_msg,
    },
    errorType: AgentRuntimeErrorType.ProviderBizError,
    provider: ModelProvider.Minimax,
  });
}

function parseMinimaxResponse(chunk: string): MinimaxResponse | undefined {
  let body = chunk;
  if (body.startsWith('data:')) {
    body = body.slice(5).trim();
  }
  if (isEmpty(body)) {
    return;
  }
  return JSON.parse(body) as MinimaxResponse;
}

export class LobeMinimaxAI implements LobeRuntimeAI {
  apiKey: string;

  constructor({ apiKey }: { apiKey?: string } = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.apiKey = apiKey;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions): Promise<Response> {
    try {
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
          errorType: AgentRuntimeErrorType.ProviderBizError,
          provider: ModelProvider.Minimax,
        });
      }

      const [prod, body2] = response.body.tee();
      const [prod2, debug] = body2.tee();

      if (process.env.DEBUG_MINIMAX_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      // wait for the first response, and throw error if minix returns an error
      await this.parseFirstResponse(prod2.getReader());

      return StreamingResponse(MinimaxStream(prod), { headers: options?.headers });
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
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Minimax,
      });
    }
  }

  // the document gives the default value of max tokens, but abab6.5 and abab6.5s
  // will meet length finished error, and output is truncationed
  // so here fill the max tokens number to fix it
  // https://www.minimaxi.com/document/guides/chat-model/V2
  private getMaxTokens(model: string): number | undefined {
    switch (model) {
      case 'abab6.5-chat':
      case 'abab6.5s-chat': {
        return 2048;
      }
    }
  }

  private buildCompletionsParams(payload: ChatStreamPayload) {
    const { temperature, top_p, ...params } = payload;

    return {
      ...params,
      max_tokens: this.getMaxTokens(payload.model),
      stream: true,
      temperature: temperature === 0 ? undefined : temperature,

      tools: params.tools?.map((tool) => ({
        function: {
          description: tool.function.description,
          name: tool.function.name,
          parameters: JSON.stringify(tool.function.parameters),
        },
        type: 'function',
      })),
      top_p: top_p === 0 ? undefined : top_p,
    };
  }

  private async parseFirstResponse(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder();

    const { value } = await reader.read();
    const chunkValue = decoder.decode(value, { stream: true });
    let data;
    try {
      data = parseMinimaxResponse(chunkValue);
    } catch {
      // parse error, skip it
      return;
    }
    if (data) {
      throwIfErrorResponse(data);
    }
  }
}

export default LobeMinimaxAI;
