import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppLayout from '@/layout/AppLayout';

const SettingLayout = memo<{ children: ReactNode }>(({ children }) => {
  return (
    <AppLayout>
      <Flexbox flex={1} height={'100vh'} style={{ position: 'relative' }}>
        {children}
      </Flexbox>
    </AppLayout>
  );
});

export default SettingLayout;
