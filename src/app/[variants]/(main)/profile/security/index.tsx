'use client';

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Navigate } from 'react-router-dom';

import { enableClerk } from '@/const/auth';

const ClerkProfile = dynamic(() => import('../features/ClerkProfile'), {
  loading: () => (
    <div style={{ flex: 1 }}>
      <Skeleton paragraph={{ rows: 8 }} title={false} />
    </div>
  ),
});

const MobileProfileSecurityPage = memo(() => {
  const mobile = true;
  return enableClerk ? <ClerkProfile mobile={mobile} /> : <Navigate replace to="/profile" />;
});


const DesktopProfileSecurityPage = memo(() => {
  const mobile = false;
  return enableClerk ? <ClerkProfile mobile={mobile} /> : <Navigate replace to="/profile" />;
});

export { DesktopProfileSecurityPage,MobileProfileSecurityPage };
