import { ActionIconGroup } from '@lobehub/ui';
import type { ActionIconGroupItemType } from '@lobehub/ui';
import { memo, useContext, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import { InPortalThreadContext } from '../components/ChatItem/InPortalThreadContext';
import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import { RenderAction } from '../types';
import { ErrorActionsBar } from './Error';
import { useCustomActions } from './customAction';

export const AssistantActionsBar: RenderAction = memo(({ onActionClick, error, tools, id }) => {
  const [isThreadMode, hasThread] = useChatStore((s) => [
    !!s.activeThreadId,
    threadSelectors.hasThreadBySourceMsgId(id)(s),
  ]);

  const {
    regenerate,
    edit,
    delAndRegenerate,
    copy,
    divider,
    del,
    branching,
    // export: exportPDF,
    share,
  } = useChatListActionsBar({ hasThread });

  const { translate, tts } = useCustomActions();
  const hasTools = !!tools;

  const inPortalThread = useContext(InPortalThreadContext);
  const inThread = isThreadMode || inPortalThread;

  const items = useMemo(() => {
    if (hasTools) return [delAndRegenerate, copy];

    return [edit, copy, inThread ? null : branching].filter(Boolean) as ActionIconGroupItemType[];
  }, [inThread, hasTools]);

  if (error) return <ErrorActionsBar onActionClick={onActionClick} />;

  return (
    <ActionIconGroup
      items={items}
      menu={{
        items: [
          edit,
          copy,
          divider,
          tts,
          translate,
          divider,
          share,
          // exportPDF,
          divider,
          regenerate,
          delAndRegenerate,
          del,
        ],
      }}
      onActionClick={onActionClick}
    />
  );
});
