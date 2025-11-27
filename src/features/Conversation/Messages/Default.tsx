import { UIChatMessage } from '@lobechat/types';
import { ReactNode, memo } from 'react';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';

import { messageStateSelectors, useConversationStore } from '../store';

export const MessageContentClassName = 'msg_content_flag';

export const DefaultMessage = memo<
  UIChatMessage & {
    addIdOnDOM?: boolean;
    editableContent: ReactNode;
    hasImages?: boolean;
    isToolCallGenerating?: boolean;
  }
>(({ id, editableContent, content, isToolCallGenerating, addIdOnDOM = true, hasImages }) => {
  const editing = useConversationStore(messageStateSelectors.isMessageEditing(id));

  if (isToolCallGenerating) return;

  if (!content && !hasImages) return <BubblesLoading />;
  if (content === LOADING_FLAT && !editing) return <BubblesLoading />;

  return <div id={addIdOnDOM ? id : undefined}>{editableContent}</div>;
});
