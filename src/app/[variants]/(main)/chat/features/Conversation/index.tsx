import { Flexbox, TooltipGroup } from '@lobehub/ui';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import ConversationArea from './ConversationArea';
import ChatHeader from './Header';

const ChatConversation = memo(() => {
  const showHeader = useGlobalStore(systemStatusSelectors.showChatHeader);
  return (
    <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
      {showHeader && <ChatHeader />}
      <TooltipGroup>
        <ConversationArea />
      </TooltipGroup>
    </Flexbox>
  );
});

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
