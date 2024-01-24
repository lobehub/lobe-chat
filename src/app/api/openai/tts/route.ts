import { OpenAITTSPayload } from '@lobehub/tts';
import { createOpenaiAudioSpeech } from '@lobehub/tts/server';
import { NextAuthRequest } from 'next-auth/lib';

import { getPreferredRegion } from '../../config';
import { auth } from '../../next-auth';
import { createBizOpenAI } from '../createBizOpenAI';

export const runtime = 'edge';
export const preferredRegion = getPreferredRegion();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = auth(
  async (
    req: NextAuthRequest,
    { params: _params }: { params: Record<string, string | string[] | undefined> },
  ) => {
    const payload = (await req.json()) as OpenAITTSPayload;

    const openaiOrErrResponse = createBizOpenAI(req, payload.options.model);

    // if resOrOpenAI is a Response, it means there is an error,just return it
    if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

    return await createOpenaiAudioSpeech({ openai: openaiOrErrResponse, payload });
  },
);
