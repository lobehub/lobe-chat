import {
  EdgeSpeechOptions,
  MicrosoftSpeechOptions,
  OpenaiTtsOptions,
  getAzureVoiceOptions,
  getEdgeVoiceOptions,
  useEdgeSpeech,
  useMicrosoftSpeech,
  useOpenaiTTS, // @ts-ignore
} from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';

import { OPENAI_URLS, TTS_URL } from '@/services/_url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

export const useTTS = (content: string) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsConfig = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const [locale, openAIAPI, openAIProxyUrl] = useGlobalStore((s) => [
    settingsSelectors.currentLanguage(s),
    settingsSelectors.openAIAPI(s),
    settingsSelectors.openAIProxyUrl(s),
  ]);

  let useSelectedTTS;
  let options: any = {};
  switch (ttsConfig.ttsService) {
    case 'openai': {
      useSelectedTTS = useOpenaiTTS;
      options = {
        api: {
          key: openAIAPI,
          proxy: openAIProxyUrl,
          url: OPENAI_URLS.tts,
        },
        model: ttsSettings.openAI.ttsModel,
        name: ttsConfig.voice.openai,
      } as OpenaiTtsOptions;
      break;
    }
    case 'edge': {
      useSelectedTTS = useEdgeSpeech;
      options = {
        api: {
          url: TTS_URL.edge,
        },
        name: ttsConfig.voice.edge || getEdgeVoiceOptions(locale)?.[0].value,
      } as EdgeSpeechOptions;
      break;
    }
    case 'microsoft': {
      useSelectedTTS = useMicrosoftSpeech;
      options = {
        api: {
          url: TTS_URL.microsoft,
        },
        name: ttsConfig.voice.microsoft || getAzureVoiceOptions(locale)?.[0].value,
      } as MicrosoftSpeechOptions;
      break;
    }
  }

  return useSelectedTTS(content, options);
};
