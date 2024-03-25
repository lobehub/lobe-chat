'use client';

import dynamic from 'next/dynamic';
import { FC, PropsWithChildren } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import ClientLayout from '@/components/client/ClientLayout';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import Header from './Header';
import SideBar from './SideBar';

const Desktop = ({ children }: PropsWithChildren) => (
  <>
    <SideBar />
    <Flexbox flex={1} height={'100%'} style={{ position: 'relative' }}>
      <Header />
      <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'scroll' }}>
        <SafeSpacing />
        <Center gap={16} width={'100%'}>
          {children}
        </Center>
      </Flexbox>
    </Flexbox>
  </>
);

const Mobile = dynamic(() => import('../Mobile'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC<PropsWithChildren>;

export default ClientLayout({ Desktop, Mobile });
