import { memo } from 'react';

import { useTTSVoice } from '@/hooks/useTTSVoice';

import FilePlayer from './FilePlayer';
import InitPlayer, { TTSProps } from './InitPlayer';

const TTS = memo<TTSProps>((props) => {
  const { file, voice } = props;
  const currentVoice = useTTSVoice();

  const PlayerRender = file && currentVoice === voice ? FilePlayer : InitPlayer;

  return <PlayerRender {...props} />;
});

export default TTS;
