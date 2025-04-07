import { Ollama, Tool } from 'ollama/browser';
import { ClientOptions } from 'openai';

import { ModelRequestOptions, OpenAIChatMessage } from '@/libs/agent-runtime';
import { ChatModelCard } from '@/types/llm';
import { createErrorResponse } from '@/utils/errorResponse';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  ChatStreamPayload,
  Embeddings,
  EmbeddingsPayload,
  ModelDetail,
  ModelDetailParams,
  ModelProvider,
  PullModelParams,
} from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { OllamaStream, convertIterableToStream, createModelPullStream } from '../utils/streams';
import { parseDataUri } from '../utils/uriParser';
import { OllamaMessage } from './type';

export interface OllamaModelCard {
  name: string;
}

export class LobeOllamaAI implements LobeRuntimeAI {
  private client: Ollama;

  baseURL?: string;

  constructor({ baseURL }: ClientOptions = {}) {
    try {
      if (baseURL) new URL(baseURL);
    } catch (e) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOllamaArgs, e);
    }

    this.client = new Ollama(!baseURL ? undefined : { host: baseURL });

    if (baseURL) this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const abort = () => {
        this.client.abort();
        options?.signal?.removeEventListener('abort', abort);
      };

      options?.signal?.addEventListener('abort', abort);

      const response = await this.client.chat({
        messages: this.buildOllamaMessages(payload.messages),
        model: payload.model,
        options: {
          frequency_penalty: payload.frequency_penalty,
          presence_penalty: payload.presence_penalty,
          temperature: payload.temperature !== undefined ? payload.temperature / 2 : undefined,
          top_p: payload.top_p,
        },
        stream: true,
        tools: payload.tools as Tool[],
      });

      const stream = convertIterableToStream(response);
      const [prod, debug] = stream.tee();

      if (process.env.DEBUG_OLLAMA_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      return StreamingResponse(OllamaStream(prod, options?.callback), {
        headers: options?.headers,
      });
    } catch (error) {
      const e = error as {
        error: any;
        message: string;
        name: string;
        status_code: number;
      };
      if (e.message === 'fetch failed') {
        throw AgentRuntimeError.chat({
          error: {
            message: 'please check whether your ollama service is available',
          },
          errorType: AgentRuntimeErrorType.OllamaServiceUnavailable,
          provider: ModelProvider.Ollama,
        });
      }

      throw AgentRuntimeError.chat({
        error: {
          ...(typeof e.error !== 'string' ? e.error : undefined),
          message: String(e.error?.message || e.message),
          name: e.name,
          status_code: e.status_code,
        },
        errorType: AgentRuntimeErrorType.OllamaBizError,
        provider: ModelProvider.Ollama,
      });
    }
  }

  async embeddings(payload: EmbeddingsPayload): Promise<Embeddings[]> {
    const input = Array.isArray(payload.input) ? payload.input : [payload.input];
    const promises = input.map((inputText: string) =>
      this.invokeEmbeddingModel({
        dimensions: payload.dimensions,
        input: inputText,
        model: payload.model,
      }),
    );
    return await Promise.all(promises);
  }

  async models() {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const list = await this.client.list();

    const modelList: OllamaModelCard[] = list.models;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.name.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall: knownModel?.abilities?.functionCall || false,
          id: model.name,
          reasoning: knownModel?.abilities?.functionCall || false,
          vision: knownModel?.abilities?.functionCall || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  }

  private invokeEmbeddingModel = async (payload: EmbeddingsPayload): Promise<Embeddings> => {
    try {
      const responseBody = await this.client.embeddings({
        model: payload.model,
        prompt: payload.input as string,
      });
      return responseBody.embedding;
    } catch (error) {
      const e = error as { message: string; name: string; status_code: number };

      throw AgentRuntimeError.chat({
        error: { message: e.message, name: e.name, status_code: e.status_code },
        errorType: AgentRuntimeErrorType.OllamaBizError,
        provider: ModelProvider.Ollama,
      });
    }
  };

  private buildOllamaMessages(messages: OpenAIChatMessage[]) {
    return messages.map((message) => this.convertContentToOllamaMessage(message));
  }

  private convertContentToOllamaMessage = (message: OpenAIChatMessage): OllamaMessage => {
    if (typeof message.content === 'string') {
      return { content: message.content, role: message.role };
    }

    const ollamaMessage: OllamaMessage = {
      content: '',
      role: message.role,
    };

    for (const content of message.content) {
      switch (content.type) {
        case 'text': {
          // keep latest text input
          ollamaMessage.content = content.text;
          break;
        }
        case 'image_url': {
          const { base64 } = parseDataUri(content.image_url.url);
          if (base64) {
            ollamaMessage.images ??= [];
            ollamaMessage.images.push(base64);
          }
          break;
        }
      }
    }

    return ollamaMessage;
  };

  async pullModel(params: PullModelParams, options?: ModelRequestOptions): Promise<Response> {
    const { model, insecure } = params;

    try {
      // 获取 Ollama pull 的迭代器
      const iterable = await this.client.pull({
        insecure: insecure ?? false,
        model,
        stream: true,
      });

      // 使用专门的模型下载流转换方法
      const progressStream = createModelPullStream(iterable, model, {
        onAbort: () => {
          this.client.abort();
        },
        signal: options?.signal,
      });

      // 返回标准响应
      return new Response(progressStream, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      // 处理错误
      if ((error as Error).message === 'fetch failed') {
        return createErrorResponse(AgentRuntimeErrorType.OllamaServiceUnavailable, {
          message: 'please check whether your ollama service is available',
          provider: ModelProvider.Ollama,
        });
      }

      console.error('model download error:', error);

      // 检查是否是取消操作
      if (error instanceof DOMException && error.name === 'AbortError') {
        return new Response(
          JSON.stringify({
            model,
            status: 'cancelled',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 499,
          },
        );
      }

      // 返回错误响应
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({
          error: errorMessage,
          model,
          status: 'error',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
  }

  async getModelDetail(params: ModelDetailParams): Promise<ModelDetail> {
    try {
      const response = await this.client.show({ model: params.model });

      return {
        details: response.details,
        // digest: response.digest,
        id: params.model,
        modified_at: response.modified_at,
        // name: response.model.name,
        // size: response.size,
      };
    } catch (error) {
      const e = error as { message: string; name: string; status_code: number };

      throw AgentRuntimeError.chat({
        error: { message: e.message, name: e.name, status_code: e.status_code },
        errorType: AgentRuntimeErrorType.OllamaBizError,
        provider: ModelProvider.Ollama,
      });
    }
  }

  async deleteModel(model: string): Promise<void> {
    try {
      await this.client.delete({ model });
    } catch (error) {
      const e = error as { message: string; name: string; status_code: number };

      throw AgentRuntimeError.chat({
        error: { message: e.message, name: e.name, status_code: e.status_code },
        errorType: AgentRuntimeErrorType.OllamaBizError,
        provider: ModelProvider.Ollama,
      });
    }
  }
}

export default LobeOllamaAI;
