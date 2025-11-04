import { memo, useContext } from 'react';
import { Components } from 'react-markdown';

import VideoComponent from '@/components/Video';

import { useStyles } from '../style';
import { BlockContext } from './context';

/**
 * Markdown 视频组件
 * 使用 Video 组件实现，支持自适应尺寸和视频播放控制
 */
const Video: Components['video'] = memo(({ src }) => {
  const { styles } = useStyles();
  const { type } = useContext(BlockContext);

  if (!src) return null;

  const autoSize = type !== 'list';

  return <VideoComponent src={src} style={styles.video} width={autoSize ? undefined : '100%'} />;
});

Video.displayName = 'MarkdownVideo';

export default Video;
