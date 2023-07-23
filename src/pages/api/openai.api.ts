import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { ChatCompletionFunctions, ChatCompletionRequestMessage } from 'openai-edge/types/api';

import { OpenAIStreamPayload } from '@/types/openai';

import { plugins } from './plugins';

export const runtime = 'edge';

const isDev = process.env.NODE_ENV === 'development';
const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config, isDev && OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined);

const functions: ChatCompletionFunctions[] = plugins.map((f) => f.schema);

export default async function handler(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages, ...params } = (await req.json()) as OpenAIStreamPayload;

  const formatMessages = messages.map((m) => ({ content: m.content, role: m.role }));

  const response = await openai.createChatCompletion({
    functions,
    messages: formatMessages,
    stream: true,
    ...params,
  });

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async ({ name, arguments: args }, createFunctionCallMessages) => {
      const func = plugins.find((f) => f.name === name);

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
