import { Flexbox } from 'react-layout-kit';

import Footer from '@/features/Setting/Footer';

import { Outlet } from 'react-router-dom';

import { MAX_WIDTH, SCROLL_PARENT_ID } from '../../../features/const';
import Nav from './Nav';

const Layout = () => {
  return (
    <>
      <Nav />
      <Flexbox
        align={'center'}
        flex={1}
        id={SCROLL_PARENT_ID}
        padding={16}
        style={{ overflowX: 'hidden', overflowY: 'scroll', position: 'relative' }}
        width={'100%'}
      >
        <Flexbox
          gap={16}
          style={{ maxWidth: MAX_WIDTH, paddingTop: 64, position: 'relative' }}
          width={'100%'}
        >
          {<Outlet />}
          <div />
          <Footer />
        </Flexbox>
      </Flexbox>
    </>
  );
};

Layout.displayName = 'DesktopDiscoverStoreLayout';

export default Layout;
