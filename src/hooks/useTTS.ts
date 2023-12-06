import {
  EdgeSpeechOptions,
  MicrosoftSpeechOptions,
  OpenAITTSOptions,
  TTSOptions,
  useEdgeSpeech,
  useMicrosoftSpeech,
  useOpenAITTS,
} from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';

import { createHeaderWithOpenAI } from '@/services/_header';
import { OPENAI_URLS, TTS_URL } from '@/services/_url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { TTSServer } from '@/types/agent';

interface TTSConfig extends TTSOptions {
  onUpload?: (currentVoice: string, arraybuffers: ArrayBuffer[]) => void;
  server?: TTSServer;
  voice?: string;
}

export const useTTS = (content: string, config?: TTSConfig) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const lang = useGlobalStore(settingsSelectors.currentLanguage);
  const voice = useSessionStore(agentSelectors.currentAgentTTSVoice(lang));
  let useSelectedTTS;
  let options: any = {};
  switch (config?.server || ttsAgentSettings.ttsService) {
    case 'openai': {
      useSelectedTTS = useOpenAITTS;
      options = {
        api: {
          headers: createHeaderWithOpenAI(),
          serviceUrl: OPENAI_URLS.tts,
        },
        options: {
          model: ttsSettings.openAI.ttsModel,
          voice: config?.voice || voice,
        },
      } as OpenAITTSOptions;
      break;
    }
    case 'edge': {
      useSelectedTTS = useEdgeSpeech;
      options = {
        api: {
          /**
           * @description client fetch
           * serviceUrl: TTS_URL.edge,
           */
        },
        options: {
          voice: config?.voice || voice,
        },
      } as EdgeSpeechOptions;
      break;
    }
    case 'microsoft': {
      useSelectedTTS = useMicrosoftSpeech;
      options = {
        api: {
          serviceUrl: TTS_URL.microsoft,
        },
        options: {
          voice: config?.voice || voice,
        },
      } as MicrosoftSpeechOptions;
      break;
    }
  }

  return useSelectedTTS(content, {
    ...config,
    ...options,
    onFinish: (arraybuffers) => {
      config?.onUpload?.(options.voice || 'alloy', arraybuffers);
    },
  });
};
