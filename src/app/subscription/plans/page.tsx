'use client';

import { Icon } from '@lobehub/ui';
import { Button, Card, Descriptions, Space, Typography } from 'antd';
import { CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import SepayPaymentButton from '@/components/SepayPayment/SepayPaymentButton';

const { Title, Text } = Typography;

export default function SubscriptionPlansPage() {
  const router = useRouter();

  return (
    <Card style={{ margin: '32px auto', maxWidth: 900, padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>
          Subscription Plans (VN Preview)
        </Title>
        <Text type="secondary">Select a plan and continue to VietQR payment for Vietnam</Text>

        <Card>
          <Descriptions column={1} title="LobeChat Premium - 1 month">
            <Descriptions.Item label="Price">29,000 VND</Descriptions.Item>
            <Descriptions.Item label="Payment">VietQR Bank Transfer</Descriptions.Item>
          </Descriptions>
          <Space>
            <SepayPaymentButton amount={29_000} description="LobeChat Premium - 1 month">
              Pay with Sepay (VietQR)
            </SepayPaymentButton>
            <Button icon={<Icon icon={CreditCard} />} onClick={() => router.push('/payment')}>
              Other options
            </Button>
          </Space>
        </Card>
      </Space>
    </Card>
  );
}
