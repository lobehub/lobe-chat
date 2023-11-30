import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Header from './Header';
import { Topic } from './Topic';
import TopicSearchBar from './TopicSearchBar';

const TopicListContent = memo<{ mobile?: boolean }>(({ mobile }) => {
  return (
    <Flexbox height={'100%'} style={{ overflow: 'hidden' }}>
      {mobile ? (
        <Flexbox padding={'12px 16px'}>
          <TopicSearchBar />
        </Flexbox>
      ) : (
        <Header />
      )}
      <Flexbox
        gap={16}
        paddingInline={mobile ? 16 : 8}
        style={{ overflowY: 'auto', paddingTop: 6, position: 'relative' }}
      >
        <Topic />
      </Flexbox>
    </Flexbox>
  );
});

export default TopicListContent;
