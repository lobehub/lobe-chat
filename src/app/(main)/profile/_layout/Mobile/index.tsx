import { PropsWithChildren } from 'react';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

Layout.displayName = 'ProfileMobileLayout';

export default Layout;
