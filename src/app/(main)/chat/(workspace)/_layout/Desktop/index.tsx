import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from '../type';
import ChatHeader from './ChatHeader';
import HotKeys from './HotKeys';
import SideBar from './SideBar';

const Layout = ({ children, topic, conversation }: LayoutProps) => {
  return (
    <>
      <ChatHeader />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        {conversation}
        {children}
        <SideBar>{topic}</SideBar>
      </Flexbox>
      <HotKeys />
    </>
  );
};

Layout.displayName = 'DesktopConversationLayout';

export default Layout;
