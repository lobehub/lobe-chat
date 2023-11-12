import {
  OpenaiSpeechRecognitionOptions,
  useOpenaiSTTWithPSR,
  useOpenaiSTTWithSR,
  usePersistedSpeechRecognition,
  useSpeechRecognition,
} from '@lobehub/tts';
import isEqual from 'fast-deep-equal';

import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

export const useSTT = (onTextChange: (value: string) => void) => {
  const ttsConfig = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const [locale, openAIAPI, openAIProxyUrl] = useGlobalStore((s) => [
    settingsSelectors.currentLanguage(s),
    settingsSelectors.openAIAPI(s),
    settingsSelectors.openAIProxyUrl(s),
  ]);

  const isPersisted = settings.tts.sttPersisted;
  const sttLocale =
    ttsConfig?.sttLocale && ttsConfig.sttLocale !== 'auto' ? ttsConfig.sttLocale : locale;

  let useSelectedSTT;
  let options: any = {};

  switch (settings.tts.sttServer) {
    case 'openai': {
      useSelectedSTT = isPersisted ? useOpenaiSTTWithPSR : useOpenaiSTTWithSR;
      options = {
        api: {
          key: openAIAPI,
          proxy: openAIProxyUrl,
        },
        model: settings.tts.openAI.sttModel,
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
