import { OPENAI_API_KEY_HEADER_KEY, OPENAI_END_POINT } from '@/const/fetch';

import { createOpenAI } from './openai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  const apiKey = req.headers.get(OPENAI_API_KEY_HEADER_KEY);
  const endpoint = req.headers.get(OPENAI_END_POINT);

  const openAI = createOpenAI(apiKey, endpoint);

  const res = await openAI.models.list();

  const modelList = res.data.map((i) => i.id);

  return new Response(JSON.stringify(modelList));
}
