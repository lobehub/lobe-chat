import { memo } from 'react';

import ConfigSwitcher from './ConfigSwitcher';
import Header from './Header';
import Topic from './Topic';
import TopicPanel from './TopicPanel';

const ChatTopic = memo(() => {
  return (
    <TopicPanel>
      <Header />
      <ConfigSwitcher />
      <Topic />
    </TopicPanel>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
