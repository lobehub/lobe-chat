import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import { ChatMessage } from '@/types/message';

import FileListViewer from './FileListViewer';
import ImageFileListViewer from './ImageFileListViewer';
import VideoFileListViewer from './VideoFileListViewer';

export const UserMessageContent = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, editableContent, content, imageList, videoList, fileList }) => {
  if (content === LOADING_FLAT) return <BubblesLoading />;

  return (
    <Flexbox gap={8} id={id}>
      {editableContent}
      {imageList && imageList?.length > 0 && <ImageFileListViewer items={imageList} />}
      {videoList && videoList?.length > 0 && <VideoFileListViewer items={videoList} />}
      {fileList && fileList?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <FileListViewer items={fileList} />
        </div>
      )}
    </Flexbox>
  );
});
