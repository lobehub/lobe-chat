import { ActionIconGroup } from '@lobehub/ui';
import { ActionsBarProps } from '@lobehub/ui/es/ChatList/ActionsBar';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';

export const ErrorActionsBar = memo<ActionsBarProps>(({ onActionClick }) => {
  const { regenerate, del } = useChatListActionsBar();

  return <ActionIconGroup items={[regenerate, del]} onActionClick={onActionClick} type="ghost" />;
});
