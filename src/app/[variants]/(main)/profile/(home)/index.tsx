'use client';

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { enableClerk } from '@/const/auth';

import ProfileClient from './Client';

const ClerkProfile = dynamic(() => import('../features/ClerkProfile'), {
  loading: () => (
    <div style={{ flex: 1 }}>
      <Skeleton paragraph={{ rows: 8 }} title={false} />
    </div>
  ),
});

const MobileProfileHomePage = memo(() => {
  const mobile = true;
  return enableClerk ? <ClerkProfile mobile={mobile} /> : <ProfileClient mobile={mobile} />;
});

MobileProfileHomePage.displayName = 'MobileProfileHomePage';

export default MobileProfileHomePage;
