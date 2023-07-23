import { ChatList, ChatMessage } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo } from 'react';
import { shallow } from 'zustand/shallow';

import { chatSelectors, useSessionStore } from '@/store/session';
import { isFunctionMessage } from '@/utils/message';

import FunctionMessage from './FunctionMessage';
import MessageExtra from './MessageExtra';

const List = () => {
  const data = useSessionStore(chatSelectors.currentChats, isEqual);
  const [deleteMessage, resendMessage, dispatchMessage] = useSessionStore(
    (s) => [s.deleteMessage, s.resendMessage, s.dispatchMessage],
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
    />
  );
};

export default memo(List);
