import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

const MAX_WIDTH = 1440;

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox
      align={'center'}
      flex={1}
      padding={24}
      style={{ overflowX: 'hidden', overflowY: 'auto', position: 'relative' }}
      width={'100%'}
    >
      <Flexbox
        gap={24}
        style={{ maxWidth: MAX_WIDTH, minHeight: '100%', position: 'relative' }}
        width={'100%'}
      >
        {children}
      </Flexbox>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopDiscoverDetailLayout';

export default Layout;
