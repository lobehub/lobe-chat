import { AudioPlayer, AudioPlayerProps } from '@lobehub/tts/react';
import { ActionIcon, Alert, Highlighter } from '@lobehub/ui';
import { Button } from 'antd';
import { TrashIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatMessageError } from '@/types/chatMessage';

interface PlayerProps extends AudioPlayerProps {
  error?: ChatMessageError;
  onDelete: () => void;
  onRetry?: () => void;
}

const Player = memo<PlayerProps>(({ onRetry, error, onDelete, audio, isLoading, onInitPlay }) => {
  const { t } = useTranslation('chat');

  return (
    <Flexbox align={'center'} horizontal style={{ minWidth: 160, width: '100%' }}>
      {error ? (
        <Alert
          action={
            <Button onClick={onRetry} size={'small'} type={'primary'}>
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
          onClose={onDelete}
          style={{ alignItems: 'center', width: '100%' }}
          type="error"
        />
      ) : (
        <>
          <AudioPlayer
            allowPause={false}
            audio={audio}
            buttonSize={'small'}
            isLoading={isLoading}
            onInitPlay={onInitPlay}
            onLoadingStop={stop}
            timeRender={'tag'}
            timeStyle={{ margin: 0 }}
          />
          <ActionIcon icon={TrashIcon} onClick={onDelete} size={'small'} title={t('tts.clear')} />
        </>
      )}
    </Flexbox>
  );
});

export default Player;
