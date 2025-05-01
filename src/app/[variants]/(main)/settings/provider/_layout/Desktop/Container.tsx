'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';

import SettingContainer from '@/features/Setting/SettingContainer';

const Container = memo<PropsWithChildren>(({ children }) => {
  const path = usePathname();
  const isRoot = path === '/settings/provider';
  return <SettingContainer variant={isRoot ? 'secondary' : undefined}>{children}</SettingContainer>;
});
export default Container;
