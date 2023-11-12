import {
  OpenaiSpeechRecognitionOptions,
  useOpenaiSTTWithPSR,
  useOpenaiSTTWithSR,
  usePersistedSpeechRecognition,
  useSpeechRecognition,
} from '@lobehub/tts';
import { ActionIcon, Icon } from '@lobehub/ui';
import { Button, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Mic, MicOff } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css, token }) => ({
  recording: css`
    width: 8px;
    height: 8px;
    background: ${token.colorError};
    border-radius: 50%;
  `,
}));

const STT = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const ttsConfig = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const settings = useGlobalStore(settingsSelectors.currentSettings, isEqual);
  const [locale, openAIAPI, openAIProxyUrl] = useGlobalStore((s) => [
    settingsSelectors.currentLanguage(s),
    settingsSelectors.openAIAPI(s),
    settingsSelectors.openAIProxyUrl(s),
  ]);
  const [loading, updateInputMessage] = useSessionStore((s) => [
    !!s.chatLoadingId,
    s.updateInputMessage,
  ]);

  const isPersisted = settings.tts.sttPersisted;
  const sttLocale =
    ttsConfig?.sttLocale && ttsConfig.sttLocale !== 'auto' ? ttsConfig.sttLocale : locale;

  let useSTT;
  let options: any = {};

  switch (settings.tts.sttServer) {
    case 'openai': {
      useSTT = isPersisted ? useOpenaiSTTWithPSR : useOpenaiSTTWithSR;
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
      useSTT = isPersisted ? usePersistedSpeechRecognition : useSpeechRecognition;
      break;
    }
  }

  const { start, isLoading, stop, formattedTime, time } = useSTT(sttLocale, {
    ...options,
    onTextChange: (text) => {
      if (loading) stop();
      if (text) {
        updateInputMessage(text);
      }
    },
  });

  const icon = isLoading ? MicOff : Mic;
  const Render: any = !mobile ? ActionIcon : Button;
  const iconRender: any = !mobile ? icon : <Icon icon={icon} />;
  const desc = t('stt.action');

  const triggerStartStop = useCallback(() => {
    if (loading) return;
    if (!isLoading) {
      start();
    } else {
      stop();
    }
  }, [loading, isLoading, start, stop]);

  return (
    <Dropdown
      menu={{
        activeKey: 'time',
        items: [
          {
            key: 'time',
            label: (
              <Flexbox align={'center'} gap={8} horizontal>
                <div className={styles.recording} />
                {time > 0 ? formattedTime : t('stt.loading')}
              </Flexbox>
            ),
          },
        ],
      }}
      placement={mobile ? 'topRight' : 'topCenter'}
      trigger={['click']}
      visible={isLoading}
    >
      <Render
        icon={iconRender}
        loading={isPersisted ? undefined : isLoading}
        onClick={triggerStartStop}
        placement={'bottom'}
        style={{ flex: 'none' }}
        title={desc}
      />
    </Dropdown>
  );
});

export default STT;
