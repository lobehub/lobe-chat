import { OpenAIStream, OpenAIStreamCallbacks } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { ChatCompletionFunctions } from 'openai-edge/types/api';

import { OpenAIStreamPayload } from '@/types/openai';

import pluginList from '../../plugins';

const isDev = process.env.NODE_ENV === 'development';
const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

// 创建 OpenAI 实例
export const createOpenAI = (OPENAI_API_KEY: string | null) => {
  const config = new Configuration({
    apiKey: OPENAI_API_KEY ?? process.env.OPENAI_API_KEY,
  });

  return new OpenAIApi(config, isDev && OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined);
};

interface CreateChatCompletionOptions {
  OPENAI_API_KEY: string | null;
  callbacks?: (payload: OpenAIStreamPayload) => OpenAIStreamCallbacks;
  payload: OpenAIStreamPayload;
}

export const createChatCompletion = async ({
  payload,
  callbacks,
  OPENAI_API_KEY,
}: CreateChatCompletionOptions) => {
  // ============  0.创建 OpenAI 实例   ============ //

  const openai = createOpenAI(OPENAI_API_KEY);

  const { messages, plugins: enabledPlugins, ...params } = payload;

  // ============  1. 前置处理 functions   ============ //

  const filterFunctions: ChatCompletionFunctions[] = pluginList
    .filter((p) => {
      // 如果不存在 enabledPlugins，那么全部不启用
      if (!enabledPlugins) return false;

      // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
      return enabledPlugins.includes(p.name);
    })
    .map((f) => f.schema);

  const functions = filterFunctions.length === 0 ? undefined : filterFunctions;

  // ============  2. 前置处理 messages   ============ //
  const formatMessages = messages.map((m) => ({ content: m.content, role: m.role }));

  // ============  3. 发送请求   ============ //

  const requestParams = { functions, messages: formatMessages, stream: true, ...params };

  const response = await openai.createChatCompletion(requestParams);

  return OpenAIStream(response, callbacks?.(requestParams));
};
