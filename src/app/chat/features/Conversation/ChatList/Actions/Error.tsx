import { ActionIconGroup, useChatListActionsBar } from '@lobehub/ui';
import { ActionsBarProps } from '@lobehub/ui/es/ChatList/ActionsBar';
import { memo } from 'react';

export const ErrorActionsBar = memo<ActionsBarProps>(({ text, onActionClick }) => {
  const { regenerate, del } = useChatListActionsBar(text);

  return <ActionIconGroup items={[regenerate, del]} onActionClick={onActionClick} type="ghost" />;
});
