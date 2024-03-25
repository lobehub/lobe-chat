'use client';

import { Logo } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { FC, PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import ClientLayout from '@/components/client/ClientLayout';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import { useStyles } from '../features/Banner/style';

const Desktop = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <Center
      className={styles.layout}
      flex={1}
      height={'100%'}
      horizontal
      style={{ position: 'relative' }}
    >
      <Logo className={styles.logo} size={36} type={'text'} />
      <Flexbox className={styles.view} flex={1}>
        {children}
      </Flexbox>
    </Center>
  );
});

const Mobile = dynamic(() => import('./Mobile'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC<PropsWithChildren>;

export default ClientLayout({ Desktop, Mobile });
