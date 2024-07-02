import { ChatCompletion } from '@baiducloud/qianfan';

// TODO: 没法直接引用该包的类型，会抛错
// import type QianFanClient from '@baiducloud/qianfan/src/ChatCompletion/index';
import { debugStream } from '@/libs/agent-runtime/utils/debugStream';
import { StreamingResponse } from '@/libs/agent-runtime/utils/response';
import { WenxinResultToStream, WenxinStream } from '@/libs/agent-runtime/utils/streams/wenxin';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { ChatResp } from './type';

export interface LobeWenxinAIParams {
  accessKey?: string;
  baseURL?: string;
  secretKey?: string;
}

export class LobeWenxinAI implements LobeRuntimeAI {
  private client: any;
  baseURL?: string;

  constructor({ accessKey, baseURL, secretKey }: LobeWenxinAIParams) {
    if (!accessKey || !secretKey)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new ChatCompletion({
      QIANFAN_ACCESS_KEY: accessKey,
      QIANFAN_SECRET_KEY: secretKey,
    });
    this.baseURL = baseURL;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
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
  }
}

export default LobeWenxinAI;
