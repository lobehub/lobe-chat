'use client';

import { Icon } from '@lobehub/ui';
import { Button, Card, Form, Input, InputNumber, Space, Typography } from 'antd';
import { CreditCard, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function PaymentMethodSelectPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(29_000);
  const [description, setDescription] = useState<string>('LobeChat VietQR Payment');

  const goVietQR = () => {
    const q = new URLSearchParams({ amount: String(amount), description });
    router.push(`/payment/checkout?${q.toString()}`);
  };

  return (
    <Card style={{ margin: '32px auto', maxWidth: 720, padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        {t('payment.select.title', 'Select Payment Method')}
      </Title>

      <Form layout="vertical">
        <Form.Item label={t('payment.select.amount', 'Amount (VND)')}>
          <InputNumber
            min={1000}
            onChange={(v) => setAmount(Number(v) || 0)}
            step={1000}
            style={{ width: 240 }}
            value={amount}
          />
        </Form.Item>

        <Form.Item label={t('payment.select.description', 'Description')}>
          <Input
            maxLength={120}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('payment.select.placeholder', 'What is this payment for?')}
            value={description}
          />
        </Form.Item>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space size="middle">
            <Button icon={<Icon icon={QrCode} />} onClick={goVietQR} type="primary">
              {t('payment.select.vietqr', 'Pay with VietQR (Bank transfer)')}
            </Button>
            <Text type="secondary">
              {t('payment.select.note', 'Create a QR and complete the transfer')}
            </Text>
          </Space>
          <Space size="middle">
            <Button icon={<Icon icon={CreditCard} />} onClick={goVietQR}>
              {t('payment.select.sepay', 'Pay with Sepay (VietQR / Napas 24/7)')}
            </Button>
            <Text type="secondary">
              {t('payment.select.sepayNote', 'Create a Sepay VietQR and complete the transfer')}
            </Text>
          </Space>
        </Space>
      </Form>
    </Card>
  );
}
