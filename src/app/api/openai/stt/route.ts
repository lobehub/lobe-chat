import { OpenAISTTPayload } from '@lobehub/tts';
import { createOpenaiAudioTranscriptions } from '@lobehub/tts/server';

import { getPreferredRegion } from '../../config';
import { createBizOpenAI } from '../createBizOpenAI';

export const runtime = 'edge';
export const preferredRegion = getPreferredRegion();

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const speechBlob = formData.get('speech') as Blob;
  const optionsString = formData.get('options') as string;
  const payload = {
    options: JSON.parse(optionsString),
    speech: speechBlob,
  } as OpenAISTTPayload;

  const openaiOrErrResponse = createBizOpenAI(req);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  const res = await createOpenaiAudioTranscriptions({ openai: openaiOrErrResponse, payload });

  return new Response(JSON.stringify(res), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
};
