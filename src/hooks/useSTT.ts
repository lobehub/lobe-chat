// @ts-ignore
import {
  OpenaiSpeechRecognitionOptions,
  useOpenaiSTTWithPSR,
  useOpenaiSTTWithSR,
  usePersistedSpeechRecognition,
  useSpeechRecognition, // @ts-ignore
} from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';

import { OPENAI_URLS } from '@/services/_url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

export const useSTT = (onTextChange: (value: string) => void) => {
  const ttsConfig = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const [locale, openAIAPI, openAIProxyUrl] = useGlobalStore((s) => [
    settingsSelectors.currentLanguage(s),
    settingsSelectors.openAIAPI(s),
    settingsSelectors.openAIProxyUrl(s),
  ]);

  const isPersisted = ttsSettings.sttPersisted;
  const sttLocale =
    ttsConfig?.sttLocale && ttsConfig.sttLocale !== 'auto' ? ttsConfig.sttLocale : locale;

  let useSelectedSTT;
  let options: any = {};

  switch (ttsSettings.sttServer) {
    case 'openai': {
      useSelectedSTT = isPersisted ? useOpenaiSTTWithPSR : useOpenaiSTTWithSR;
      options = {
        api: {
          key: openAIAPI,
          proxy: openAIProxyUrl,
          url: OPENAI_URLS.stt,
        },
        model: ttsSettings.openAI.sttModel,
      } as OpenaiSpeechRecognitionOptions;
      break;
    }
    case 'browser': {
      useSelectedSTT = isPersisted ? usePersistedSpeechRecognition : useSpeechRecognition;
      break;
    }
  }

  return useSelectedSTT(sttLocale, {
    ...options,
    onTextChange,
  });
};
