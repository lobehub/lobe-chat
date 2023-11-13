import { handleMicrosoftSpeechRequest } from '@lobehub/tts/es/server';

export const fetchMicrosoftSpeech = async (req: Request) => {
  return await handleMicrosoftSpeechRequest(req, { duplex: 'half' });
};
