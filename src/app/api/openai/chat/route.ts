import { NextAuthRequest } from 'next-auth/lib';

import { OpenAIChatStreamPayload } from '@/types/openai/chat';

import { getPreferredRegion } from '../../config';
import { auth } from '../../next-auth';
import { createBizOpenAI } from '../createBizOpenAI';
import { createChatCompletion } from './createChatCompletion';

export const runtime = 'edge';
export const preferredRegion = getPreferredRegion();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = auth(
  async (
    req: NextAuthRequest,
    { params: _params }: { params: Record<string, string | string[] | undefined> },
  ) => {
    const payload = (await req.json()) as OpenAIChatStreamPayload;

    const openaiOrErrResponse = createBizOpenAI(req, payload.model);

    // if resOrOpenAI is a Response, it means there is an error,just return it
    if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

    return createChatCompletion({ openai: openaiOrErrResponse, payload });
  },
);
