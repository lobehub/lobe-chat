import { streamToResponse } from 'ai';
import { NextApiRequest, NextApiResponse } from 'next';
import { ChatCompletionRequestMessage } from 'openai-edge';

import { OpenAIStreamPayload } from '@/types/openai';

import pluginList from '../../plugins';
import { createChatCompletion, openai } from './openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = req.body as OpenAIStreamPayload;

  const stream = await createChatCompletion(payload, (payload) => ({
    experimental_onFunctionCall: async ({ name, arguments: args }, createFunctionCallMessages) => {
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
  }));

  return streamToResponse(stream, res);
}
