import { Flexbox } from 'react-layout-kit';

import ChatHeader from '../features/ChatHeader';
import ConversationArea from './features/ConversationArea';

const ChatConversation = () => {
  return (
    <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
      <ChatHeader />
      <ConversationArea mobile={false} />
    </Flexbox>
  );
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
