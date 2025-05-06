import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import type { RenderAction } from '../types';

export const DefaultActionsBar: RenderAction = memo(({ onActionClick }) => {
  const { del } = useChatListActionsBar();

  return (
    <ActionIconGroup
      items={[]}
      menu={{
        items: [del],
      }}
      onActionClick={onActionClick}
    />
  );
});
