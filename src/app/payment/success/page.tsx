'use client';

import { Button, Card, Result, Space, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export default function PaymentSuccessPage() {
  const search = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const orderCode = search.get('orderCode');

  return (
    <Card style={{ margin: '48px auto', maxWidth: 720, padding: 24 }}>
      <Result
        extra={[
          <Button key="home" onClick={() => router.push('/')} type="primary">
            {t('payment.result.backHome', 'Back to Home')}
          </Button>,
          <Button key="again" onClick={() => router.push('/payment/checkout')}>
            {t('payment.result.newPayment', 'New payment')}
          </Button>,
        ]}
        status="success"
        subTitle={
          <Space direction="vertical">
            <Text>
              {t('payment.result.successSub', 'Thank you! Your payment has been confirmed.')}
            </Text>
            {orderCode && (
              <Text type="secondary">
                {t('payment.result.order', 'Order Code')}: {orderCode}
              </Text>
            )}
          </Space>
        }
        title={t('payment.result.successTitle', 'Payment Successful')}
      />
    </Card>
  );
}
