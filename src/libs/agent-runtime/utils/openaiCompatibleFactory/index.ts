import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI, { ClientOptions } from 'openai';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';
import { ChatModelCard } from '@/types/llm';

import { LobeRuntimeAI } from '../../BaseAI';
import { ILobeAgentRuntimeErrorType } from '../../error';
import { ChatCompetitionOptions, ChatStreamPayload } from '../../types';
import { AgentRuntimeError } from '../createError';
import { debugStream } from '../debugStream';
import { desensitizeUrl } from '../desensitizeUrl';
import { handleOpenAIError } from '../handleOpenAIError';

// the model contains the following keywords is not a chat model, so we should filter them out
const CHAT_MODELS_BLOCK_LIST = [
  'embedding',
  'davinci',
  'curie',
  'moderation',
  'ada',
  'babbage',
  'tts',
  'whisper',
  'dall-e',
];

interface OpenAICompatibleFactoryOptions {
  baseURL?: string;
  chatCompletion?: {
    handlePayload?: (payload: ChatStreamPayload) => OpenAI.ChatCompletionCreateParamsStreaming;
  };
  constructorOptions?: ClientOptions;
  debug?: {
    chatCompletion: () => boolean;
  };
  errorType: {
    bizError: ILobeAgentRuntimeErrorType;
    invalidAPIKey: ILobeAgentRuntimeErrorType;
  };
  models?:
    | ((params: { apiKey: string }) => Promise<ChatModelCard[]>)
    | {
        transformModel?: (model: OpenAI.Model) => ChatModelCard;
      };
  provider: string;
}

export const LobeOpenAICompatibleFactory = ({
  provider,
  baseURL: DEFAULT_BASE_URL,
  errorType: ErrorType,
  debug,
  constructorOptions,
  chatCompletion,
  models,
}: OpenAICompatibleFactoryOptions) =>
  class LobeOpenAICompatibleAI implements LobeRuntimeAI {
    client: OpenAI;

    baseURL: string;

    constructor({ apiKey, baseURL = DEFAULT_BASE_URL, ...res }: ClientOptions) {
      if (!apiKey) throw AgentRuntimeError.createError(ErrorType.invalidAPIKey);

      this.client = new OpenAI({ apiKey, baseURL, ...constructorOptions, ...res });
      this.baseURL = this.client.baseURL;
    }

    async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
      try {
        const postPayload = chatCompletion?.handlePayload
          ? chatCompletion.handlePayload(payload)
          : (payload as unknown as OpenAI.ChatCompletionCreateParamsStreaming);

        const response = await this.client.chat.completions.create(postPayload, {
          // https://github.com/lobehub/lobe-chat/pull/318
          headers: { Accept: '*/*' },
          signal: options?.signal,
        });

        const [prod, useForDebug] = response.tee();

        if (debug?.chatCompletion?.()) {
          debugStream(useForDebug.toReadableStream()).catch(console.error);
        }

        return new StreamingTextResponse(OpenAIStream(prod, options?.callback), {
          headers: options?.headers,
        });
      } catch (error) {
        let desensitizedEndpoint = this.baseURL;

        // refs: https://github.com/lobehub/lobe-chat/issues/842
        if (this.baseURL !== DEFAULT_BASE_URL) {
          desensitizedEndpoint = desensitizeUrl(this.baseURL);
        }

        if ('status' in (error as any)) {
          switch ((error as Response).status) {
            case 401: {
              throw AgentRuntimeError.chat({
                endpoint: desensitizedEndpoint,
                error: error as any,
                errorType: ErrorType.invalidAPIKey,
                provider: provider as any,
              });
            }

            default: {
              break;
            }
          }
        }

        const { errorResult, RuntimeError } = handleOpenAIError(error);

        throw AgentRuntimeError.chat({
          endpoint: desensitizedEndpoint,
          error: errorResult,
          errorType: RuntimeError || ErrorType.bizError,
          provider: provider as any,
        });
      }
    }

    async models() {
      if (typeof models === 'function') return models({ apiKey: this.client.apiKey });

      const list = await this.client.models.list();

      return list.data
        .filter((model) => {
          return CHAT_MODELS_BLOCK_LIST.every(
            (keyword) => !model.id.toLowerCase().includes(keyword),
          );
        })
        .map((item) => {
          if (models?.transformModel) {
            return models.transformModel(item);
          }

          const knownModel = LOBE_DEFAULT_MODEL_LIST.find((model) => model.id === item.id);

          if (knownModel) return knownModel;

          return { id: item.id };
        })

        .filter(Boolean) as ChatModelCard[];
    }
  };
