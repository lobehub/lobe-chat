'use client';

import { Flexbox } from '@lobehub/ui';
import { FC, PropsWithChildren } from 'react';

import NavHeader from '@/features/NavHeader';
import SettingContainer from '@/features/Setting/SettingContainer';

const Container: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flexbox height={'100%'} width={'100%'}>
      <NavHeader />
      <SettingContainer maxWidth={1024} padding={24}>
        {children}
      </SettingContainer>
    </Flexbox>
  );
};
export default Container;
