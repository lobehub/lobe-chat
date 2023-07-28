import { ChatCompletionRequestMessage } from 'openai-edge';

import { OPENAI_API_KEY_HEADER_KEY } from '@/const/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

import pluginList from '../../plugins';
import { createChatCompletion, createOpenAI } from './openai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const payload = (await req.json()) as OpenAIStreamPayload;
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);

  const openai = createOpenAI(apiKey);

  return await createChatCompletion({
    OPENAI_API_KEY: apiKey,
    callbacks: (payload) => ({
      experimental_onFunctionCall: async (
        { name, arguments: args },
        createFunctionCallMessages,
      ) => {
        console.log(`检测到 functionCall: ${name}`);

        const func = pluginList.find((f) => f.name === name);

        if (func) {
          const result = await func.runner(args as any);

          console.log(`[${name}]`, args, `result:`, JSON.stringify(result, null, 2));

          const newMessages = createFunctionCallMessages(result) as ChatCompletionRequestMessage[];

          return openai.createChatCompletion({
            ...payload,
            messages: [...payload.messages, ...newMessages],
          });
        }
      },
    }),
    payload,
  });
}
