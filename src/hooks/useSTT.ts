import { getRecordMineType } from '@lobehub/tts';
import {
  OpenAISTTOptions,
  SpeechRecognitionOptions,
  useOpenAISTT,
  useSpeechRecognition,
} from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';
import { SWRConfiguration } from 'swr';

import { createHeaderWithOpenAI } from '@/services/_header';
import { OPENAI_URLS } from '@/services/_url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

interface STTConfig extends SWRConfiguration {
  onTextChange: (value: string) => void;
}

export const useSTT = (config: STTConfig) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const locale = useGlobalStore(settingsSelectors.currentLanguage);

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
          headers: createHeaderWithOpenAI(),
          serviceUrl: OPENAI_URLS.stt,
        },
        autoStop,
        options: {
          mineType: getRecordMineType(),
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

  return useSelectedSTT(sttLocale, { ...config, ...options });
};
