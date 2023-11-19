import { OpenAISTTPayload } from '@lobehub/tts';
import { createOpenaiAudioTranscriptions } from '@lobehub/tts/server';

import { createBizOpenAI } from '../createBizOpenAI';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAISTTPayload;

  const openaiOrErrResponse = createBizOpenAI(req, payload.options.model);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  const res = await createOpenaiAudioTranscriptions({ openai: openaiOrErrResponse, payload });

  return new Response(JSON.stringify(res), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
};
