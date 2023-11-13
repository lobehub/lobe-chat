import { fetchMicrosoftSpeech } from '@/services/tts';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  return await fetchMicrosoftSpeech(req);
};
