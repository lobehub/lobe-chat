import { AudioPlayer } from '@lobehub/tts/react';
import { ActionIcon } from '@lobehub/ui';
import { Alert, Button } from 'antd';
import { TrashIcon } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useTTS } from '@/hooks/useTTS';
import { useSessionStore } from '@/store/session';
import { ChatTTS } from '@/types/chatMessage';

interface TTSProps extends ChatTTS {
  content: string;
  id: string;
  loading?: boolean;
}

const TTS = memo<TTSProps>(({ id, init, content }) => {
  const [isStart, setIsStart] = useState(false);
  const [error, setError] = useState<Error>();
  const { t } = useTranslation('chat');

  const [ttsMessage, clearTTS] = useSessionStore((s) => [s.ttsMessage, s.clearTTS]);

  const { isGlobalLoading, audio, start, stop } = useTTS(content, {
    onError: (err) => {
      stop();
      setError(err);
    },
    onErrorRetry: (err) => {
      stop();
      setError(err);
    },
    onSuccess: () => {
      ttsMessage(id, true);
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
    <Flexbox align={'center'} horizontal style={{ minWidth: 160 }}>
      {error ? (
        <Alert
          action={
            <Button onClick={handleRetry} size={'small'} type={'primary'}>
              {t('retry', { ns: 'common' })}
            </Button>
          }
          closable
          message={error.message}
          onClose={handleDelete}
          showIcon
          type="error"
        />
      ) : (
        <>
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
