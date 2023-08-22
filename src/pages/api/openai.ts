import { OpenAIStream, OpenAIStreamCallbacks, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

import { getServerConfig } from '@/config/server';
import { createErrorResponse } from '@/pages/api/error';
import { ErrorType } from '@/types/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

// 创建 OpenAI 实例
export const createOpenAI = (userApiKey: string | null, endpoint?: string | null) => {
  const { OPENAI_API_KEY, OPENAI_PROXY_URL } = getServerConfig();

  const config = new Configuration({
    apiKey: !userApiKey ? OPENAI_API_KEY : userApiKey,
  });

  const basePath = endpoint ? endpoint : OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined;

  return new OpenAIApi(config, basePath);
};

interface CreateChatCompletionOptions {
  OPENAI_API_KEY: string | null;
  callbacks?: (payload: OpenAIStreamPayload) => OpenAIStreamCallbacks;
  endpoint?: string | null;
  payload: OpenAIStreamPayload;
}

export const createChatCompletion = async ({
  payload,
  callbacks,
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

  const requestParams = { messages: formatMessages, stream: true, ...params };

  let response: Response;

  try {
    response = await openai.createChatCompletion(requestParams);
  } catch (error) {
    // 如果 await 超时报错，说明是 OpenAI 服务端的问题
    return createErrorResponse(ErrorType.GatewayTimeout, { message: error });
  }

  // ============  4. 处理异常响应   ============ //
  if (!response.ok) {
    let error;

    try {
      // 正常情况下应该是 OpenAI 的 JSON
      error = await response.clone().json();
    } catch {
      // 如果不是 JSON，那么可能是其他接口端的响应，读 text 为结果
      const result = await response.text();

      error = { message: result };
    }

    return createErrorResponse(ErrorType.OpenAIBizError, { ...error, endpoint });
  }

  // ============  5. 发送正常相应   ============ //

  const stream = OpenAIStream(response, callbacks?.(requestParams));

  return new StreamingTextResponse(stream);
};
