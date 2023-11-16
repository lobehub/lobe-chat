import { AudioPlayer } from '@lobehub/tts/react';
import { ActionIcon } from '@lobehub/ui';
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
  const { t } = useTranslation('chat');

  const [ttsMessage, clearTTS] = useSessionStore((s) => [s.ttsMessage, s.clearTTS]);

  const { isGlobalLoading, audio, start, stop } = useTTS(content);

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

  console.log(audio);

  return (
    <Flexbox align={'center'} horizontal style={{ minWidth: 160 }}>
      {audio && (
        <AudioPlayer
          audio={audio}
          buttonSize={'small'}
          isLoading={isGlobalLoading}
          onInitPlay={handleInitStart}
          timeRender={'tag'}
          timeStyle={{ margin: 0 }}
        />
      )}
      <ActionIcon
        icon={TrashIcon}
        onClick={() => {
          stop();
          clearTTS(id);
        }}
        size={'small'}
        title={t('tts.clear')}
      />
    </Flexbox>
  );
});

export default TTS;
