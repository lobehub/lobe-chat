import { memo } from 'react';

import ConfigSwitcher from './ConfigSwitcher';
import Topic from './Topic';
import TopicPanel from './TopicPanel';

const ChatTopic = memo(() => {
  return (
    <TopicPanel>
      <ConfigSwitcher />
      <Topic />
    </TopicPanel>
  );
});

ChatTopic.displayName = 'ChatTopic';

export default ChatTopic;
