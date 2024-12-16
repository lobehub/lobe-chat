import OpenAI, { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { handleOpenAIError } from '../utils/handleOpenAIError';
import { convertOpenAIMessages } from '../utils/openaiHelpers';
import { StreamingResponse } from '../utils/response';
import { SparkAIStream } from '../utils/streams';

const DEFAULT_BASE_URL = 'https://spark-api-open.xf-yun.com/v1';

export class LobeSparkAI implements LobeRuntimeAI {
  client: OpenAI;
  baseURL: string;

  constructor({
    apiKey,
    baseURL = DEFAULT_BASE_URL,
    ...res
  }: ClientOptions & Record<string, any> = {}) {
    if (!apiKey) throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);
    this.client = new OpenAI({ apiKey, baseURL, ...res });
    this.baseURL = this.client.baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const params = await this.buildCompletionsParams(payload);

      const response = await this.client.chat.completions.create(
        params as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      );

      const [prod, debug] = response.tee();

      if (process.env.DEBUG_SPARK_CHAT_COMPLETION === '1') {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return StreamingResponse(SparkAIStream(prod), {
        headers: options?.headers,
      });
    } catch (error) {
      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.ProviderBizError;
      let desensitizedEndpoint = this.baseURL;

      if (this.baseURL !== DEFAULT_BASE_URL) {
        desensitizedEndpoint = desensitizeUrl(this.baseURL);
      }
      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: errorResult,
        errorType,
        provider: ModelProvider.Spark,
      });
    }
  }

  private async buildCompletionsParams(payload: ChatStreamPayload) {
    const { messages, ...params } = payload;

    return {
      messages: await convertOpenAIMessages(messages as any),
      ...params,
      stream: true,
    };
  }
}

export default LobeSparkAI;
