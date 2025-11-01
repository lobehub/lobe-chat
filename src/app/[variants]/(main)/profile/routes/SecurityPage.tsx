'use client';

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { enableClerk } from '@/const/auth';

const ClerkProfile = dynamic(() => import('../features/ClerkProfile'), {
  loading: () => (
    <div style={{ flex: 1 }}>
      <Skeleton paragraph={{ rows: 8 }} title={false} />
    </div>
  ),
});

const SecurityPage = memo<{ mobile?: boolean }>(({ mobile }) => {
  if (!enableClerk) return null;

  return <ClerkProfile mobile={mobile} />;
});

export default SecurityPage;
