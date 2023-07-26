import { ChatList, ChatMessage } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { agentSelectors, chatSelectors, useSessionStore } from '@/store/session';
import { isFunctionMessage } from '@/utils/message';

import FunctionMessage from './FunctionMessage';
import MessageExtra from './MessageExtra';

const List = () => {
  const { t } = useTranslation('common');
  const data = useSessionStore(chatSelectors.currentChats, isEqual);
  const [displayMode, deleteMessage, resendMessage, dispatchMessage] = useSessionStore(
    (s) => [
      agentSelectors.currentAgentConfigSafe(s).displayMode,
      s.deleteMessage,
      s.resendMessage,
      s.dispatchMessage,
    ],
    shallow,
  );

  const renderMessage = (content: ReactNode, message: ChatMessage) => {
    if (message.role === 'function')
      return isFunctionMessage(message.content) ? <FunctionMessage /> : content;

    return content;
  };

  return (
    <ChatList
      data={data}
      onActionClick={(key, id) => {
        switch (key) {
          case 'delete': {
            deleteMessage(id);
            break;
          }

          case 'regenerate': {
            resendMessage(id);
            break;
          }
        }
      }}
      onMessageChange={(id, content) => {
        dispatchMessage({ id, key: 'content', type: 'updateMessage', value: content });
      }}
      renderMessage={renderMessage}
      renderMessageExtra={MessageExtra}
      style={{ marginTop: 24 }}
      text={{
        cancel: t('cancel'),
        confirm: t('ok'),
        copy: t('copy'),
        copySuccess: t('copySuccess'),
        delete: t('delete'),
        edit: t('edit'),
        regenerate: t('regenerate'),
      }}
      type={displayMode}
    />
  );
};

export default memo(List);
