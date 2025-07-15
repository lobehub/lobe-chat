import { Icon, Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { startCase } from 'lodash-es';
import {
  AudioLines,
  BoltIcon,
  ImageIcon,
  LucideIcon,
  MessageSquareTextIcon,
  MicIcon,
  MusicIcon,
  PhoneIcon,
  VideoIcon,
} from 'lucide-react';
import { memo } from 'react';

import { AiModelType } from '@/types/aiModel';

const icons: Record<AiModelType, LucideIcon> = {
  chat: MessageSquareTextIcon,
  embedding: BoltIcon,
  image: ImageIcon,
  realtime: PhoneIcon,
  stt: MicIcon,
  text2music: MusicIcon,
  text2video: VideoIcon,
  tts: AudioLines,
};

const ModelTypeIcon = memo<{ size?: number; type: AiModelType }>(({ type, size = 20 }) => {
  const theme = useTheme();
  return (
    <Tooltip title={`${startCase(type)} Model`}>
      <Icon color={theme.colorTextDescription} icon={icons?.[type]} size={size} />
    </Tooltip>
  );
});

export default ModelTypeIcon;
