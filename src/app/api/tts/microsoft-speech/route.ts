import { handleMicrosoftSpeechRequest } from '@lobehub/tts/es/server';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  return await handleMicrosoftSpeechRequest(req, { duplex: 'half' });
};
