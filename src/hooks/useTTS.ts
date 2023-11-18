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

import { OPENAI_URLS, TTS_URL } from '@/services/_url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

export const useTTS = (content: string, config?: SWRConfiguration) => {
  const ttsSettings = useGlobalStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const [voiceList, openAIAPI, openAIProxyUrl] = useGlobalStore((s) => {
    const locale = settingsSelectors.currentLanguage(s);
    return [
      new VoiceList(locale),
      settingsSelectors.openAIAPI(s),
      settingsSelectors.openAIProxyUrl(s),
    ];
  });

  let useSelectedTTS;
  let options: any = {};
  switch (ttsAgentSettings.ttsService) {
    case 'openai': {
      useSelectedTTS = useOpenAITTS;
      options = {
        api: {
          apiKey: openAIAPI,
          backendUrl: OPENAI_URLS.tts,
          baseUrl: openAIProxyUrl,
        },
        options: {
          model: ttsSettings.openAI.ttsModel,
          voice: ttsAgentSettings.voice.openai || VoiceList.openaiVoiceOptions?.[0].value,
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
           * backendUrl: TTS_URL.edge,
           */
        },
        options: {
          voice: ttsAgentSettings.voice.edge || voiceList.edgeVoiceOptions?.[0].value,
        },
      } as EdgeSpeechOptions;
      break;
    }
    case 'microsoft': {
      useSelectedTTS = useMicrosoftSpeech;
      options = {
        api: {
          backendUrl: TTS_URL.microsoft,
        },
        options: {
          voice: ttsAgentSettings.voice.microsoft || voiceList.microsoftVoiceOptions?.[0].value,
        },
      } as MicrosoftSpeechOptions;
      break;
    }
  }

  return useSelectedTTS(content, {
    ...config,
    ...options,
  });
};
