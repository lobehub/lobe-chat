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
  };

  // a bug with openai: https://github.com/openai/openai-node/issues/283
  // TODO: should refactor when openai fix the bug
  if (baseURL) {
    config.baseURL = baseURL;
  }

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
    // Check if the error is an OpenAI APIError
    if (error instanceof OpenAI.APIError) {
      return createErrorResponse(ChatErrorType.OpenAIBizError, {
        endpoint: !!endpoint ? endpoint : undefined,
        error: error.error ?? error.cause,
      });
    }

    // track the error that not an OpenAI APIError
    console.error(error);

    // return as a GatewayTimeout error
    return createErrorResponse(ChatErrorType.InternalServerError, {
      endpoint,
      error: JSON.stringify(error),
    });
  }
};
