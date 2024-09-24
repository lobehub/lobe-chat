import { PropsWithChildren } from 'react';

import Body from '../features/Body';
import Header from '../features/Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <Body>{children}</Body>
    </>
  );
};

export default Layout;
