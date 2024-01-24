import { OpenAISTTPayload } from '@lobehub/tts';
import { createOpenaiAudioTranscriptions } from '@lobehub/tts/server';
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
    const formData = await req.formData();
    const speechBlob = formData.get('speech') as Blob;
    const optionsString = formData.get('options') as string;
    const payload = {
      options: JSON.parse(optionsString),
      speech: speechBlob,
    } as OpenAISTTPayload;

    const openaiOrErrResponse = createBizOpenAI(req, payload.options.model);

    // if resOrOpenAI is a Response, it means there is an error,just return it
    if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

    const res = await createOpenaiAudioTranscriptions({ openai: openaiOrErrResponse, payload });

    return new Response(JSON.stringify(res), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  },
);
