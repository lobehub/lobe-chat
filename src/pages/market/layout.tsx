import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { MAX_WIDTH } from '@/const/layoutTokens';

import AppLayout from '../../layout/AppLayout';
import Header from './features/Header';
import SideBar from './features/SideBar';

const MarketLayout = memo<PropsWithChildren>(({ children }) => {
  return (
    <AppLayout>
      <Flexbox
        flex={1}
        height={'100vh'}
        id={'lobe-market-container'}
        style={{ position: 'relative' }}
      >
        <Header />
        <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
          <Flexbox align={'center'} flex={1} style={{ overflow: 'auto', padding: 16 }}>
            <SafeSpacing />
            <Flexbox gap={16} style={{ maxWidth: MAX_WIDTH, width: '100%' }}>
              {children}
            </Flexbox>
          </Flexbox>
          <SideBar />
        </Flexbox>
      </Flexbox>
    </AppLayout>
  );
});

export default MarketLayout;
