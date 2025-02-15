import { EdgeSpeechPayload, EdgeSpeechTTS } from '@lobehub/tts';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as EdgeSpeechPayload;

  return await EdgeSpeechTTS.createRequest({ payload });
};
