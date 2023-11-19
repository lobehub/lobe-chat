import { getOpenAIAuthFromRequest } from '@/const/fetch';

import { createOpenai } from '../createBizOpenAI/createOpenai';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const { apiKey, endpoint } = getOpenAIAuthFromRequest(req);

  const openAI = createOpenai(apiKey, endpoint);

  const res = await openAI.models.list();

  const modelList = res.data.map((i) => i.id);

  return new Response(JSON.stringify(modelList));
};
