import { HfInference } from '@huggingface/inference';

import { ChatCompetitionOptions, ChatStreamPayload, LobeRuntimeAI } from '@/libs/agent-runtime';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';
import { StreamingResponse } from '../utils/response';
import { OpenAIStream, convertIterableToStream } from '../utils/streams';

export class LobeHFAI implements LobeRuntimeAI {
  private client: HfInference;
  baseURL?: string;

  constructor({ apiKey, baseURL }: { apiKey?: string; baseURL?: string } = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new HfInference(apiKey);
    this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const hfRes = this.client.chatCompletionStream({
        endpointUrl: this.baseURL,
        messages: payload.messages,
        model: payload.model,
        stream: true,
        // temperature: payload.temperature,
        // top_p: payload.top_p,
      });

      const rawStream = convertIterableToStream(hfRes);

      // Convert the response into a friendly text-stream
      const [debug, output] = rawStream.tee();

      if (process.env.DEBUG_HUGGINGFACE_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
      }

      const stream = OpenAIStream(output, {
        bizErrorTypeTransformer: (error) => {
          // e.g.: Server meta-llama/Meta-Llama-3.1-8B-Instruct does not seem to support chat completion. Error: Model requires a Pro subscription; check out hf.co/pricing to learn more. Make sure to include your HF token in your query.
          if (error.message?.includes('Model requires a Pro subscription')) {
            return AgentRuntimeErrorType.PermissionDenied;
          }

          // e.g.: Server meta-llama/Meta-Llama-3.1-8B-Instruct does not seem to support chat completion. Error: Authorization header is correct, but the token seems invalid
          if (error.message?.includes('the token seems invalid')) {
            return AgentRuntimeErrorType.InvalidProviderAPIKey;
          }
        },
        callbacks: options?.callback,
        provider: ModelProvider.HuggingFace,
      });

      // Response with the stream
      return StreamingResponse(stream, { headers: options?.headers });
    } catch (e) {
      const err = e as Error;

      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderBizError, err);
    }
  }
}

export const LobeHuggingFaceAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.groq.com/openai/v1',
  chatCompletion: {
    handleError: (error) => {
      // 403 means the location is not supported
      if (error.status === 403)
        return { error, errorType: AgentRuntimeErrorType.LocationNotSupportError };
    },
    handlePayload: (payload) => {
      const { temperature, ...restPayload } = payload;
      return {
        ...restPayload,
        // disable stream for tools due to groq dont support
        stream: !payload.tools,

        temperature: temperature <= 0 ? undefined : temperature,
      } as any;
    },
  },
  customClient: {
    createChatCompletionStream: (client: HfInference, payload,instance) => {
      const hfRes = client.chatCompletionStream({
        endpointUrl: instance.baseURL,
        messages: payload.messages,
        model: payload.model,
        stream: true,
        // temperature: payload.temperature,
        // top_p: payload.top_p,
      });

      return convertIterableToStream(hfRes);
    },
    createClient: (options) => new HfInference(options.apiKey),
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_GROQ_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Groq,
});
