import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Header from './Header';
import { Topic } from './Topic';
import TopicSearchBar from './TopicSearchBar';

const TopicListContent = memo<{ mobile?: boolean }>(({ mobile }) => {
  return (
    <Flexbox gap={mobile ? 8 : 0} height={'100%'} style={{ overflow: 'hidden' }}>
      {mobile ? <TopicSearchBar /> : <Header />}
      <Flexbox gap={16} height={'100%'} style={{ paddingTop: 6, position: 'relative' }}>
        <Topic />
      </Flexbox>
    </Flexbox>
  );
});

export default TopicListContent;
