import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from '../type';
import ChatHeader from './ChatHeader';
import Inspector from './Dock';
import HotKeys from './HotKeys';
import TopicPanel from './TopicPanel';

const Layout = ({ children, topic, conversation, dock }: LayoutProps) => {
  return (
    <>
      <ChatHeader />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Flexbox
          height={'100%'}
          style={{ overflow: 'hidden', position: 'relative' }}
          width={'100%'}
        >
          {conversation}
        </Flexbox>
        {children}
        <Inspector>{dock}</Inspector>
        <TopicPanel>{topic}</TopicPanel>
      </Flexbox>
      <HotKeys />
    </>
  );
};

Layout.displayName = 'DesktopConversationLayout';

export default Layout;
