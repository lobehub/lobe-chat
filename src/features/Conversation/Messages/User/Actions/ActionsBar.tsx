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

import { VirtuosoContext } from '../../../components/VirtualizedList/VirtuosoContext';
import { InPortalThreadContext } from '../../../context/InPortalThreadContext';
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
    // isThreadMode,
    hasThread,
    isRegenerating,
    isRawPreview,
    toggleMessageEditing,
    deleteMessage,
    regenerateUserMessage,
    translateMessage,
    ttsMessage,
    delAndRegenerateMessage,
    copyMessage,
    openThreadCreator,
    resendThreadMessage,
    delAndResendThreadMessage,
    toggleMessageRawPreview,
  ] = useChatStore((s) => [
    // !!s.activeThreadId,
    threadSelectors.hasThreadBySourceMsgId(id)(s),
    messageStateSelectors.isMessageRegenerating(id)(s),
    messageStateSelectors.isMessageInRawPreview(id)(s),

    s.toggleMessageEditing,
    s.deleteMessage,
    s.regenerateUserMessage,
    s.translateMessage,
    s.ttsMessage,
    s.delAndRegenerateMessage,
    s.copyMessage,
    s.openThreadCreator,
    s.resendThreadMessage,
    s.delAndResendThreadMessage,
    s.toggleMessageRawPreview,
  ]);

  // const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  const { regenerate, edit, copy, divider, del, tts, translate, toggleRawPreview } = useChatListActionsBar({
    hasThread,
    isRegenerating,
    isRawPreview,
  });

  const inPortalThread = use(InPortalThreadContext);
  // const inThread = isThreadMode || inPortalThread;

  const items = [
    regenerate,
    edit,
    // inThread || isGroupSession ? null : branching
  ].filter(Boolean) as ActionIconGroupItemType[];

  const { message } = App.useApp();

  // remove line breaks in artifact tag to make the ast transform easier

  const virtuosoRef = use(VirtuosoContext);

  const onActionClick = useCallback(
    async (action: ActionIconGroupEvent) => {
      switch (action.key) {
        case 'edit': {
          toggleMessageEditing(id, true);

          virtuosoRef?.current?.scrollIntoView({ align: 'start', behavior: 'auto', index });
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
          if (inPortalThread) {
            resendThreadMessage(id);
          } else regenerateUserMessage(id);

          // if this message is an error message, we need to delete it
          if (data.error) deleteMessage(id);
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

        case 'tts': {
          ttsMessage(id);
          break;
        }

        case 'toggleRawPreview': {
          toggleMessageRawPreview(id);
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
    [data.content, data.error, inPortalThread, topic, id],
  );

  return (
    <ActionIconGroup
      items={items}
      menu={{
        items: [edit, copy, divider, toggleRawPreview, tts, translate, divider, regenerate, del],
      }}
      onActionClick={onActionClick}
      size={'small'}
      variant={'borderless'}
    />
  );
});
