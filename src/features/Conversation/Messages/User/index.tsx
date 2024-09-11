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
>(({ id, editableContent, content, ...res }) => {
  if (content === LOADING_FLAT) return <BubblesLoading />;

  return (
    <Flexbox gap={8} id={id}>
      {editableContent}
      {res.imageList && res.imageList?.length > 0 && <ImageFileListViewer items={res.imageList} />}
      {res.fileList && res.fileList?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <FileListViewer items={res.fileList} />
        </div>
      )}
    </Flexbox>
  );
});

export * from './BelowMessage';
export { MarkdownRender as UserMarkdownRender } from './MarkdownRender';
