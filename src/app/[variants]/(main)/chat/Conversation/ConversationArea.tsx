import { memo } from 'react';

import ChatHydration from '@/app/[variants]/(main)/chat/Conversation/ChatHydration';
import ChatInput from '@/app/[variants]/(main)/chat/Conversation/ChatInput';
import ChatList from '@/app/[variants]/(main)/chat/Conversation/ChatList';
import ChatMinimap from '@/app/[variants]/(main)/chat/Conversation/ChatMinimap';
import ThreadHydration from '@/app/[variants]/(main)/chat/Conversation/ThreadHydration';
import ZenModeToast from '@/app/[variants]/(main)/chat/Conversation/ZenModeToast';

interface ConversationAreaProps {
  mobile?: boolean;
}

const ConversationArea = memo<ConversationAreaProps>(({ mobile = false }) => {
  return (
    <>
      <ZenModeToast />
      <ChatList mobile={mobile} />
      <ChatInput mobile={mobile} />
      <ChatHydration />
      <ThreadHydration />
      {!mobile && <ChatMinimap />}
    </>
  );
});

ConversationArea.displayName = 'ConversationArea';

export default ConversationArea;
