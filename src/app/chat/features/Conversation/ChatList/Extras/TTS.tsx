import { AudioPlayer } from '@lobehub/tts/react';
import { ActionIcon, Alert, Highlighter } from '@lobehub/ui';
import { Button } from 'antd';
import { TrashIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useTTS } from '@/hooks/useTTS';
import { useChatStore } from '@/store/chat';
import { ChatMessageError, ChatTTS } from '@/types/chatMessage';
import { getMessageError } from '@/utils/fetch';

interface TTSProps extends ChatTTS {
  content: string;
  id: string;
  loading?: boolean;
}

const TTS = memo<TTSProps>(({ id, init, content }) => {
  const [isStart, setIsStart] = useState(false);
  const [error, setError] = useState<ChatMessageError>();
  const { t } = useTranslation('chat');

  const [ttsMessage, clearTTS] = useChatStore((s) => [s.ttsMessage, s.clearTTS]);

  const setDefaultError = useCallback(
    (err?: any) => {
      setError({ body: err, message: t('tts.responseError', { ns: 'error' }), type: 500 });
    },
    [t],
  );

  const { isGlobalLoading, audio, start, stop, response } = useTTS(content, {
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
      if (response.status === 200) return ttsMessage(id, true);
      const message = await getMessageError(response);
      if (message) {
        setError(message);
      } else {
        setDefaultError();
      }
      stop();
    },
  });

  const handleInitStart = useCallback(() => {
    if (isStart) return;
    start();
    setIsStart(true);
  }, [isStart]);

  const handleDelete = useCallback(() => {
    stop();
    clearTTS(id);
  }, [stop, id]);

  const handleRetry = useCallback(() => {
    setError(undefined);
    start();
  }, [start]);

  useEffect(() => {
    if (init) return;
    handleInitStart();
  }, [init]);

  return (
    <Flexbox align={'center'} horizontal style={{ minWidth: 160, width: '100%' }}>
      {error ? (
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
          onClose={handleDelete}
          style={{ alignItems: 'center', width: '100%' }}
          type="error"
        />
      ) : (
        <>
          <AudioPlayer
            audio={audio}
            buttonSize={'small'}
            isLoading={isGlobalLoading}
            onInitPlay={handleInitStart}
            onLoadingStop={stop}
            timeRender={'tag'}
            timeStyle={{ margin: 0 }}
          />
          <ActionIcon
            icon={TrashIcon}
            onClick={handleDelete}
            size={'small'}
            title={t('tts.clear')}
          />
        </>
      )}
    </Flexbox>
  );
});

export default TTS;
