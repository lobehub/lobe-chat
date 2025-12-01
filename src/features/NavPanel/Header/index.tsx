'use client';

import { memo } from 'react';

import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';

import AddButton from './components/AddButton';
import Nav from './components/Nav';

const Header = memo(() => {
  return (
    <>
      <SideBarHeaderLayout liteUserInfo={false} right={<AddButton />} showBack={false} />
      <Nav />
    </>
  );
});

export default Header;
