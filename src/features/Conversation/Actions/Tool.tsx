import { ActionIconGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';

export const ToolActionsBar: RenderAction = memo(({ id }) => {
  const { regenerate, del } = useChatListActionsBar();
  const [reInvokeToolMessage, deleteToolMessage] = useChatStore((s) => [
    s.reInvokeToolMessage,
    s.deleteToolMessage,
  ]);

  return (
    <ActionIconGroup
      items={[regenerate, del]}
      onActionClick={async (event) => {
        switch (event.key) {
          case 'regenerate': {
            await reInvokeToolMessage(id);
            break;
          }

          case 'del': {
            await deleteToolMessage(id);
          }
        }
      }}
    />
  );
});
