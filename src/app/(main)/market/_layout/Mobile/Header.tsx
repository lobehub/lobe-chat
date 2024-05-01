'use client';

import { MobileNavBar } from '@lobehub/ui';
import { memo } from 'react';

import { mobileHeaderSticky } from '@/styles/mobileHeader';

import ShareAgentButton from '../../features/ShareAgentButton';

const Header = memo(() => {
  return (
    <MobileNavBar
      center={<div style={{ fontSize: 20, fontWeight: 900 }}>Discover</div>}
      right={<ShareAgentButton mobile />}
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
