'use client';

import { memo } from 'react';
import { Center } from 'react-layout-kit';

import LoginForm from '@/app/login/features/LoginForm/LoginForm';
import { useStyles } from '@/app/welcome/features/Banner/style';

import LoginDesktopLayout from './layout.desktop';

export default memo(() => {
  const { styles } = useStyles();

  return (
    <LoginDesktopLayout>
      <Center
        className={styles.layout}
        flex={1}
        height={'100%'}
        horizontal
        style={{ position: 'relative' }}
      >
        <LoginForm />
      </Center>
    </LoginDesktopLayout>
  );
});
