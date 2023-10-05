import { memo } from 'react';

import { ChatInputContent } from '../../components/ChatInput';
import Mobile from '../../components/ChatInput/Mobile';

const ChatInput = () => {
  return (
    <Mobile>
      <ChatInputContent mobile />
    </Mobile>
  );
};

export default memo(ChatInput);
