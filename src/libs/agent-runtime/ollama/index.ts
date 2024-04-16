import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI, { ClientOptions } from 'openai';

import { OllamaChatMessage, OpenAIChatMessage } from '@/libs/agent-runtime';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { handleOpenAIError } from '../utils/handleOpenAIError';
import { parseDataUri } from '../utils/uriParser';

const DEFAULT_BASE_URL = 'http://127.0.0.1:11434/v1';

export class LobeOllamaAI implements LobeRuntimeAI {
  private client: OpenAI;

  baseURL: string;

  constructor({ apiKey = 'ollama', baseURL = DEFAULT_BASE_URL, ...res }: ClientOptions) {
    if (!baseURL) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOllamaArgs);

    this.client = new OpenAI({ apiKey, baseURL, ...res });
    this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      payload.messages = this.buildOllamaMessages(payload.messages);

      const response = await this.client.chat.completions.create(
        payload as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      );
      const [prod, debug] = response.tee();

      if (process.env.DEBUG_OLLAMA_CHAT_COMPLETION === '1') {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return new StreamingTextResponse(OpenAIStream(prod, options?.callback), {
        headers: options?.headers,
      });
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

  private buildOllamaMessages(messages: OpenAIChatMessage[]) {
    return messages.map((message) => this.convertContentToOllamaMessage(message));
  }

  private convertContentToOllamaMessage = (message: OpenAIChatMessage) => {
    if (typeof message.content === 'string') {
      return message;
    }

    const ollamaMessage: OllamaChatMessage = {
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
}

export default LobeOllamaAI;
