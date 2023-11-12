import {
  EdgeSpeechOptions,
  MicrosoftSpeechOptions,
  OpenaiTtsOptions,
  getAzureVoiceOptions,
  getEdgeVoiceOptions,
  useEdgeSpeech,
  useMicrosoftSpeech,
  useOpenaiTTS,
} from '@lobehub/tts';
import isEqual from 'fast-deep-equal';

import { MICROSOFT_SPEECH_PROXY_URL } from '@/const/url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

export const useTTS = (content: string) => {
  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
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
        },
        model: settings.tts.openAI.ttsModel,
        name: ttsConfig.voice.openai,
      } as OpenaiTtsOptions;
      break;
    }
    case 'edge': {
      useSelectedTTS = useEdgeSpeech;
      options = {
        name: ttsConfig.voice.edge || getEdgeVoiceOptions(locale)?.[0].value,
      } as EdgeSpeechOptions;
      break;
    }
    case 'microsoft': {
      useSelectedTTS = useMicrosoftSpeech;
      options = {
        api: {
          proxy: MICROSOFT_SPEECH_PROXY_URL,
        },
        name: ttsConfig.voice.microsoft || getAzureVoiceOptions(locale)?.[0].value,
      } as MicrosoftSpeechOptions;
      break;
    }
  }

  return useSelectedTTS(content, options);
};
