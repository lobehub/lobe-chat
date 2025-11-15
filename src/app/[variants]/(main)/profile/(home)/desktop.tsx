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

const DesktopProfileHomePage = memo(() => {
  const mobile = false;
  return enableClerk ? <ClerkProfile mobile={mobile} /> : <ProfileClient mobile={mobile} />;
});

DesktopProfileHomePage.displayName = 'DesktopProfileHomePage';

export default DesktopProfileHomePage;
