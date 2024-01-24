import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';

export const FunctionActionsBar: RenderAction = memo(({ onActionClick }) => {
  const { regenerate, delAndRegenerate, del } = useChatListActionsBar();
  return (
    <ActionIconGroup
      dropdownMenu={[regenerate, delAndRegenerate, del]}
      items={[regenerate]}
      onActionClick={onActionClick}
      type="ghost"
    />
  );
});
