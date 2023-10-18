import { ChatList } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { PREFIX_KEY, REGENERATE_KEY } from '@/const/hotkeys';
import { useSessionChatInit, useSessionStore } from '@/store/session';
import { agentSelectors, chatSelectors } from '@/store/session/selectors';

import { renderActions } from './Actions';
import { renderErrorMessages } from './Error';
import { renderMessagesExtra } from './Extras';
import { renderMessages } from './Messages';
import SkeletonList from './SkeletonList';

const List = memo(() => {
  const init = useSessionChatInit();
  const { t } = useTranslation('common');
  const data = useSessionStore(chatSelectors.currentChatsWithGuideMessage, isEqual);

  const [
    displayMode,
    enableHistoryCount,
    historyCount,
    chatLoadingId,
    deleteMessage,
    resendMessage,
    dispatchMessage,
    translateMessage,
  ] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [
      config.displayMode,
      config.enableHistoryCount,
      config.historyCount,
      s.chatLoadingId,
      s.deleteMessage,
      s.resendMessage,
      s.dispatchMessage,
      s.translateMessage,
    ];
  });

  const hotkeys = [PREFIX_KEY, REGENERATE_KEY].join('+');

  useHotkeys(
    hotkeys,
    () => {
      const lastMessage = data.at(-1);
      if (!lastMessage || lastMessage.id === 'default' || lastMessage.role === 'system') return;
      resendMessage(lastMessage.id);
    },
    {
      preventDefault: true,
    },
  );

  if (!init) return <SkeletonList />;

  return (
    <ChatList
      data={data}
      enableHistoryCount={enableHistoryCount}
      historyCount={historyCount}
      loadingId={chatLoadingId}
      onActionsClick={(action, { id, error }) => {
        switch (action.key) {
          case 'del': {
            deleteMessage(id);
            break;
          }
          case 'regenerate': {
            resendMessage(id);

            // if this message is an error message, we need to delete it
            if (error) deleteMessage(id);
            break;
          }
        }

        // click the menu item with translate item, the result is:
        // key: 'en-US'
        // keyPath: ['en-US','translate']
        if (action.keyPath.at(-1) === 'translate') {
          const lang = action.keyPath[0];
          translateMessage(id, lang);
        }
      }}
      onMessageChange={(id, content) =>
        dispatchMessage({ id, key: 'content', type: 'updateMessage', value: content })
      }
      renderActions={renderActions}
      renderErrorMessages={renderErrorMessages}
      renderMessages={renderMessages}
      renderMessagesExtra={renderMessagesExtra}
      style={{ marginTop: 24 }}
      text={{
        cancel: t('cancel'),
        confirm: t('ok'),
        copy: t('copy'),
        copySuccess: t('copySuccess'),
        delete: t('delete'),
        edit: t('edit'),
        history: t('historyRange'),
        regenerate: t('regenerate'),
      }}
      type={displayMode || 'chat'}
    />
  );
});

export default List;
