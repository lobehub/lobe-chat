import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

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
        <Center flex={1}>{children}</Center>
      </Flexbox>
    </AppLayout>
  );
});

export default MarketLayout;
