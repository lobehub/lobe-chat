import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import AppLayout from '@/layout/AppLayout';

import Header from './features/Header';

const SettingLayout = memo<{ children: ReactNode }>(({ children }) => {
  return (
    <AppLayout>
      <Flexbox flex={1} height={'100vh'} style={{ position: 'relative' }}>
        <Header />
        <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'auto' }}>
          <SafeSpacing />
          {children}
        </Flexbox>
      </Flexbox>
    </AppLayout>
  );
});

export default SettingLayout;
