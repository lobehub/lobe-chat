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
import { ActionIcon } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { TrashIcon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MICROSOFT_SPEECH_PROXY_URL } from '@/const/url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agentConfig';
import { ChatTTS } from '@/types/chatMessage';

interface TTSProps extends ChatTTS {
  content: string;
  id: string;
  loading?: boolean;
}

const TTS = memo<TTSProps>(({ id, init, content }) => {
  const [isStart, setIsStart] = useState(false);
  const [ttsMessage, clearTTS, toggleChatLoading] = useSessionStore((s) => [
    s.ttsMessage,
    s.clearTTS,
    s.toggleChatLoading,
  ]);
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
      options = {
        api: {
          key: openAIAPI,
          proxy: openAIProxyUrl,
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
        api: {
          proxy: MICROSOFT_SPEECH_PROXY_URL,
        },
        name: ttsConfig.voice.microsoft || getAzureVoiceOptions(locale)?.[0].value,
      } as MicrosoftSpeechOptions;
      break;
    }
  }

  const { isGlobalLoading, audio, start } = useTTS(content, options);

  useEffect(() => {
    if (!init && !isStart) {
      start();
      setIsStart(true);
    }
  }, [init]);

  useEffect(() => {
    if (audio?.duration > 0) {
      ttsMessage(id, true);
    }
  }, [audio?.duration]);

  useEffect(() => {
    toggleChatLoading(isGlobalLoading, id);
  }, [isGlobalLoading]);

  return (
    <Flexbox align={'center'} horizontal style={{ minWidth: 160 }}>
      <AudioPlayer
        audio={audio}
        buttonSize={'small'}
        isLoading={isGlobalLoading}
        onInitPlay={() => {
          if (isStart) return;
          start();
          setIsStart(true);
        }}
        timeRender={'tag'}
        timeStyle={{ margin: 0 }}
      />
      <ActionIcon
        icon={TrashIcon}
        onClick={() => {
          clearTTS(id);
        }}
        size={'small'}
      />
    </Flexbox>
  );
});

export default TTS;
