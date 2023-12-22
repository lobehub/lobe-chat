import { ChatList } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { PREFIX_KEY, REGENERATE_KEY } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import { renderActions, useActionsClick } from './Actions';
import { renderErrorMessages } from './Error';
import { renderMessagesExtra } from './Extras';
import { renderMessages, useAvatarsClick } from './Messages';
import SkeletonList from './SkeletonList';

const List = memo(() => {
  const { t } = useTranslation('common');
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const data = useChatStore(chatSelectors.currentChatsWithGuideMessage(meta), isEqual);

  const [init, chatLoadingId, resendMessage, updateMessageContent] = useChatStore((s) => [
    s.messagesInit,
    s.chatLoadingId,
    s.resendMessage,
    s.updateMessageContent,
  ]);

  const [displayMode, enableHistoryCount, historyCount] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.displayMode, config.enableHistoryCount, config.historyCount];
  });
  const onActionsClick = useActionsClick();
  const onAvatarsClick = useAvatarsClick();

  const hotkeys = [PREFIX_KEY, REGENERATE_KEY].join('+');

  useHotkeys(
    hotkeys,
    () => {
      const lastMessage = data.at(-1);
      if (!lastMessage || lastMessage.id === 'default' || lastMessage.role === 'system') return;
      resendMessage(lastMessage.id);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  );

  if (!init) return <SkeletonList />;

  return (
    <ChatList
      data={data as any}
      enableHistoryCount={enableHistoryCount}
      historyCount={historyCount}
      loadingId={chatLoadingId}
      onActionsClick={onActionsClick}
      onAvatarsClick={onAvatarsClick}
      onMessageChange={(id, content) => updateMessageContent(id, content)}
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
