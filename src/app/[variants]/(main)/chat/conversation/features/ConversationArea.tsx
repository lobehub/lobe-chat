import { memo } from 'react';

import ChatHydration from '@/app/[variants]/(main)/chat/conversation/features/ChatHydration';
import ChatInput from '@/app/[variants]/(main)/chat/conversation/features/ChatInput';
import ChatList from '@/app/[variants]/(main)/chat/conversation/features/ChatList';
import ChatMinimap from '@/app/[variants]/(main)/chat/conversation/features/ChatMinimap';
import ThreadHydration from '@/app/[variants]/(main)/chat/conversation/features/ThreadHydration';
import ZenModeToast from '@/app/[variants]/(main)/chat/conversation/features/ZenModeToast';

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
