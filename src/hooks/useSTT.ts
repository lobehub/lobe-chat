import {
  OpenAISTTOptions,
  SpeechRecognitionOptions,
  useOpenAISTT,
  useSpeechRecognition,
} from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';

import { OPENAI_URLS } from '@/services/_url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

export const useSTT = (onTextChange: (value: string) => void) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const [locale, openAIAPI, openAIProxyUrl] = useGlobalStore((s) => [
    settingsSelectors.currentLanguage(s),
    settingsSelectors.openAIAPI(s),
    settingsSelectors.openAIProxyUrl(s),
  ]);

  const autoStop = ttsSettings.sttAutoStop;
  const sttLocale =
    ttsAgentSettings?.sttLocale && ttsAgentSettings.sttLocale !== 'auto'
      ? ttsAgentSettings.sttLocale
      : locale;

  let useSelectedSTT;
  let options: any = {};

  switch (ttsSettings.sttServer) {
    case 'openai': {
      useSelectedSTT = useOpenAISTT;
      options = {
        api: {
          apiKey: openAIAPI,
          backendUrl: OPENAI_URLS.stt,
          baseUrl: openAIProxyUrl,
        },
        autoStop,
        options: {
          model: ttsSettings.openAI.sttModel,
        },
      } as OpenAISTTOptions;
      break;
    }
    case 'browser': {
      options = {
        autoStop,
      } as SpeechRecognitionOptions;
      useSelectedSTT = useSpeechRecognition;
      break;
    }
  }

  return useSelectedSTT(sttLocale, { onTextChange, ...options });
};
