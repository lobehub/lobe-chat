import { ChatList } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { chatSelectors, useSessionStore } from '@/store/session';

import MessageExtra from './MessageExtra';

const List = () => {
  const data = useSessionStore(chatSelectors.currentChats, isEqual);
  const [deleteMessage, resendMessage, dispatchMessage] = useSessionStore(
    (s) => [s.deleteMessage, s.resendMessage, s.dispatchMessage],
    shallow,
  );

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
      renderMessageExtra={MessageExtra}
      style={{ marginTop: 24 }}
    />
  );
};

export default memo(List);
