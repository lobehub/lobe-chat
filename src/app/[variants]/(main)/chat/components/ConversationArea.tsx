import { memo } from 'react';

import ChatHydration from './conversation/features/ChatHydration';
import ChatInput from './conversation/features/ChatInput';
import ChatList from './conversation/features/ChatList';
import ChatMinimap from './conversation/features/ChatMinimap';
import ThreadHydration from './conversation/features/ThreadHydration';
import ZenModeToast from './conversation/features/ZenModeToast';

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
