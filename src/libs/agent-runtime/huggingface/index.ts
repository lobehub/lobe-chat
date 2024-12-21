import { HfInference } from '@huggingface/inference';
import urlJoin from 'url-join';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { convertIterableToStream } from '../utils/streams';

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
      const { max_tokens = 4096} = payload;
      const hfRes = client.chatCompletionStream({
        endpointUrl: instance.baseURL
          ? urlJoin(instance.baseURL, payload.model)
          : instance.baseURL,
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
  provider: ModelProvider.HuggingFace,
});
