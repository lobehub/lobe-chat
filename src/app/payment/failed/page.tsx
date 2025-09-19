'use client';

import { Button, Card, Result, Space, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export default function PaymentFailedPage() {
  const search = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const orderCode = search.get('orderCode');

  return (
    <Card style={{ margin: '48px auto', maxWidth: 720, padding: 24 }}>
      <Result
        extra={[
          <Button key="retry" onClick={() => router.push('/payment/checkout')} type="primary">
            {t('payment.result.tryAgain', 'Try again')}
          </Button>,
          <Button key="home" onClick={() => router.push('/')}>
            {t('payment.result.backHome', 'Back to Home')}
          </Button>,
        ]}
        status="error"
        subTitle={
          <Space direction="vertical">
            <Text>
              {t('payment.result.failedSub', 'Unfortunately, your payment could not be confirmed.')}
            </Text>
            {orderCode && (
              <Text type="secondary">
                {t('payment.result.order', 'Order Code')}: {orderCode}
              </Text>
            )}
            <Text>
              {t(
                'payment.result.failedHelp',
                'Please try again or contact support if the charge went through.',
              )}
            </Text>
          </Space>
        }
        title={t('payment.result.failedTitle', 'Payment Failed')}
      />
    </Card>
  );
}
