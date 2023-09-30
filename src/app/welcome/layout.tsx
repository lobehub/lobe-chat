import { PropsWithChildren } from 'react';

import { isMobileDevice } from '@/utils/responsive';

import Desktop from './DesktopLayout';
import Mobile from './MobileLayout';
import Footer from './features/Footer';

const Layout = ({ children }: PropsWithChildren) => {
  const mobile = isMobileDevice();

  return mobile ? (
    <Mobile>{children}</Mobile>
  ) : (
    <Desktop>
      {children}
      <Footer />
    </Desktop>
  );
};

export default Layout;
