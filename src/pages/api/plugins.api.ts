import { StreamingTextResponse } from 'ai';
import { ChatCompletionRequestMessage } from 'openai-edge';

import { OpenAIStreamPayload } from '@/types/openai';

import pluginList from '../../plugins';
import { createChatCompletion, openai } from './openai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const payload = (await req.json()) as OpenAIStreamPayload;

  const stream = await createChatCompletion(payload, (payload) => ({
    experimental_onFunctionCall: async ({ name, arguments: args }, createFunctionCallMessages) => {
      console.log(`执行 functionCall [${name}]`, 'args:', args);

      const func = pluginList.find((f) => f.name === name);

      if (func) {
        const result = await func.runner(args as any);

        const newMessages = createFunctionCallMessages(result) as ChatCompletionRequestMessage[];

        return openai.createChatCompletion({
          ...payload,
          messages: [...payload.messages, ...newMessages],
        });
      }
    },
  }));

  return new StreamingTextResponse(stream);
}
