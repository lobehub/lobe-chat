import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI, { ClientOptions } from 'openai';

import { getServerConfig } from '@/config/server';
import { createErrorResponse } from '@/pages/api/error';
import { ChatErrorType } from '@/types/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

// 创建 OpenAI 实例
export const createOpenAI = (userApiKey: string | null, endpoint?: string | null) => {
  const { OPENAI_API_KEY, OPENAI_PROXY_URL } = getServerConfig();

  const baseURL = endpoint ? endpoint : OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined;

  const config: ClientOptions = {
    apiKey: !userApiKey ? OPENAI_API_KEY : userApiKey,
    baseURL,
  };

  return new OpenAI(config);
};

interface CreateChatCompletionOptions {
  OPENAI_API_KEY: string | null;
  endpoint?: string | null;
  payload: OpenAIStreamPayload;
}

export const createChatCompletion = async ({
  payload,
  OPENAI_API_KEY,
  endpoint,
}: CreateChatCompletionOptions) => {
  // ============  0.创建 OpenAI 实例   ============ //

  const openai = createOpenAI(OPENAI_API_KEY, endpoint);

  // ============  1. 前置处理 messages   ============ //
  const { messages, ...params } = payload;

  const formatMessages = messages.map((m) => ({
    content: m.content,
    name: m.name,
    role: m.role,
  }));

  // ============  2. 发送请求   ============ //

  try {
    const response = await openai.chat.completions.create({
      messages: formatMessages,
      ...params,
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    // Check if the error is an APIError
    if (error instanceof OpenAI.APIError) {
      // 如果 await 超时报错，说明是 OpenAI 服务端的问题
      return createErrorResponse(ChatErrorType.OpenAIBizError, {
        endpoint: !!endpoint ? endpoint : undefined,
        error: error.error,
      });
    }

    // 如果不是，那么可能是其他接口端的响应，读 text 为结果
    return createErrorResponse(ChatErrorType.GatewayTimeout, {
      endpoint,
      error: JSON.stringify(error),
    });
  }
};
