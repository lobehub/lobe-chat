import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from '../type';
import ResponsiveSessionList from './SessionList';

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <ResponsiveSessionList />
      <Flexbox
        flex={1}
        height={'100%'}
        id={'lobe-conversion-container'}
        style={{ position: 'relative' }}
      >
        {children}
      </Flexbox>
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
