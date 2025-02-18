import { ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

import Hero from '../features/Hero';

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <Flexbox
      align={'center'}
      style={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}
      width={'100%'}
    >
      <Flexbox gap={24} paddingBlock={24} paddingInline={16} style={{ width: 'min(100%, 1024px)' }}>
        <Hero />
        {children}
      </Flexbox>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopChangelogLayout';

export default Layout;
