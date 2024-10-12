import { HfInference } from '@huggingface/inference';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { convertIterableToStream } from '../utils/streams';

export const LobeHuggingFaceAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.groq.com/openai/v1',
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
      const hfRes = client.chatCompletionStream({
        endpointUrl: instance.baseURL,
        messages: payload.messages,
        model: payload.model,
        stream: true,
        temperature: payload.temperature,
        top_p: payload.top_p,
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
