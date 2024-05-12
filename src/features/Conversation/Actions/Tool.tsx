import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';

export const ToolActionsBar: RenderAction = memo(({ id }) => {
  const { regenerate } = useChatListActionsBar();
  const [reInvokeToolMessage] = useChatStore((s) => [s.reInvokeToolMessage]);

  return (
    <ActionIconGroup
      // dropdownMenu={[regenerate]}
      items={[regenerate]}
      onActionClick={(event) => {
        switch (event.key) {
          case 'regenerate': {
            reInvokeToolMessage(id);
            break;
          }
        }
      }}
      type="ghost"
    />
  );
});
