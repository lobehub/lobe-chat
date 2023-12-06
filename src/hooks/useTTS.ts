import { VoiceList } from '@lobehub/tts';
import {
  EdgeSpeechOptions,
  MicrosoftSpeechOptions,
  OpenAITTSOptions,
  useEdgeSpeech,
  useMicrosoftSpeech,
  useOpenAITTS,
} from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';
import { SWRConfiguration } from 'swr';

import { createHeaderWithOpenAI } from '@/services/_header';
import { OPENAI_URLS, TTS_URL } from '@/services/_url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { TTSServer } from '@/types/agent';

interface TTSConfig extends SWRConfiguration {
  onFinish?: (currentVoice: string, arraybuffers: ArrayBuffer[]) => void;
  server?: TTSServer;
  voice?: string;
}

export const useTTS = (content: string, config?: TTSConfig) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const voiceList = useGlobalStore((s) => new VoiceList(settingsSelectors.currentLanguage(s)));
  let useSelectedTTS;
  let options: any = {};
  let voice: string;
  switch (config?.server || ttsAgentSettings.ttsService) {
    case 'openai': {
      useSelectedTTS = useOpenAITTS;
      voice =
        config?.voice ||
        ttsAgentSettings.voice.openai ||
        (VoiceList.openaiVoiceOptions?.[0].value as string);
      options = {
        api: {
          headers: createHeaderWithOpenAI(),
          serviceUrl: OPENAI_URLS.tts,
        },
        options: {
          model: ttsSettings.openAI.ttsModel,
          voice,
        },
      } as OpenAITTSOptions;
      break;
    }
    case 'edge': {
      useSelectedTTS = useEdgeSpeech;
      voice =
        config?.voice ||
        ttsAgentSettings.voice.edge ||
        (voiceList.edgeVoiceOptions?.[0].value as string);
      options = {
        api: {
          /**
           * @description client fetch
           * serviceUrl: TTS_URL.edge,
           */
        },
        options: {
          voice,
        },
      } as EdgeSpeechOptions;
      break;
    }
    case 'microsoft': {
      useSelectedTTS = useMicrosoftSpeech;
      voice =
        config?.voice ||
        ttsAgentSettings.voice.microsoft ||
        (voiceList.microsoftVoiceOptions?.[0].value as string);
      options = {
        api: {
          serviceUrl: TTS_URL.microsoft,
        },
        options: {
          voice,
        },
      } as MicrosoftSpeechOptions;
      break;
    }
  }

  const response = useSelectedTTS(content, {
    ...config,
    ...options,
    onFinish: (arraybuffers) => {
      config?.onFinish?.(voice, arraybuffers);
    },
  });

  return {
    ...response,
    currentVoice: voice,
  };
};
