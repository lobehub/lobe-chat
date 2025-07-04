import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/discover/features/const';
import Footer from '@/features/Setting/Footer';

const MAX_WIDTH = 1440;

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox
      align={'center'}
      flex={1}
      id={SCROLL_PARENT_ID}
      padding={24}
      style={{ overflowX: 'hidden', overflowY: 'auto', position: 'static' }}
      width={'100%'}
    >
      <Flexbox gap={24} style={{ maxWidth: MAX_WIDTH, minHeight: '100%' }} width={'100%'}>
        {children}
        <div />
        <Footer />
      </Flexbox>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopDiscoverDetailLayout';

export default Layout;
