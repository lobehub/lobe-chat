import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import Footer from '@/features/Setting/Footer';
import WideScreenContainer from '@/features/WideScreenContainer';

import { MAX_WIDTH } from '../../features/const';
import Header from './Header';

const Layout = () => {
  return (
    <>
      <Header />
      <Flexbox height={'100%'} style={{ overflowY: 'auto' }} width={'100%'}>
        <WideScreenContainer gap={32} minWidth={MAX_WIDTH} paddingBlock={16}>
          {<Outlet />}
          <div />
          <Footer />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
};

Layout.displayName = 'DesktopDiscoverStoreLayout';

export default Layout;
