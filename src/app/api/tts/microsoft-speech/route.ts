import { handleMicrosoftSpeechRequest } from '@lobehub/tts/es/server';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const res = await handleMicrosoftSpeechRequest(req, { duplex: 'half' });

  return new Response(res.body, res);
};
