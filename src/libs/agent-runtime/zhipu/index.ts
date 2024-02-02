import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatStreamPayload, ModelProvider, OpenAIChatMessage } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { desensitizeUrl } from '../utils/desensitizeUrl';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';
import { handleOpenAIError } from '../utils/handleOpenAIError';
import { parseDataUri } from '../utils/uriParser';
import { generateApiToken } from './authToken';

const DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

export class LobeZhipuAI implements LobeRuntimeAI {
  private _llm: OpenAI;

  baseURL: string;

  constructor(oai: OpenAI) {
    this._llm = oai;
    this.baseURL = this._llm.baseURL;
  }

  static async fromAPIKey(apiKey?: string, baseURL: string = DEFAULT_BASE_URL) {
    const invalidZhipuAPIKey = AgentRuntimeError.createError(
      AgentRuntimeErrorType.InvalidZhipuAPIKey,
    );

    let token: string;

    try {
      token = await generateApiToken(apiKey);
    } catch {
      throw invalidZhipuAPIKey;
    }

    const header = { Authorization: `Bearer ${token}` };

    const llm = new OpenAI({ apiKey, baseURL, defaultHeaders: header });

    return new LobeZhipuAI(llm);
  }

  async chat(payload: ChatStreamPayload) {
    try {
      const params = this.buildCompletionsParams(payload);

      const response = await this._llm.chat.completions.create(
        params as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      );

      const stream = OpenAIStream(response);

      const [debug, returnStream] = stream.tee();

      if (DEBUG_CHAT_COMPLETION) {
        debugStream(debug).catch(console.error);
      }

      return new StreamingTextResponse(returnStream);
    } catch (error) {
      const { errorResult, RuntimeError } = handleOpenAIError(error);

      const errorType = RuntimeError || AgentRuntimeErrorType.ZhipuBizError;

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
