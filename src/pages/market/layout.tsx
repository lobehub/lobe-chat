import { PropsWithChildren, memo } from 'react';
import { Center } from 'react-layout-kit';

import AppLayout from '../../layout/AppLayout';

const MarketLayout = memo<PropsWithChildren>(({ children }) => {
  return (
    <AppLayout>
      <Center style={{ width: '100%' }}>{children}</Center>
    </AppLayout>
  );
});

export default MarketLayout;
