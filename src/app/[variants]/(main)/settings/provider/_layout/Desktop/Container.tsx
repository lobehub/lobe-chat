'use client';

import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import NavHeader from '@/features/NavHeader';
import SettingContainer from '@/features/Setting/SettingContainer';

const Container = memo<PropsWithChildren>(({ children }) => {
  return (
    <Flexbox height={'100%'} width={'100%'}>
      <NavHeader />
      <SettingContainer maxWidth={1024} padding={24}>
        {children}
      </SettingContainer>
    </Flexbox>
  );
});
export default Container;
