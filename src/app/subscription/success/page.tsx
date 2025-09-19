'use client';

import { Button, Card, Result } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useUserStore } from '@/store/user';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const search = useSearchParams();
  const refreshUserState = useUserStore((s) => s.refreshUserState);

  const orderCode = search.get('orderCode') || undefined;

  useEffect(() => {
    // Refresh user state so subscriptionPlan reflects immediately
    refreshUserState();
  }, [refreshUserState, orderCode]);

  return (
    <Card style={{ margin: '48px auto', maxWidth: 720 }}>
      <Result
        extra={[
          <Button key="home" onClick={() => router.push('/')} type="primary">
            Start using Premium
          </Button>,
          <Button key="plans" onClick={() => router.push('/subscription/plans')}>
            Back to plans
          </Button>,
        ]}
        status="success"
        subTitle={
          orderCode
            ? `Order ${orderCode} confirmed. Your account is now Premium.`
            : 'Your account is now Premium.'
        }
        title="Premium activated!"
      />
    </Card>
  );
}
