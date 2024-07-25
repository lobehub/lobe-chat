import OpenAI, { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import {
  ChatCompetitionOptions,
  ChatStreamPayload,
  ModelProvider,
  OpenAIChatMessage,
} from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { handleOpenAIError } from '../utils/handleOpenAIError';
import { StreamingResponse } from '../utils/response';
import { OpenAIStream } from '../utils/streams';
import { parseDataUri } from '../utils/uriParser';
import { generateApiToken } from './authToken';

const DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

export class LobeZhipuAI implements LobeRuntimeAI {
  private client: OpenAI;

  baseURL: string;

  constructor(oai: OpenAI) {
    this.client = oai;
    this.baseURL = this.client.baseURL;
  }

  static async fromAPIKey({ apiKey, baseURL = DEFAULT_BASE_URL, ...res }: ClientOptions = {}) {
    const invalidZhipuAPIKey = AgentRuntimeError.createError(
      AgentRuntimeErrorType.InvalidProviderAPIKey,
    );

    if (!apiKey) throw invalidZhipuAPIKey;

    let token: string;

    try {
      token = await generateApiToken(apiKey);
    } catch {
      throw invalidZhipuAPIKey;
    }

    const header = { Authorization: `Bearer ${token}` };
    const llm = new OpenAI({ apiKey, baseURL, defaultHeaders: header, ...res });

    return new LobeZhipuAI(llm);
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const params = this.buildCompletionsParams(payload);

      const response = await this.client.chat.completions.create(
        params as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      );

      const [prod, debug] = response.tee();

      if (process.env.DEBUG_ZHIPU_CHAT_COMPLETION === '1') {
        debugStream(debug.toReadableStream()).catch(console.error);
      }

      return StreamingResponse(OpenAIStream(prod, options?.callback), {
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
        provider: ModelProvider.ZhiPu,
      });
    }
  }

  private buildCompletionsParams(payload: ChatStreamPayload) {
    const { messages, temperature, top_p, ...params } = payload;

    return {
      messages: messages.map((m) => this.transformMessage(m)) as any,
      ...params,
      do_sample: temperature === 0,
      stream: true,
      // 当前的模型侧不支持 top_p=1 和 temperature 为 0
      // refs: https://zhipu-ai.feishu.cn/wiki/TUo0w2LT7iswnckmfSEcqTD0ncd
      temperature: temperature === 0 ? undefined : temperature,
      top_p: top_p === 1 ? 0.99 : top_p,
    };
  }

  // TODO: 临时处理，后续需要移除
  private transformMessage = (message: OpenAIChatMessage): OpenAIChatMessage => {
    return {
      ...message,
      content:
        typeof message.content === 'string'
          ? message.content
          : message.content.map((c) => {
              switch (c.type) {
                default:
                case 'text': {
                  return c;
                }

                case 'image_url': {
                  const { base64 } = parseDataUri(c.image_url.url);
                  return {
                    image_url: { ...c.image_url, url: base64 || c.image_url.url },
                    type: 'image_url',
                  };
                }
              }
            }),
    };
  };
}

export default LobeZhipuAI;
