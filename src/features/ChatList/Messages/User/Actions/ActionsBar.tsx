import { UIChatMessage } from '@lobechat/types';
import { ActionIconGroup } from '@lobehub/ui';
import { ActionIconGroupItemType } from '@lobehub/ui/es/ActionIconGroup';
import { ActionIconGroupEvent } from '@lobehub/ui/es/ActionIconGroup/type';
import { App } from 'antd';
import { useSearchParams } from 'next/navigation';
import { memo, use, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { messageStateSelectors, threadSelectors } from '@/store/chat/selectors';

import { VirtuaContext } from '../../../components/VirtualizedList/VirtuosoContext';
import { useChatListActionsBar } from '../../../hooks/useChatListActionsBar';

interface UserActionsProps {
  data: UIChatMessage;
  id: string;
  index: number;
}

export const UserActionsBar = memo<UserActionsProps>(({ id, data, index }) => {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const [
    hasThread,
    isRegenerating,
    toggleMessageEditing,
    deleteMessage,
    regenerateUserMessage,
    translateMessage,
    ttsMessage,
    delAndRegenerateMessage,
    copyMessage,
    openThreadCreator,
  ] = useChatStore((s) => [
    threadSelectors.hasThreadBySourceMsgId(id)(s),
    messageStateSelectors.isMessageRegenerating(id)(s),

    s.toggleMessageEditing,
    s.deleteMessage,
    s.regenerateUserMessage,
    s.translateMessage,
    s.ttsMessage,
    s.delAndRegenerateMessage,
    s.copyMessage,
    s.openThreadCreator,
  ]);

  // const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  const { regenerate, edit, copy, divider, del, tts, translate } = useChatListActionsBar({
    hasThread,
    isRegenerating,
  });

  const items = [
    regenerate,
    edit,
    // inThread || isGroupSession ? null : branching
  ].filter(Boolean) as ActionIconGroupItemType[];

  const { message } = App.useApp();

  // remove line breaks in artifact tag to make the ast transform easier

  const virtuaRef = use(VirtuaContext);

  const onActionClick = useCallback(
    async (action: ActionIconGroupEvent) => {
      switch (action.key) {
        case 'edit': {
          toggleMessageEditing(id, true);

          virtuaRef?.current?.scrollToIndex(index, { align: 'start' });
        }
      }

      switch (action.key) {
        case 'copy': {
          await copyMessage(id, data.content);
          message.success(t('copySuccess'));
          break;
        }

        case 'branching': {
          if (!topic) {
            message.warning(t('branchingRequiresSavedTopic'));
            break;
          }
          openThreadCreator(id);
          break;
        }

        case 'del': {
          deleteMessage(id);
          break;
        }

        case 'regenerate': {
          regenerateUserMessage(id);

          // if this message is an error message, we need to delete it
          if (data.error) deleteMessage(id);
          break;
        }

        case 'delAndRegenerate': {
          delAndRegenerateMessage(id);
          break;
        }

        case 'tts': {
          ttsMessage(id);
          break;
        }
      }

      if (action.keyPath.at(-1) === 'translate') {
        // click the menu item with translate item, the result is:
        // key: 'en-US'
        // keyPath: ['en-US','translate']
        const lang = action.keyPath[0];
        translateMessage(id, lang);
      }
    },
    [data.content, data.error, topic],
  );

  return (
    <ActionIconGroup
      items={items}
      menu={{
        items: [edit, copy, divider, tts, translate, divider, regenerate, del],
      }}
      onActionClick={onActionClick}
      size={'small'}
      variant={'borderless'}
    />
  );
});
