'use client';

import dynamic from 'next/dynamic';
import { FC, PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ClientLayout from '@/components/client/ClientLayout';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import ResponsiveSessionList from './SessionList';

const Desktop = memo(({ children }: PropsWithChildren) => {
  return (
    <>
      <ResponsiveSessionList />
      <Flexbox
        flex={1}
        height={'100%'}
        id={'lobe-conversion-container'}
        style={{ position: 'relative' }}
      >
        {children}
      </Flexbox>
    </>
  );
});

const Mobile = dynamic(() => import('../Mobile'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC<PropsWithChildren>;

export default ClientLayout({ Desktop, Mobile });
