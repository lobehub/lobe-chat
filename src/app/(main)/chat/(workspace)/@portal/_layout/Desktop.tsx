import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import Header from '../features/Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <Flexbox height={'100%'} style={{ position: 'relative' }} width={'100%'}>
        {children}
      </Flexbox>
    </>
  );
};

export default Layout;
