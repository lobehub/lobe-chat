import { ChatCompletion } from '@baiducloud/qianfan';

// 如果引入了这个类型，那么在跑 type-check 的 tsc 检查中就会抛错，大无语
// import type QianFanClient from '@baiducloud/qianfan/src/ChatCompletion/index';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { WenxinResultToStream, WenxinStream } from '../utils/streams/wenxin';
import { ChatResp } from './type';

interface ChatErrorCode {
  error_code: number;
  error_msg: string;
}

export interface LobeWenxinAIParams {
  accessKey?: string;
  baseURL?: string;
  secretKey?: string;
}

export class LobeWenxinAI implements LobeRuntimeAI {
  private client: any;
  baseURL?: string;

  constructor({ accessKey, baseURL, secretKey }: LobeWenxinAIParams = {}) {
    if (!accessKey || !secretKey)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new ChatCompletion({
      QIANFAN_ACCESS_KEY: accessKey,
      QIANFAN_SECRET_KEY: secretKey,
    });
    this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    try {
      const result = await this.client.chat(
        { messages: payload.messages as any, stream: true, user_id: options?.user },
        payload.model,
      );

      const wenxinStream = WenxinResultToStream(result as AsyncIterable<ChatResp>);

      const [prod, useForDebug] = wenxinStream.tee();

      if (process.env.DEBUG_WENXIN_CHAT_COMPLETION === '1') {
        debugStream(useForDebug).catch();
      }

      const stream = WenxinStream(prod, options?.callback);

      // Respond with the stream
      return StreamingResponse(stream, { headers: options?.headers });
    } catch (e) {
      const err = e as Error;

      const error: ChatErrorCode | undefined = safeParseJSON(err.message);

      if (!error) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.AgentRuntimeError, {
          message: err.message,
          name: err.name,
        });
      }

      // 文心一言错误码
      // https://cloud.baidu.com/doc/WENXINWORKSHOP/s/tlmyncueh
      switch (error.error_code) {
        // Invalid API key or access key
        case 100:
        case 13:
        case 14: {
          throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey, error);
        }

        // quota limit
        case 4:
        case 17:
        case 18:
        case 19:
        case 336_501:
        case 336_502:
        case 336_503:
        case 336_504:
        case 336_505:
        case 336_507: {
          throw AgentRuntimeError.createError(AgentRuntimeErrorType.QuotaLimitReached, {
            errorCode: error.error_code,
            message: `${error.error_msg} | you can visit https://cloud.baidu.com/doc/WENXINWORKSHOP/s/tlmyncueh for more information about the error code`,
          });
        }
      }

      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ProviderBizError, error);
    }
  }
}

export default LobeWenxinAI;
