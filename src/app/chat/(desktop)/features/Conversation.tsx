import { memo } from 'react';

import RawConversation from '@/features/Conversation';

import ChatInput from './ChatInput';
import HotKeys from './HotKeys';

const Conversation = memo(() => {
  return (
    <>
      <RawConversation chatInput={<ChatInput />} />
      <HotKeys />
    </>
  );
});

export default Conversation;
