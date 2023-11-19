import { AudioPlayer } from '@lobehub/tts/react';
import { Alert, Highlighter } from '@lobehub/ui';
import { Button, RefSelectProps, Select, SelectProps } from 'antd';
import { useTheme } from 'antd-style';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useTTS } from '@/hooks/useTTS';
import { ChatMessageError } from '@/types/chatMessage';
import { TTSServer } from '@/types/session';
import { getMessageError } from '@/utils/fetch';

interface SelectWithTTSPreviewProps extends SelectProps {
  server: TTSServer;
}

const SelectWithTTSPreview = forwardRef<RefSelectProps, SelectWithTTSPreviewProps>(
  ({ value, options, server, ...rest }, ref) => {
    const [error, setError] = useState<ChatMessageError>();
    const { t } = useTranslation('welcome');
    const theme = useTheme();
    const name = options?.find((item) => item.value === value)?.label;
    const PREVIEW_TEXT = ['Lobe Chat', t('slogan.title'), t('slogan.desc1'), name].join('. ');
    const { isGlobalLoading, audio, stop, start, response, setText } = useTTS(PREVIEW_TEXT, {
      onError: (err) => {
        stop();
        setError({ body: err, message: t('tts.responseError', { ns: 'error' }), type: 500 });
      },
      onErrorRetry: () => stop(),
      onSuccess: async () => {
        if (!response) return;
        if (response.status !== 200) {
          const message = await getMessageError(response);
          if (!message) return;
          setError(message);
        }
      },
      server,
      voice: value,
    });

    const handleRetry = useCallback(() => {
      setError(undefined);
      start();
    }, [start]);

    useEffect(() => {
      setText(PREVIEW_TEXT);
    }, [value]);

    return (
      <Flexbox gap={8}>
        <Flexbox align={'center'} gap={8} horizontal style={{ width: '100%' }}>
          <Select options={options} ref={ref} value={value} {...rest} />
          <AudioPlayer
            allowPause={false}
            audio={audio}
            buttonActive
            buttonSize={{ blockSize: 36, fontSize: 16 }}
            buttonStyle={{ border: `1px solid ${theme.colorBorder}` }}
            isLoading={isGlobalLoading}
            onInitPlay={start}
            onLoadingStop={stop}
            showSlider={false}
            showTime={false}
            style={{ flex: 'none', padding: 0, width: 'unset' }}
            title={t('settingTTS.voice.preview', { ns: 'setting' })}
          />
        </Flexbox>
        {error && (
          <Alert
            action={
              <Button onClick={handleRetry} size={'small'} type={'primary'}>
                {t('retry', { ns: 'common' })}
              </Button>
            }
            closable
            extra={
              error.body && (
                <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
                  {JSON.stringify(error.body, null, 2)}
                </Highlighter>
              )
            }
            message={error.message}
            style={{ alignItems: 'center', width: '100%' }}
            type="error"
          />
        )}
      </Flexbox>
    );
  },
);

export default SelectWithTTSPreview;
