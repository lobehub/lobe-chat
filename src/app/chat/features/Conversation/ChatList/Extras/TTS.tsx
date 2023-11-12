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
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const TTS = memo<TTSProps>(({ id, init, content, loading }) => {
  const [isStart, setIsStart] = useState(false);
  const { t } = useTranslation('chat');
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

  const handleInitStart = useCallback(() => {
    if (isStart) return;
    start();
    setIsStart(true);
  }, [isStart]);

  useEffect(() => {
    if (init) return;
    handleInitStart();
    ttsMessage(id, true);
  }, [init]);

  useEffect(() => {
    if (isGlobalLoading === undefined) return;
    if (isGlobalLoading && !loading) toggleChatLoading(true, id);
    if (!isGlobalLoading && loading) toggleChatLoading(false);
  }, [isGlobalLoading, loading]);

  return (
    <Flexbox align={'center'} horizontal style={{ minWidth: 160 }}>
      <AudioPlayer
        audio={audio}
        buttonSize={'small'}
        isLoading={isGlobalLoading}
        onInitPlay={handleInitStart}
        timeRender={'tag'}
        timeStyle={{ margin: 0 }}
      />
      <ActionIcon
        icon={TrashIcon}
        onClick={() => {
          clearTTS(id);
        }}
        size={'small'}
        title={t('tts.clear')}
      />
    </Flexbox>
  );
});

export default TTS;
