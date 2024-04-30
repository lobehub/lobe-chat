import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { MAX_WIDTH } from '@/const/layoutTokens';

import { LayoutProps } from '../type';
import Header from './Header';
import Hero from './Hero';

const Layout = memo<LayoutProps>(({ children, detail }) => {
  return (
    <Flexbox flex={1} height={'100%'} id={'lobe-market-container'} style={{ position: 'relative' }}>
      <Header />
      <Flexbox flex={1} height={'calc(100% - 64px)'} horizontal>
        <Flexbox align={'center'} flex={1} style={{ overflowY: 'scroll', padding: 16 }}>
          <SafeSpacing />
          <Flexbox gap={16} style={{ maxWidth: MAX_WIDTH, position: 'relative', width: '100%' }}>
            <Hero />
            {children}
          </Flexbox>
        </Flexbox>
        {detail}
      </Flexbox>
    </Flexbox>
  );
});

Layout.displayName = 'DesktopMarketLayout';

export default Layout;
