import { Flexbox } from 'react-layout-kit';

import { Topic } from './Topic';
import TopicSearchBar from './TopicSearchBar';

const TopicListContent = () => {
  return (
    <Flexbox height={'100%'} style={{ overflow: 'hidden' }}>
      <Flexbox padding={16}>
        <TopicSearchBar />
      </Flexbox>
      <Flexbox gap={16} paddingInline={16} style={{ overflowY: 'auto', position: 'relative' }}>
        <Topic />
      </Flexbox>
    </Flexbox>
  );
};

export default TopicListContent;
