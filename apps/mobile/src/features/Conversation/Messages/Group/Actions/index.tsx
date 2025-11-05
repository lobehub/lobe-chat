import { AssistantContentBlock, UIChatMessage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';

import Actions from '@/features/ChatItem/components/Actions';

interface GroupActionsBarProps {
  contentBlock?: AssistantContentBlock;
  contentId?: string;
  data: UIChatMessage;
  id: string;
  index: number;
}

export const GroupActionsBar = memo<GroupActionsBarProps>(({ contentBlock, contentId, data }) => {
  // If we don't have a content block, we can't show actions
  if (!contentBlock || !contentId) return null;

  // Create a synthetic message for the actions component
  const message: UIChatMessage = {
    ...data,
    content: contentBlock.content || '',
    error: contentBlock.error,
    id: contentId,
  };

  return (
    <Flexbox>
      <Actions message={message} />
    </Flexbox>
  );
});

GroupActionsBar.displayName = 'GroupActionsBar';
