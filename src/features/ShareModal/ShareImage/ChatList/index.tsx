import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatItem } from '@/features/ChatList';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

const ChatList = memo(() => {
  const ids = useChatStore((s) => {
    const allIds = chatSelectors.mainDisplayChatIDs(s);
    if (s.isMessageSelectionMode && s.messageSelectionIds.length > 0) {
      return allIds.filter((id) => s.messageSelectionIds.includes(id));
    }
    return allIds;
  });

  return (
    <Flexbox height={'100%'} style={{ paddingTop: 24, position: 'relative' }} width={'100%'}>
      {ids.map((id, index) => (
        <ChatItem id={id} index={index} key={id} showSelection={false} />
      ))}
    </Flexbox>
  );
});

export default ChatList;
