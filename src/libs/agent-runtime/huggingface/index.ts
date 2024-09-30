import { HfInference } from '@huggingface/inference';

import {
  AgentRuntimeError,
  AgentRuntimeErrorType,
  ChatCompetitionOptions,
  ChatStreamPayload,
  LobeRuntimeAI,
} from '@/libs/agent-runtime';

import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { OpenAIStream, convertIterableToStream } from '../utils/streams';

export class LobeHuggingFaceAI implements LobeRuntimeAI {
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

      const stream = OpenAIStream(output, options?.callback);

      // Response with the stream
      return StreamingResponse(stream, { headers: options?.headers });
    } catch (e) {
      const err = e as Error;

      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderBizError, err);
    }
  }
}
