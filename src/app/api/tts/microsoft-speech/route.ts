import { handleMicrosoftSpeechRequest } from '@lobehub/tts/es/server';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  // @ts-ignore
  const res = await handleMicrosoftSpeechRequest(new Request(req.url, { ...req, duplex: 'half' }));

  return new Response(res.body, res);
};
