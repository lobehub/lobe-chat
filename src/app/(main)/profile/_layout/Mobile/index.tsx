import { PropsWithChildren } from 'react';

import Header from './Header';

const MobileLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default MobileLayout;
