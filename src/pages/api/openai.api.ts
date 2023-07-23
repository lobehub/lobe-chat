import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { ChatCompletionFunctions, ChatCompletionRequestMessage } from 'openai-edge/types/api';

import { OpenAIStreamPayload } from '@/types/openai';

import pluginList from '../../plugins';

export const runtime = 'edge';

const isDev = process.env.NODE_ENV === 'development';
const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config, isDev && OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined);

export default async function handler(req: Request) {
  const {
    messages,
    plugins: enabledPlugins,
    ...params
  } = (await req.json()) as OpenAIStreamPayload;

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

  const response = await openai.createChatCompletion({
    functions,
    messages: formatMessages,
    stream: true,
    ...params,
  });

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async ({ name, arguments: args }, createFunctionCallMessages) => {
      console.log(`执行 functionCall [${name}]`, 'args:', args);

      const func = pluginList.find((f) => f.name === name);

      if (func) {
        const result = await func.runner(args as any);

        const newMessages = createFunctionCallMessages(result) as ChatCompletionRequestMessage[];

        return openai.createChatCompletion({
          functions,
          messages: [...formatMessages, ...newMessages],
          stream: true,
          ...params,
        });
      }
    },
  });

  return new StreamingTextResponse(stream);
}
