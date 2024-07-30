import { ReactNode, memo } from 'react';

import { LOADING_FLAT } from '@/const/message';
import { ChatMessage } from '@/types/message';

import BubblesLoading from '@/components/BubblesLoading';

export const DefaultMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
    isToolCallGenerating?: boolean;
  }
>(({ id, editableContent, content, isToolCallGenerating }) => {
  if (isToolCallGenerating) return;

  if (content === LOADING_FLAT) return <BubblesLoading />;

  return <div id={id}>{editableContent}</div>;
});
