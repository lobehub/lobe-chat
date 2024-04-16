'use client';

import { MobileNavBar } from '@lobehub/ui';
import { Logo } from '@/app/ui/es';
import { memo } from 'react';

import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  return (
    <MobileNavBar
      center={<Logo type={'text'} />}
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
