import { ActionIconGroup } from '@lobehub/ui';
import { ActionIconGroupItemType } from '@lobehub/ui/es/ActionIconGroup';
import { ActionIconGroupEvent } from '@lobehub/ui/es/ActionIconGroup/type';
import { memo, useContext, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import { InPortalThreadContext } from '../../components/ChatItem/InPortalThreadContext';
import { useChatListActionsBar } from '../../hooks/useChatListActionsBar';

interface UserActionsProps {
  id: string;
  onActionClick?: (action: ActionIconGroupEvent) => void;
}

export const UserActionsBar = memo<UserActionsProps>(({ onActionClick, id }) => {
  const [isThreadMode, hasThread] = useChatStore((s) => [
    !!s.activeThreadId,
    threadSelectors.hasThreadBySourceMsgId(id)(s),
  ]);
  const { regenerate, edit, copy, divider, del, branching, tts, translate } = useChatListActionsBar(
    { hasThread },
  );

  const inPortalThread = useContext(InPortalThreadContext);
  const inThread = isThreadMode || inPortalThread;

  const items = useMemo(
    () =>
      [regenerate, edit, inThread ? null : branching].filter(Boolean) as ActionIconGroupItemType[],
    [inThread],
  );

  return (
    <ActionIconGroup
      items={items}
      menu={{
        items: [edit, copy, divider, tts, translate, divider, regenerate, del],
      }}
      onActionClick={onActionClick}
    />
  );
});
