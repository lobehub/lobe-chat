'use client';

import { PropsWithChildren, memo } from 'react';

import SettingContainer from '@/features/Setting/SettingContainer';

const Container = memo<PropsWithChildren>(({ children }) => {
  return <SettingContainer style={{
    paddingBlock: 24,
    paddingInline: 32
  }}>{children}</SettingContainer>;
});
export default Container;
