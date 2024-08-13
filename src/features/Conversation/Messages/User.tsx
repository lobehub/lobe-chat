import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import { FileListPreviewer } from '@/features/FileList';
import { ChatMessage } from '@/types/message';

export const UserMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, editableContent, content, ...res }) => {
  if (content === LOADING_FLAT) return <BubblesLoading />;

  return (
    <Flexbox gap={8} id={id}>
      {editableContent}
      {res.files && res.files?.length > 0 && <FileListPreviewer items={res.files} />}
    </Flexbox>
  );
});
