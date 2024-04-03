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
import { API_ENDPOINTS } from '@/services/_url';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

interface STTConfig extends SWRConfiguration {
  onTextChange: (value: string) => void;
}

export const useOpenaiSTT = (config: STTConfig) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const locale = useGlobalStore(settingsSelectors.currentLanguage);

  const autoStop = ttsSettings.sttAutoStop;
  const sttLocale =
    ttsAgentSettings?.sttLocale && ttsAgentSettings.sttLocale !== 'auto'
      ? ttsAgentSettings.sttLocale
      : locale;

  return useOpenAISTT(sttLocale, {
        ...config,
        api: {
          headers: createHeaderWithOpenAI(),
          serviceUrl: API_ENDPOINTS.stt,
        },
        autoStop,
        options: {
          mineType: getRecordMineType(),
          model: ttsSettings.openAI.sttModel,
        },
      } as OpenAISTTOptions)
}

export const useBrowserSTT = (config: STTConfig) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const locale = useGlobalStore(settingsSelectors.currentLanguage);

  const autoStop = ttsSettings.sttAutoStop;
  const sttLocale =
    ttsAgentSettings?.sttLocale && ttsAgentSettings.sttLocale !== 'auto'
      ? ttsAgentSettings.sttLocale
      : locale;

  return useSpeechRecognition(sttLocale, {
        ...config,
        autoStop,
      } as SpeechRecognitionOptions)
} 