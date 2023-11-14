import { OpenAIImagePayload } from '@/types/openai/image';

import { createBizOpenAI } from '../createBizOpenAI';
import { createImageGeneration } from './createImageGeneration';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAIImagePayload;

  const openaiOrErrResponse = createBizOpenAI(req, payload.model);
  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return createImageGeneration({ openai: openaiOrErrResponse, payload });
};
