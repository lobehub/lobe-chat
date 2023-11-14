import OpenAI from 'openai';

import { OpenAIImagePayload } from '@/types/openai/image';

export const createImageGeneration = async ({
  openai,
  payload,
}: {
  openai: OpenAI;
  payload: OpenAIImagePayload;
}) => {
  const res = await openai.images.generate({ ...payload, response_format: 'url' });

  const urls = res.data.map((o) => o.url) as string[];

  return new Response(JSON.stringify(urls));
};
