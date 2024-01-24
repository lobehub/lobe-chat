import { NextAuthRequest } from 'next-auth/lib';

import { OpenAIImagePayload } from '@/types/openai/image';

import { auth } from '../../next-auth';
import { createBizOpenAI } from '../createBizOpenAI';
import { createImageGeneration } from './createImageGeneration';

export const runtime = 'edge';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = auth(
  async (
    req: NextAuthRequest,
    { params: _params }: { params: Record<string, string | string[] | undefined> },
  ) => {
    const payload = (await req.json()) as OpenAIImagePayload;

    const openaiOrErrResponse = createBizOpenAI(req, payload.model);
    // if resOrOpenAI is a Response, it means there is an error,just return it
    if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

    return createImageGeneration({ openai: openaiOrErrResponse, payload });
  },
);
