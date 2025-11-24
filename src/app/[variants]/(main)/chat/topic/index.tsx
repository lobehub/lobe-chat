import React from 'react';

import TopicPanel from './features/TopicPanel';
import TopicSidebar from './features/TopicSidebar';

const ChatTopic = () => {
  return (
    <TopicPanel>
      <TopicSidebar mobile={false} />
    </TopicPanel>
  );
};

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
