import { GlobalTTSConfig } from '@/types/settings';

export const DEFAULT_TTS_CONFIG: GlobalTTSConfig = {
  openAI: {
    sttModel: 'whisper-1',
    ttsModel: 'tts-1',
  },
  sttAutoStop: true,
  sttServer: 'openai',
};
