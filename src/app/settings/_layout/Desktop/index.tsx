'use client';

import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import ClientResponsiveLayout from '@/components/client/ClientResponsiveLayout';

import Header from './Header';
import SideBar from './SideBar';

const Desktop = memo<PropsWithChildren>(({ children }) => (
  <>
    <SideBar />
    <Flexbox flex={1} height={'100%'} style={{ position: 'relative' }}>
      <Header />
      <Flexbox align={'center'} flex={1} padding={24} style={{ overflowY: 'scroll' }}>
        <SafeSpacing />
        <Center gap={16} width={'100%'}>
          {children}
        </Center>
      </Flexbox>
    </Flexbox>
  </>
));

export default ClientResponsiveLayout({ Desktop, Mobile: () => import('../Mobile') });
