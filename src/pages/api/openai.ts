import { OpenAIStream, OpenAIStreamCallbacks } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { ChatCompletionFunctions } from 'openai-edge/types/api';

import { OpenAIStreamPayload } from '@/types/openai';

import pluginList from '../../plugins';

const isDev = process.env.NODE_ENV === 'development';
const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(
  config,
  isDev && OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined,
);

export const createChatCompletion = async (
  payload: OpenAIStreamPayload,
  callbacks?: (payload: OpenAIStreamPayload) => OpenAIStreamCallbacks,
) => {
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

  const requestParams = { functions, messages: formatMessages, stream: true, ...params };

  const response = await openai.createChatCompletion(requestParams);

  return OpenAIStream(response, callbacks?.(requestParams));
};
