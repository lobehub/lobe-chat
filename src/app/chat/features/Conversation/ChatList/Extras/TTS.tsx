import {
  AudioPlayer,
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
import { memo } from 'react';

import { MICROSOFT_SPEECH_PROXY_URL } from '@/const/url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';

interface TTSProps {
  content: string;
  id: string;
  loading?: boolean;
}

const TTS = memo<TTSProps>(({ content }) => {
  const ttsConfig = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const [locale, openAIAPI, openAIProxyUrl] = useGlobalStore((s) => [
    settingsSelectors.currentLanguage(s),
    settingsSelectors.openAIAPI(s),
    settingsSelectors.openAIProxyUrl(s),
  ]);

  let useTTS;
  let options: any = {};
  switch (ttsConfig.ttsService) {
    case 'openai': {
      useTTS = useOpenaiTTS;
      // @ts-ignore
      options = {
        api: {
          key: openAIAPI,
          proxyUrl: openAIProxyUrl,
        },
        name: ttsConfig.voice.openai,
      } as OpenaiTtsOptions;
      break;
    }
    case 'edge': {
      useTTS = useEdgeSpeech;
      options = {
        name: ttsConfig.voice.edge || getEdgeVoiceOptions(locale)?.[0].value,
      } as EdgeSpeechOptions;
      break;
    }
    case 'microsoft': {
      useTTS = useMicrosoftSpeech;
      options = {
        api: MICROSOFT_SPEECH_PROXY_URL,
        name: ttsConfig.voice.microsoft || getAzureVoiceOptions(locale)?.[0].value,
      } as MicrosoftSpeechOptions;
      break;
    }
  }

  const { isGlobalLoading, audio, start } = useTTS(content, options);

  return (
    <div>
      <AudioPlayer audio={audio} isLoading={isGlobalLoading} onInitPlay={start} />
    </div>
  );
});

export default TTS;
