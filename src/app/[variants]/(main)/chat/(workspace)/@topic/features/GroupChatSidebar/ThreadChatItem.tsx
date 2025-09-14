'use client';

import { ActionIconGroup, type ActionIconGroupEvent } from '@lobehub/ui';
import { App } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ChatItem from '@/features/Conversation/components/ChatItem';
import { useChatListActionsBar } from '@/features/Conversation/hooks/useChatListActionsBar';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export interface ThreadChatItemProps {
  id: string;
  index: number;
}

const ThreadChatItem = memo<ThreadChatItemProps>(({ id, index }) => {
  const { t } = useTranslation('common');
  const { message } = App.useApp();

  // For thread view, we don't need history divider
  const enableHistoryDivider = false;

  const item = useChatStore(chatSelectors.getMessageById(id), isEqual);
  const [deleteMessage, regenerateMessage, copyMessage, toggleMessageEditing] = useChatStore(
    (s) => [s.deleteMessage, s.regenerateMessage, s.copyMessage, s.toggleMessageEditing],
  );

  // Get actions but exclude the "Create Subtopic" (branching) action
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar();

  // Handle action clicks (same logic as original ActionsBar but without branching)
  const handleActionClick = useCallback(
    async (action: ActionIconGroupEvent) => {
      if (!item) return;

      switch (action.key) {
        case 'edit': {
          toggleMessageEditing(id, true);
          break;
        }
        case 'copy': {
          await copyMessage(id, item.content);
          message.success(t('copySuccess', { defaultValue: 'Copy Success' }));
          break;
        }
        case 'del': {
          deleteMessage(id);
          break;
        }
        case 'regenerate': {
          regenerateMessage(id);
          if (item.error) deleteMessage(id);
          break;
        }
      }
    },
    [item, id, toggleMessageEditing, copyMessage, message, t, deleteMessage, regenerateMessage],
  );

  // Create custom action bar that excludes "Create Subtopic" button
  const actionBar = useMemo(
    () => (
      <ActionIconGroup
        items={[regenerate, edit]}
        menu={{
          items: [edit, copy, regenerate, divider, del], // Explicitly exclude branching
        }}
        onActionClick={handleActionClick}
      />
    ),
    [regenerate, edit, copy, divider, del, handleActionClick],
  );

  return (
    <ChatItem
      actionBar={actionBar}
      enableHistoryDivider={enableHistoryDivider}
      id={id}
      inPortalThread={true} // Mark this as thread context
      index={index}
      showAvatar={false}
    />
  );
});

export default ThreadChatItem;
