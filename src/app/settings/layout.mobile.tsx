import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';

import Header from './features/Header';

const SettingLayout = memo<{ children: ReactNode }>(({ children }) => {
  return (
    <AppMobileLayout navBar={<Header />}>
      <Flexbox align={'center'} padding={16} style={{ overflow: 'auto' }}>
        {children}
      </Flexbox>
    </AppMobileLayout>
  );
});

export default SettingLayout;
