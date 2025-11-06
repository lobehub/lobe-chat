import { Flexbox, Video } from '@lobehub/ui-rn';
import { memo } from 'react';

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
  if (!items || items.length === 0) return null;

  return (
    <Flexbox
      gap={8}
      style={{
        marginBottom: 8,
      }}
    >
      {items.map((item) => (
        <Video key={item.id} src={item.url} width={'100%'} />
      ))}
    </Flexbox>
  );
});

VideoFileListViewer.displayName = 'VideoFileListViewer';

export default VideoFileListViewer;
