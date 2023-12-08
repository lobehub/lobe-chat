import { ActionIcon, Alert, Highlighter } from '@lobehub/ui';
import { Button, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { Mic, MicOff } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSTT } from '@/hooks/useSTT';
import { useChatStore } from '@/store/chat';
import { ChatMessageError } from '@/types/chatMessage';
import { getMessageError } from '@/utils/fetch';

const useStyles = createStyles(({ css, token }) => ({
  recording: css`
    width: 8px;
    height: 8px;
    background: ${token.colorError};
    border-radius: 50%;
  `,
}));

const STT = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [error, setError] = useState<ChatMessageError>();
  const { t } = useTranslation('chat');
  const { styles } = useStyles();

  const [loading, updateInputMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.updateInputMessage,
  ]);

  const setDefaultError = useCallback(
    (err?: any) => {
      setError({ body: err, message: t('stt.responseError', { ns: 'error' }), type: 500 });
    },
    [t],
  );

  const { start, isLoading, stop, formattedTime, time, response, isRecording } = useSTT({
    onError: (err) => {
      stop();
      setDefaultError(err);
    },
    onErrorRetry: (err) => {
      stop();
      setDefaultError(err);
    },
    onSuccess: async () => {
      if (!response) return;
      if (response.status === 200) return;
      const message = await getMessageError(response);
      if (message) {
        setError(message);
      } else {
        setDefaultError();
      }
      stop();
    },
    onTextChange: (text) => {
      if (loading) stop();
      if (text) updateInputMessage(text);
    },
  });

  const desc = t('stt.action');

  const handleTriggerStartStop = useCallback(() => {
    if (loading) return;
    if (!isLoading) {
      start();
    } else {
      stop();
    }
  }, [loading, isLoading, start, stop]);

  const handleCloseError = useCallback(() => {
    setError(undefined);
    stop();
  }, [stop]);

  const handleRetry = useCallback(() => {
    setError(undefined);
    start();
  }, [start]);

  return (
    <Dropdown
      dropdownRender={
        error
          ? () => (
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
                onClose={handleCloseError}
                style={{ alignItems: 'center' }}
                type="error"
              />
            )
          : undefined
      }
      menu={{
        activeKey: 'time',
        items: [
          {
            key: 'time',
            label: (
              <Flexbox align={'center'} gap={8} horizontal>
                <div className={styles.recording} />
                {time > 0 ? formattedTime : t(isRecording ? 'stt.loading' : 'stt.prettifying')}
              </Flexbox>
            ),
          },
        ],
      }}
      open={!!error || isRecording || isLoading}
      placement={mobile ? 'topRight' : 'top'}
      trigger={['click']}
    >
      <ActionIcon
        active={mobile}
        icon={isLoading ? MicOff : Mic}
        onClick={handleTriggerStartStop}
        placement={'bottom'}
        size={mobile ? { blockSize: 36, fontSize: 16 } : {}}
        style={{ flex: 'none' }}
        title={desc}
      />
    </Dropdown>
  );
});

export default STT;
