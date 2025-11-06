import { memo } from 'react';

import ChatHydration from '../(workspace)/@conversation/features/ChatHydration';
import ChatInput from '../(workspace)/@conversation/features/ChatInput';
import ChatList from '../(workspace)/@conversation/features/ChatList';
import ChatMinimap from '../(workspace)/@conversation/features/ChatMinimap';
import ThreadHydration from '../(workspace)/@conversation/features/ThreadHydration';
import ZenModeToast from '../(workspace)/@conversation/features/ZenModeToast';

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
