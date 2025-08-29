'use client';

import { PropsWithChildren, memo } from 'react';

import SettingContainer from '@/features/Setting/SettingContainer';

const Container = memo<PropsWithChildren>(({ children }) => {
  return <SettingContainer>{children}</SettingContainer>;
});
export default Container;
