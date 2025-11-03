import { memo } from 'react';
import { Components } from 'react-markdown';

import VideoComponent from '@/components/Video';

import { useStyles } from '../style';

/**
 * Markdown 视频组件
 * 使用 Video 组件实现，支持自适应尺寸和视频播放控制
 */
const Video: Components['video'] = memo(({ src }) => {
  const { styles, theme } = useStyles();

  if (!src) return null;

  return (
    <VideoComponent
      borderRadius={theme.borderRadius}
      src={src}
      style={styles.video}
      variant="borderless"
    />
  );
});

Video.displayName = 'MarkdownVideo';

export default Video;
