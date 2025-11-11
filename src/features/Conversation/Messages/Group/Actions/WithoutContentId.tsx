import { UIChatMessage } from '@lobechat/types';
import { ActionIconGroup, type ActionIconGroupEvent } from '@lobehub/ui';
import { useSearchParams } from 'next/navigation';
import { memo, useCallback, useContext } from 'react';

import { useChatStore } from '@/store/chat';
import {
  displayMessageSelectors,
  messageStateSelectors,
  threadSelectors,
} from '@/store/chat/selectors';

import { InPortalThreadContext } from '../../../context/InPortalThreadContext';
import { useChatListActionsBar } from '../../../hooks/useChatListActionsBar';

interface GroupActionsProps {
  data: UIChatMessage;
  id: string;
}

const WithoutContentId = memo<GroupActionsProps>(({ id, data }) => {
  const [hasThread, lastBlockId] = useChatStore((s) => [
    threadSelectors.hasThreadBySourceMsgId(id)(s),
    displayMessageSelectors.findLastMessageId(id)(s),
  ]);

  const isContinuing = useChatStore((s) =>
    lastBlockId ? messageStateSelectors.isMessageContinuing(lastBlockId)(s) : false,
  );

  const { delAndRegenerate, del, continueGeneration } = useChatListActionsBar({
    hasThread,
    isContinuing,
  });

  const inPortalThread = useContext(InPortalThreadContext);
  // const inThread = isThreadMode || inPortalThread;

  const items = [continueGeneration, delAndRegenerate, del];

  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const [
    deleteMessage,
    delAndRegenerateMessage,
    delAndResendThreadMessage,
    continueGenerationMessage,
  ] = useChatStore((s) => [
    s.deleteMessage,
    s.delAndRegenerateMessage,
    s.delAndResendThreadMessage,
    s.continueGenerationMessage,
  ]);

  const onActionClick = useCallback(
    async (action: ActionIconGroupEvent) => {
      if (!data) return;

      switch (action.key) {
        case 'continueGeneration': {
          const lastMessageId = displayMessageSelectors.findLastMessageId(id)(
            useChatStore.getState(),
          );

          if (!lastMessageId) return;

          continueGenerationMessage(lastMessageId, id);
          break;
        }

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
