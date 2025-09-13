import { ActionIconGroup } from '@lobehub/ui';
import { ActionIconGroupItemType } from '@lobehub/ui/es/ActionIconGroup';
import { memo, useContext, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/slices/thread/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { InPortalThreadContext } from '../components/ChatItem/InPortalThreadContext';
import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';
import { useCustomActions } from './customAction';

export const UserActionsBar: RenderAction = memo(({ onActionClick, id }) => {
  const [isThreadMode, hasThread] = useChatStore((s) => [
    !!s.activeThreadId,
    threadSelectors.hasThreadBySourceMsgId(id)(s),
  ]);

  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  const { regenerate, edit, copy, divider, del, branching } = useChatListActionsBar({ hasThread });
  const { translate, tts } = useCustomActions();

  const inPortalThread = useContext(InPortalThreadContext);
  const inThread = isThreadMode || inPortalThread;

  const items = useMemo(
    () =>
      [isGroupSession ? null : regenerate, edit, inThread || isGroupSession ? null : branching].filter(
        Boolean,
      ) as ActionIconGroupItemType[],
    [inThread, isGroupSession],
  );

  const menuItems = [
    edit,
    copy,
    divider,
    tts,
    translate,
    divider,
    ...(isGroupSession ? [] : [regenerate]),
    del,
  ];

  return (
    <ActionIconGroup
      items={items}
      menu={{
        items: menuItems,
      }}
      onActionClick={onActionClick}
    />
  );
});
