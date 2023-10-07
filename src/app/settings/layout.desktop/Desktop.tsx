import { PropsWithChildren } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import AppLayout from '@/layout/AppLayout';

import Header from '../features/Header';
import SideBar from '../features/SideBar';

const SettingLayout = ({ children }: PropsWithChildren) => {
  return (
    <AppLayout>
      <SideBar />
      <Flexbox flex={1} height={'100vh'} style={{ position: 'relative' }}>
        <Header />
        <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'auto' }}>
          <SafeSpacing />
          <Center gap={16} width={'100%'}>
            {children}
          </Center>
        </Flexbox>
      </Flexbox>
    </AppLayout>
  );
};

export default SettingLayout;
