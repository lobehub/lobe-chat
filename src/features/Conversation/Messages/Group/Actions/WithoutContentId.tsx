import { UIChatMessage } from '@lobechat/types';
import { ActionIconGroup, type ActionIconGroupEvent, ActionIconGroupItemType } from '@lobehub/ui';
import { useSearchParams } from 'next/navigation';
import { memo, useCallback, useContext, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { InPortalThreadContext } from '../../../context/InPortalThreadContext';
import { useChatListActionsBar } from '../../../hooks/useChatListActionsBar';

interface GroupActionsProps {
  data: UIChatMessage;
  id: string;
}

const WithoutContentId = memo<GroupActionsProps>(({ id, data }) => {
  const [isThreadMode, hasThread] = useChatStore((s) => [
    !!s.activeThreadId,
    threadSelectors.hasThreadBySourceMsgId(id)(s),
  ]);
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  const { delAndRegenerate, del } = useChatListActionsBar({ hasThread });

  const inPortalThread = useContext(InPortalThreadContext);
  const inThread = isThreadMode || inPortalThread;

  const items = useMemo(() => {
    return [delAndRegenerate, del].filter(Boolean) as ActionIconGroupItemType[];
  }, [inThread, isGroupSession]);

  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const [deleteMessage, delAndRegenerateMessage, delAndResendThreadMessage] = useChatStore((s) => [
    s.deleteMessage,
    s.delAndRegenerateMessage,
    s.delAndResendThreadMessage,
  ]);

  const onActionClick = useCallback(
    async (action: ActionIconGroupEvent) => {
      if (!data) return;

      switch (action.key) {
        case 'del': {
          deleteMessage(id);
          break;
        }

        case 'delAndRegenerate': {
          if (inPortalThread) {
            delAndResendThreadMessage(id);
          } else {
            delAndRegenerateMessage(id);
          }
          break;
        }
      }
    },
    [data, topic],
  );

  return <ActionIconGroup items={items} onActionClick={onActionClick} />;
});

export default WithoutContentId;
