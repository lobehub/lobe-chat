'use client';

import { Logo, MobileNavBar } from '@lobehub/ui';
import { memo } from 'react';

import { mobileHeaderSticky } from '@/styles/mobileHeader';

import ShareAgentButton from '../../features/ShareAgentButton';

const Header = memo(() => {
  return (
    <MobileNavBar
      center={<Logo type={'text'} />}
      right={<ShareAgentButton mobile />}
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
