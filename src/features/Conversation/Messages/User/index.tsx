import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import { ChatMessage } from '@/types/message';

import FileListViewer from './FileListViewer';
import ImageFileListViewer from './ImageFileListViewer';

export const UserMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, editableContent, content, imageList, fileList }) => {
  if (content === LOADING_FLAT) return <BubblesLoading />;

  return (
    <Flexbox gap={8} id={id}>
      {editableContent}
      {imageList && imageList?.length > 0 && <ImageFileListViewer items={imageList} />}
      {fileList && fileList?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <FileListViewer items={fileList} />
        </div>
      )}
    </Flexbox>
  );
});

export * from './BelowMessage';
export { MarkdownRender as UserMarkdownRender } from './MarkdownRender';
