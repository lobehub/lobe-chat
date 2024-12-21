import { Ollama, Tool } from 'ollama/browser';
import { ClientOptions } from 'openai';

import { OpenAIChatMessage } from '@/libs/agent-runtime';
import { ChatModelCard } from '@/types/llm';
import { imageUrlToBase64 } from '@/utils/imageToBase64';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { OllamaStream, convertIterableToStream } from '../utils/streams';
import { parseDataUri } from '../utils/uriParser';
import { OllamaMessage } from './type';

export class LobeOllamaAI implements LobeRuntimeAI {
  private client: Ollama;

  baseURL?: string;

  constructor({ baseURL }: ClientOptions = {}) {
    try {
      if (baseURL) new URL(baseURL);
    } catch {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOllamaArgs);
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
        messages: await this.buildOllamaMessages(payload.messages),
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

      throw AgentRuntimeError.chat({
        error: {
          ...e.error,
          message: String(e.error?.message || e.message),
          name: e.name,
          status_code: e.status_code,
        },
        errorType: AgentRuntimeErrorType.OllamaBizError,
        provider: ModelProvider.Ollama,
      });
    }
  }

  async models(): Promise<ChatModelCard[]> {
    const list = await this.client.list();
    return list.models.map((model) => ({
      id: model.name,
    }));
  }

  private async buildOllamaMessages(messages: OpenAIChatMessage[]): Promise<OllamaMessage[]> {
    return await Promise.all(
      messages.map(async (message) => this.convertContentToOllamaMessage(message)),
    );
  }

  private convertContentToOllamaMessage = async (
    message: OpenAIChatMessage,
  ): Promise<OllamaMessage> => {
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
          const { base64, type } = parseDataUri(content.image_url.url);
          if (base64) {
            ollamaMessage.images ??= [];
            ollamaMessage.images.push(base64);
          } else if (type === 'url') {
            const { base64 } = await imageUrlToBase64(content.image_url.url);
            ollamaMessage.images ??= [];
            ollamaMessage.images.push(base64);
          }
          break;
        }
      }
    }

    return ollamaMessage;
  };
}

export default LobeOllamaAI;
