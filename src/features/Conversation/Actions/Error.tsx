import { ActionIconGroup } from '@lobehub/ui';
import type { ChatActionsBarProps } from '@lobehub/ui/chat';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';

export const ErrorActionsBar = memo<ChatActionsBarProps>(({ onActionClick }) => {
  const { regenerate, del } = useChatListActionsBar();

  return <ActionIconGroup items={[regenerate, del]} onActionClick={onActionClick} />;
});
