import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { HEADER_HEIGHT } from '@/const/layoutTokens';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => (
  <>
    <Header />
    <Flexbox
      align={'center'}
      height={'100%'}
      style={{ overflowX: 'hidden', overflowY: 'auto' }}
      width={'100%'}
    >
      <SafeSpacing height={HEADER_HEIGHT - 16} />
      <Flexbox gap={64} style={{ maxWidth: 1024, padding: '24px 20px 24px 28px' }} width={'100%'}>
        {children}
      </Flexbox>
    </Flexbox>
  </>
);

Layout.displayName = 'DesktopSessionSettingsLayout';

export default Layout;
