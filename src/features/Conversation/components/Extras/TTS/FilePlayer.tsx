import { useAudioPlayer } from '@lobehub/tts/react';
import { memo, useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';

import { TTSProps } from './InitPlayer';
import Player from './Player';

const FilePlayer = memo<TTSProps>(({ file, id }) => {
  const useFetchTTSFile = useFileStore((s) => s.useFetchTTSFile);
  const [clearTTS] = useChatStore((s) => [s.clearTTS]);
  const { data, isLoading: isFileLoading } = useFetchTTSFile(file || null);
  const { isLoading, ...audio } = useAudioPlayer({ src: data ? data.url : '' });

  const handleDelete = useCallback(() => {
    clearTTS(id);
  }, [id]);

  if (!audio || isFileLoading) return;

  return <Player audio={audio} isLoading={isLoading} onDelete={handleDelete} />;
});

export default FilePlayer;
