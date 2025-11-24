import { OpenAITTSPayload } from '@lobehub/tts';
import { createOpenaiAudioSpeech } from '@lobehub/tts/server';

import { createBizOpenAI } from '@/app/(backend)/_deprecated/createBizOpenAI';

export const runtime = 'edge';

export const preferredRegion = [
  'arn1',
  'bom1',
  'cdg1',
  'cle1',
  'cpt1',
  'dub1',
  'fra1',
  'gru1',
  'hnd1',
  'iad1',
  'icn1',
  'kix1',
  'lhr1',
  'pdx1',
  'sfo1',
  'sin1',
  'syd1',
];

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAITTSPayload;

  // need to be refactored with jwt auth mode
  const openaiOrErrResponse = createBizOpenAI(req);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return await createOpenaiAudioSpeech({ openai: openaiOrErrResponse as any, payload });
};
