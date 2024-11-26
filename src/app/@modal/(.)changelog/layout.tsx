'use client';

import { FC, PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';

import ModalLayout from '../_layout/ModalLayout';
import Hero from './features/Hero';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const [useCheckLatestChangelogId, updateSystemStatus] = useGlobalStore((s) => [
    s.useCheckLatestChangelogId,
    s.updateSystemStatus,
  ]);
  const { data } = useCheckLatestChangelogId();

  return (
    <ModalLayout
      centered
      closeIconProps={{
        active: true,
        glass: true,
      }}
      height={'min(90vh, 800px)'}
      onCancel={() => {
        if (!data) return;
        console.log(data);
        updateSystemStatus({ latestChangelogId: data });
      }}
      width={'min(90vw, 600px)'}
    >
      <Flexbox
        style={{ overflowX: 'hidden', overflowY: 'auto', position: 'relative' }}
        width={'100%'}
      >
        <Hero />
        {children}
      </Flexbox>
    </ModalLayout>
  );
};

export default Layout;
