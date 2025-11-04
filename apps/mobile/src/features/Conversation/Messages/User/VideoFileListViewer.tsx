import { Flexbox, Video } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

interface VideoFileItem {
  alt?: string;
  id: string;
  url: string;
}

interface VideoFileListViewerProps {
  items: VideoFileItem[];
}

/**
 * VideoFileListViewer - 视频列表查看器
 *
 * 展示消息中的视频列表，使用 Video 组件
 */
const VideoFileListViewer = memo<VideoFileListViewerProps>(({ items }) => {
  const { width } = useWindowDimensions();

  // 计算视频宽度
  const videoWidth = useMemo(() => {
    return Math.min(width - 80, 400); // 最大 400px
  }, [width]);

  if (!items || items.length === 0) return null;

  return (
    <Flexbox gap={8}>
      {items.map((item) => (
        <Video
          aspectRatio={16 / 9}
          key={item.id}
          src={item.url}
          style={{ borderRadius: 8 }}
          width={videoWidth}
        />
      ))}
    </Flexbox>
  );
});

VideoFileListViewer.displayName = 'VideoFileListViewer';

export default VideoFileListViewer;
