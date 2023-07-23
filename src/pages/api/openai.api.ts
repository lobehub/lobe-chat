import { StreamingTextResponse } from 'ai';

import { OpenAIStreamPayload } from '@/types/openai';

import { createChatCompletion } from './openai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const payload = (await req.json()) as OpenAIStreamPayload;

  const stream = await createChatCompletion(payload);

  return new StreamingTextResponse(stream);
}
