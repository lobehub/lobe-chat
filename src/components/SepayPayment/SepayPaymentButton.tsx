'use client';

import { BankOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Divider, Modal, QRCode, Space, Spin, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function formatVNDAmount(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}

const { Title, Text } = Typography;

interface SepayPaymentButtonProps {
  amount: number;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  children?: React.ReactNode;
  className?: string;
  description: string;
  disabled?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  onError?: (error: string) => void;
  onSuccess?: (orderCode: string) => void;
}

interface PaymentResponse {
  data?: {
    accountNumber: string;
    amount: number;
    bankName: string;
    formattedAmount: string;
    orderCode: string;
    paymentContent: string;
    qrCode: string;
    status: string;
  };
  error: number;
  message: string;
}

export default function SepayPaymentButton({
  amount,
  description,
  buyerName,
  buyerEmail,
  buyerPhone,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  loading = false,
  className,
  children,
}: SepayPaymentButtonProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse['data'] | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const router = useRouter();

  const createPayment = async () => {
    setIsCreatingPayment(true);

    try {
      const response = await fetch('/api/sepay/create-payment', {
        body: JSON.stringify({
          amount,
          buyerEmail,
          buyerName,
          buyerPhone,
          cancelUrl: `${window.location.origin}/payment/cancelled`,
          description,
          returnUrl: `${window.location.origin}/api/sepay/return`,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result: PaymentResponse = await response.json();

      if (result.error === 0 && result.data) {
        setPaymentData(result.data);
        setIsModalVisible(true);

        try {
          sessionStorage.setItem(
            'paymentStatus',
            JSON.stringify({
              accountNumber: result.data.accountNumber,
              amount: result.data.amount,
              bankName: result.data.bankName,
              description,
              formattedAmount: result.data.formattedAmount,
              orderCode: result.data.orderCode,
              paymentContent: result.data.paymentContent,
              qrUrl: result.data.qrCode,
              status: 'pending',
            }),
          );
        } catch {}

        messageApi.success(t('payment.sepay.created', 'Payment created successfully'));
        onSuccess?.(result.data.orderCode);
      } else {
        throw new Error(result.message || 'Không thể tạo thông tin thanh toán');
      }
    } catch (error: any) {
      console.error('Sepay payment creation error:', error);
      messageApi.error(
        error.message || t('payment.sepay.createFailed', 'Failed to create payment'),
      );
      onError?.(error.message || 'Payment creation failed');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setPaymentData(null);
    onCancel?.();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        messageApi.success(t('payment.sepay.copySuccess', 'Copied'));
      })
      .catch(() => {
        messageApi.error(t('payment.sepay.copyFailed', 'Copy failed'));
      });
  };

  return (
    <>
      {contextHolder}

      <Button
        className={className}
        disabled={disabled || loading}
        icon={<BankOutlined />}
        loading={isCreatingPayment}
        onClick={createPayment}
        size="large"
        type="primary"
      >
        {children || t('payment.sepay.pay', 'Pay {{amount}}', { amount: formatVNDAmount(amount) })}
      </Button>

      <Modal
        centered
        footer={[
          paymentData ? (
            <Button
              key="status"
              onClick={() => {
                const onSubPage =
                  typeof window !== 'undefined' &&
                  window.location.pathname.startsWith('/subscription');
                const nextParam = onSubPage
                  ? `&next=${encodeURIComponent('/subscription/success')}`
                  : '';
                router.push(`/payment/checkout?orderCode=${paymentData.orderCode}${nextParam}`);
              }}
              type="primary"
            >
              {t('payment.sepay.viewStatus', 'View payment status')}
            </Button>
          ) : null,
          <Button key="cancel" onClick={handleModalClose}>
            {t('payment.sepay.close', 'Close')}
          </Button>,
        ]}
        onCancel={handleModalClose}
        open={isModalVisible}
        title={
          <div style={{ textAlign: 'center' }}>
            <BankOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '8px' }} />
            <span>{t('payment.sepay.title', 'Sepay Payment')}</span>
          </div>
        }
        width={450}
      >
        {paymentData ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Title level={4} style={{ color: '#1890ff', marginBottom: '8px' }}>
                {paymentData.formattedAmount}
              </Title>

              <Text style={{ color: '#666', fontSize: '14px' }}>{description}</Text>
            </div>

            {/* QR Code Section */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <QRCode size={180} style={{ margin: '0 auto' }} value={paymentData.qrCode} />
              <div style={{ marginTop: '12px' }}>
                <Text style={{ color: '#52c41a', fontSize: '13px' }}>
                  {t('payment.sepay.scanTip', '📱 Scan the QR with your banking app')}
                </Text>
              </div>
            </div>

            <Divider>{t('payment.sepay.manual', 'Or transfer manually')}</Divider>

            {/* Bank Transfer Information */}
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                }}
              >
                <div>
                  <Text strong>{t('payment.checkout.bank', 'Bank')}:</Text>
                  <br />
                  <Text>{paymentData.bankName}</Text>
                </div>
              </div>

              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                }}
              >
                <div>
                  <Text strong>{t('payment.checkout.account', 'Account')}:</Text>
                  <br />
                  <Text code>{paymentData.accountNumber}</Text>
                </div>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(paymentData.accountNumber)}
                  type="text"
                />
              </div>

              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                }}
              >
                <div>
                  <Text strong>{t('payment.select.amount', 'Amount (VND)')}:</Text>
                  <br />
                  <Text code style={{ color: '#f5222d', fontWeight: 'bold' }}>
                    {paymentData.amount.toLocaleString('vi-VN')} VND
                  </Text>
                </div>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(paymentData.amount.toString())}
                  type="text"
                />
              </div>

              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                }}
              >
                <div>
                  <Text strong>{t('payment.checkout.paymentContent', 'Payment content')}:</Text>
                  <br />
                  <Text code>{paymentData.paymentContent}</Text>
                </div>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(paymentData.paymentContent)}
                  type="text"
                />
              </div>
            </Space>

            <div
              style={{
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '6px',
                marginTop: '20px',
                padding: '12px',
              }}
            >
              <Text style={{ color: '#1890ff', fontSize: '12px' }}>
                {t(
                  'payment.checkout.tip',
                  'Please keep this page open; the status will update automatically when completed.',
                )}
                <br />
                {t('payment.result.order', 'Order Code')}: <Text code>{paymentData.orderCode}</Text>
              </Text>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />} />
            <div style={{ marginTop: '16px' }}>
              <Text>{t('payment.sepay.creating', 'Preparing payment...')}</Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
