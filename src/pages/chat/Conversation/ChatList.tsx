import { ChatList } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { chatSelectors, useChatStore } from '@/store/session';

const List = () => {
  const data = useChatStore(chatSelectors.currentChats, isEqual);
  const [deleteMessage, resendMessage] = useChatStore((s) => [s.deleteMessage, s.resendMessage], shallow);

  return (
    <ChatList
      data={data}
      onActionClick={(key, id) => {
        switch (key) {
          case 'delete':
            deleteMessage(id);
            break;

          case 'regenerate':
            resendMessage(id);
            break;
        }
      }}
      style={{ marginTop: 24 }}
    />
  );
};

export default memo(List);
