import { PropsWithChildren } from 'react';

import { PortalHeader } from '@/features/Portal/router';

import Body from '../features/Body';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <PortalHeader />
      <Body>{children}</Body>
    </>
  );
};

export default Layout;
