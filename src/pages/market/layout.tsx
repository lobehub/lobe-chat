import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { MAX_WIDTH } from '@/const/layoutTokens';

import AppLayout from '../../layout/AppLayout';
import Header from './features/Header';

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
        <Flexbox align={'center'} flex={1} style={{ overflow: 'auto', padding: 16 }}>
          <SafeSpacing />
          <Flexbox gap={16} style={{ maxWidth: MAX_WIDTH }}>
            {children}
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </AppLayout>
  );
});

export default MarketLayout;
