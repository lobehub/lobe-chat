import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import MarkdownMessage from '@/features/Conversation/Markdown';
import { UIChatMessage } from '@/types/index';

import { useMarkdown } from '../useMarkdown';
import FileListViewer from './FileListViewer';
import ImageFileListViewer from './ImageFileListViewer';
import VideoFileListViewer from './VideoFileListViewer';

const UserMessageContent = memo<UIChatMessage>(
  ({ id, content, imageList, videoList, fileList }) => {
    const markdownProps = useMarkdown(id);
    return (
      <Flexbox gap={8} id={id}>
        <MarkdownMessage {...markdownProps}>{content}</MarkdownMessage>
        {imageList && imageList?.length > 0 && <ImageFileListViewer items={imageList} />}
        {videoList && videoList?.length > 0 && <VideoFileListViewer items={videoList} />}
        {fileList && fileList?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <FileListViewer items={fileList} />
          </div>
        )}
      </Flexbox>
    );
  },
);

export default UserMessageContent;
