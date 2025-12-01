'use client';

import { PropsWithChildren, memo } from 'react';

import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

const Header = memo<PropsWithChildren>(() => {
  return <SideBarHeaderLayout left="画图" />;
});

export default Header;
