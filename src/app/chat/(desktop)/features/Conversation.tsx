import { memo } from 'react';
import TelemetryNotification from 'src/app/chat/features/TelemetryNotification';

import RawConversation from '@/features/Conversation';

import ChatInput from './ChatInput';
import HotKeys from './HotKeys';

const Conversation = memo(() => {
  return (
    <>
      <RawConversation chatInput={<ChatInput />} />
      <HotKeys />
      <TelemetryNotification />
    </>
  );
});

export default Conversation;
