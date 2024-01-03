import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { RenderAction } from '../components/ChatList';
import { useChatListActionsBar } from '../hooks/useChatListActionsBar';

export const DefaultActionsBar: RenderAction = memo(({ text, onActionClick }) => {
  const { del } = useChatListActionsBar(text);
  return (
    <ActionIconGroup dropdownMenu={[del]} items={[]} onActionClick={onActionClick} type="ghost" />
  );
});
