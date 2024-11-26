import { ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

import Hero from '../features/Hero';

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <Flexbox align={'center'} style={{ minHeight: '100vh' }} width={'100%'}>
      <Flexbox style={{ gap: 24, width: 'min(100%, 1024px)' }}>
        <Hero />
        {children}
      </Flexbox>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopChangelogLayout';

export default Layout;
