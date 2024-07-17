import { OpenAITTSPayload } from '@lobehub/tts';
import { createOpenaiAudioSpeech } from '@lobehub/tts/server';


import { createBizOpenAI } from '@/app/api/openai/createBizOpenAI';

export const runtime = 'edge';



export const POST = async (req: Request) => {
  const payload = (await req.json()) as OpenAITTSPayload;

  const openaiOrErrResponse = createBizOpenAI(req);

  // if resOrOpenAI is a Response, it means there is an error,just return it
  if (openaiOrErrResponse instanceof Response) return openaiOrErrResponse;

  return await createOpenaiAudioSpeech({ openai: openaiOrErrResponse, payload });
};

export {openAiPreferredRegion as preferredRegion} from '@/app/api/openai/config';