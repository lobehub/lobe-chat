import { ActionIconGroup } from '@lobehub/ui';
import type { ChatActionsBarProps } from '@lobehub/ui/chat';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';

export const ErrorActionsBar = memo<ChatActionsBarProps>(({ onActionClick }) => {
  const { regenerate, copy, edit, del, divider } = useChatListActionsBar();

  return (
    <ActionIconGroup
      items={[regenerate, del]}
      menu={{
        items: [edit, copy, divider, del],
      }}
      onActionClick={onActionClick}
    />
  );
});
