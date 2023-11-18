import { ActionIcon, Alert, Highlighter, Icon } from '@lobehub/ui';
import { Button, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { Mic, MicOff } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSTT } from '@/hooks/useSTT';
import { useSessionStore } from '@/store/session';
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

  const [loading, updateInputMessage] = useSessionStore((s) => [
    !!s.chatLoadingId,
    s.updateInputMessage,
  ]);

  const { start, isLoading, stop, formattedTime, time, response } = useSTT({
    onError: (err) => {
      stop();
      setError({ body: err, message: t('stt.responseError', { ns: 'error' }), type: 500 });
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
    onTextChange: (text) => {
      if (loading) stop();
      if (text) updateInputMessage(text);
    },
  });

  const icon = isLoading ? MicOff : Mic;
  const Render: any = !mobile ? ActionIcon : Button;
  const iconRender: any = !mobile ? icon : <Icon icon={icon} />;
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
  }, []);

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
                {time > 0 ? formattedTime : t('stt.loading')}
              </Flexbox>
            ),
          },
        ],
      }}
      open={!!error || isLoading}
      placement={mobile ? 'topRight' : 'top'}
      trigger={['click']}
    >
      <Render
        icon={iconRender}
        onClick={handleTriggerStartStop}
        placement={'bottom'}
        style={{ flex: 'none' }}
        title={desc}
      />
    </Dropdown>
  );
});

export default STT;
