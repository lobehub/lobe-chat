import { StreamingTextResponse } from 'ai';

import { OPENAI_API_KEY_HEADER_KEY } from '@/const/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

import { createChatCompletion } from './openai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const payload = (await req.json()) as OpenAIStreamPayload;
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);

  const stream = await createChatCompletion({ OPENAI_API_KEY: apiKey, payload });

  return new StreamingTextResponse(stream);
}
