import { PropsWithChildren } from 'react';

import { isMobileDevice } from '@/utils/responsive';

import Desktop from './(desktop)/layout.desktop';
import Mobile from './(mobile)/layout.mobile';

const Layout = ({ children }: PropsWithChildren) => {
  const mobile = isMobileDevice();

  return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
};

export default Layout;
