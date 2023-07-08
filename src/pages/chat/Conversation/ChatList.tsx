import { ChatList } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { chatSelectors, useChatStore } from '@/store/session';

const List = () => {
  const data = useChatStore(chatSelectors.currentChats, isEqual);

  return <ChatList data={data}   />;
};

export default memo(List);
