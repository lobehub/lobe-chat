import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { RenderAction } from '../components/ChatList';
import { useChatListActionsBar } from '../hooks/useChatListActionsBar';

export const FunctionActionsBar: RenderAction = memo(({ text, onActionClick }) => {
  const { regenerate, divider, del } = useChatListActionsBar(text);
  return (
    <ActionIconGroup
      dropdownMenu={[regenerate, divider, del]}
      items={[regenerate]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
