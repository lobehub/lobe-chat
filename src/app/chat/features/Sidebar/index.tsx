import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Desktop from './Desktop';
import Mobile from './Mobile';
import { Topic } from './Topic';
import TopicSearchBar from './TopicSearchBar';

const SideBar = memo(() => {
  const { mobile } = useResponsive();

  const Render = mobile ? Mobile : Desktop;

  return (
    <Render>
      <Flexbox height={'100%'} style={{ overflow: 'hidden' }}>
        <Flexbox padding={16}>
          <TopicSearchBar />
        </Flexbox>
        <Flexbox gap={16} paddingInline={16} style={{ overflowY: 'auto', position: 'relative' }}>
          <Topic />
        </Flexbox>
      </Flexbox>
    </Render>
  );
});

export default SideBar;
