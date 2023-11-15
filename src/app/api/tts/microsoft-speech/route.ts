import { MicrosoftSpeechPayload, createMicrosoftSpeechComletion } from '@lobehub/tts';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as MicrosoftSpeechPayload;
  const res = await createMicrosoftSpeechComletion({ payload });
  return res;
};
