import { OpenAIStream, OpenAIStreamCallbacks, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { ChatCompletionFunctions } from 'openai-edge/types/api';

import { getServerConfig } from '@/config/server';
import { createErrorResponse } from '@/pages/api/error';
import { PluginsMap } from '@/plugins';
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

  const { messages, plugins: enabledPlugins, ...params } = payload;

  // ============  1. 前置处理 functions   ============ //

  const filterFunctions: ChatCompletionFunctions[] = Object.values(PluginsMap)
    .filter((p) => {
      // 如果不存在 enabledPlugins，那么全部不启用
      if (!enabledPlugins) return false;

      // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
      return enabledPlugins.includes(p.name);
    })
    .map((f) => f.schema);

  const functions = filterFunctions.length === 0 ? undefined : filterFunctions;

  // ============  2. 前置处理 messages   ============ //
  const formatMessages = messages.map((m) => ({
    content: m.content,
    name: m.name,
    role: m.role,
  }));

  // ============  3. 发送请求   ============ //

  const requestParams = { functions, messages: formatMessages, stream: true, ...params };

  try {
    const response = await openai.createChatCompletion(requestParams);

    if (!response.ok) {
      const error = await response.json();

      return createErrorResponse(ErrorType.OpenAIBizError, error);
    }

    const stream = OpenAIStream(response, callbacks?.(requestParams));

    return new StreamingTextResponse(stream);
  } catch (error) {
    // 如果 await 超时报错，说明是 OpenAI 服务端的问题
    return createErrorResponse(ErrorType.GatewayTimeout, { message: error });
  }
};
