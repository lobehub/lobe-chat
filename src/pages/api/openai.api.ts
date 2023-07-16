import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

import { OpenAIStreamPayload } from '@/types/openai';

const isDev = process.env.NODE_ENV === 'development';
const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL;

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config, isDev && OPENAI_PROXY_URL ? OPENAI_PROXY_URL : undefined);

export const runtime = 'edge';

export default async function handler(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages, ...params } = (await req.json()) as OpenAIStreamPayload;

  console.log(params);
  const response = await openai.createChatCompletion({
    stream: true,
    ...params,
    messages: messages.map((m) => ({ content: m.content, role: m.role })),
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
