import { HfInference } from '@huggingface/inference';
import urlJoin from 'url-join';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { convertIterableToStream } from '../utils/streams';

import type { ChatModelCard } from '@/types/llm';

export interface HuggingFaceModelCard {
  id: string;
  tags: string[];
}

export const LobeHuggingFaceAI = LobeOpenAICompatibleFactory({
  chatCompletion: {
    handleStreamBizErrorType: (error) => {
      // e.g.: Server meta-llama/Meta-Llama-3.1-8B-Instruct does not seem to support chat completion. Error: Model requires a Pro subscription; check out hf.co/pricing to learn more. Make sure to include your HF token in your query.
      if (error.message?.includes('Model requires a Pro subscription')) {
        return AgentRuntimeErrorType.PermissionDenied;
      }

      // e.g.: Server meta-llama/Meta-Llama-3.1-8B-Instruct does not seem to support chat completion. Error: Authorization header is correct, but the token seems invalid
      if (error.message?.includes('the token seems invalid')) {
        return AgentRuntimeErrorType.InvalidProviderAPIKey;
      }
    },
  },
  customClient: {
    createChatCompletionStream: (client: HfInference, payload, instance) => {
      const { max_tokens = 4096 } = payload;
      const hfRes = client.chatCompletionStream({
        endpointUrl: instance.baseURL ? urlJoin(instance.baseURL, payload.model) : instance.baseURL,
        max_tokens: max_tokens,
        messages: payload.messages,
        model: payload.model,
        stream: true,
        temperature: payload.temperature,
        //  `top_p` must be > 0.0 and < 1.0
        top_p: payload?.top_p
          ? payload?.top_p >= 1
            ? 0.99
            : payload?.top_p <= 0
              ? 0.01
              : payload?.top_p
          : undefined,
      });

      return convertIterableToStream(hfRes);
    },
    createClient: (options) => new HfInference(options.apiKey),
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_HUGGINGFACE_CHAT_COMPLETION === '1',
  },
  models: async () => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const visionKeywords = [
      'image-text-to-text',
      'multimodal',
      'vision',
    ];

    const reasoningKeywords = [
      'deepseek-r1',
      'qvq',
      'qwq',
    ];

    // ref: https://huggingface.co/docs/hub/api
    const url = 'https://huggingface.co/api/models';
    const response = await fetch(url, {
      method: 'GET',
    });
    const json = await response.json();

    const modelList: HuggingFaceModelCard[] = json;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.toLowerCase() === m.id.toLowerCase());

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            model.tags.some(tag => tag.toLowerCase().includes('function-calling'))
            || knownModel?.abilities?.functionCall
            || false,
          id: model.id,
          reasoning:
            model.tags.some(tag => tag.toLowerCase().includes('reasoning'))
            || reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword))
            || knownModel?.abilities?.reasoning
            || false,
          vision:
            model.tags.some(tag => visionKeywords.some(keyword => tag.toLowerCase().includes(keyword)))
            || knownModel?.abilities?.vision
            || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.HuggingFace,
});
