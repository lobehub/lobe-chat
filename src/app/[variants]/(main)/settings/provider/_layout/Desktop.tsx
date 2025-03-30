'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import NProgress from '@/components/NProgress';
import SettingContainer from '@/features/Setting/SettingContainer';

import ProviderMenu from '../ProviderMenu';

const Layout = memo<PropsWithChildren>(({ children }) => {
  const path = usePathname();
  const isRoot = path === '/settings/provider';
  return (
    <>
      <NProgress />
      <Flexbox horizontal width={'100%'}>
        <ProviderMenu />
        <SettingContainer variant={isRoot ? 'secondary' : undefined}>{children}</SettingContainer>
      </Flexbox>
    </>
  );
});
export default Layout;
