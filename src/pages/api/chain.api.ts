import { LangChainParams } from '@/types/langchain';

import { LangChainStream } from './LangChainStream';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI');
}

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const payload = (await request.json()) as LangChainParams;

  return new Response(LangChainStream(payload));
}
