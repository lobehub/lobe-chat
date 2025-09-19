'use client';

import { Icon } from '@lobehub/ui';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Image,
  Space,
  Spin,
  Steps,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { Copy as CopyIcon, QrCode } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface CreatePaymentResp {
  data?: {
    accountNumber: string;
    amount: number;
    bankName?: string;
    formattedAmount?: string;
    orderCode: string; // URL to VietQR image
    paymentContent: string;
    qrCode: string;
    status: 'pending' | 'completed' | 'failed';
  };
  error: number;
  message: string;
}

interface StatusResp {
  data?: {
    accountNumber?: string;
    amount?: number;
    bankName?: string;
    description?: string;
    formattedAmount?: string | null;
    orderCode: string;
    paymentContent?: string;
    qrCode?: string;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: number;
  };
  error: number;
  message: string;
}

const POLL_MS = 3000;

export default function PaymentCheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  const stepDesc = useMemo(() => {
    if (status === 'pending')
      return t(
        'payment.checkout.pendingDesc',
        'Open your banking app, scan the QR, and include the exact payment content.',
      );
    if (status === 'completed')
      return t('payment.result.successSub', 'Thank you! Your payment has been confirmed.');
    if (status === 'failed') return t('payment.checkout.failed', 'Payment failed');
    return '';
  }, [status, t]);
  const search = useSearchParams();
  const next = useMemo(() => search.get('next') || null, [search]);

  const defaultAmount = useMemo(() => {
    const a = Number(search.get('amount') || 0);
    return Number.isFinite(a) && a > 0 ? Math.floor(a) : 29_000;
  }, [search]);

  const defaultDesc = useMemo(
    () => search.get('description') || 'LobeChat VietQR Payment',
    [search],
  );
  const presetOrderCode = useMemo(() => search.get('orderCode') || null, [search]);

  const [amount, setAmount] = useState<number>(defaultAmount);
  const [description, setDescription] = useState<string>(defaultDesc);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{
    accountNumber: string;
    bankName: string;
  } | null>(null);
  const [formattedAmount, setFormattedAmount] = useState<string | undefined>(undefined);
  const [paymentContent, setPaymentContent] = useState<string | undefined>(undefined);
  const [pendingToastShown, setPendingToastShown] = useState(false);
  const cleanDesc = useMemo(
    () => (description ? description.replace(/^\[UID:[^\]]+]\s*/, '') : ''),
    [description],
  );
  const cleanContent = useMemo(
    () => (paymentContent ? paymentContent.replaceAll(/\[UID:[^\]]+]\s*/g, '') : undefined),
    [paymentContent],
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      message.success(t('common.copied', 'Copied'));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1000);
    } catch {
      /* noop */
    }
  };

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // hydrate from session if navigated with orderCode
  useEffect(() => {
    const oc = presetOrderCode;
    if (!oc) return;
    try {
      const raw = sessionStorage.getItem('paymentStatus');
      if (raw) {
        const v = JSON.parse(raw);
        if (v?.orderCode === oc) {
          setOrderCode(oc);

          if (v.bankName && v.accountNumber)
            setAccountInfo({ accountNumber: v.accountNumber, bankName: v.bankName });
          if (typeof v.amount === 'number') setAmount(v.amount);
          if (v.formattedAmount) setFormattedAmount(v.formattedAmount);
          if (v.description) setDescription(v.description);
          if (v.paymentContent) setPaymentContent(v.paymentContent);

          if (v.status) setStatus(v.status);
        }
      }
    } catch {
      /* noop */
    }
  }, [presetOrderCode]);

  // create payment on mount (skip if preset orderCode provided)
  useEffect(() => {
    const create = async () => {
      try {
        setCreating(true);
        if (presetOrderCode) {
          // when orderCode exists, do not create a new one
          setLoading(false);
          return;
        }
        const createUrl = '/api/sepay/create-payment';
        const resp = await fetch(createUrl, {
          body: JSON.stringify({ amount, description }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        });
        const json: CreatePaymentResp = await resp.json();
        if (json.error === 0 && json.data) {
          setOrderCode(json.data.orderCode);
          setQrUrl(json.data.qrCode);
          setAccountInfo({
            accountNumber: json.data.accountNumber,
            bankName: json.data.bankName || '',
          });
          setFormattedAmount(json.data.formattedAmount);
          setStatus('pending');
          try {
            sessionStorage.setItem(
              'paymentStatus',
              JSON.stringify({
                accountNumber: json.data.accountNumber,
                amount: json.data.amount,
                bankName: json.data.bankName || '',
                description,
                formattedAmount: json.data.formattedAmount,
                orderCode: json.data.orderCode,
                paymentContent: json.data.paymentContent,
                qrUrl: json.data.qrCode,
                status: 'pending',
              }),
            );
          } catch {
            /* noop */
          }
          message.success('Payment created');
        } else {
          throw new Error(json.message || 'Failed to create payment');
        }
      } catch (e: any) {
        console.error(e);
        message.error(e.message || 'Create payment failed');
      } finally {
        setCreating(false);
        setLoading(false);
      }
    };
    create();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [amount, description]);

  // poll status
  useEffect(() => {
    if (!orderCode) return;
    timerRef.current = setInterval(async () => {
      try {
        const statusUrl = `/api/sepay/payment-status?orderCode=${orderCode}`;
        const r = await fetch(statusUrl);
        const j: StatusResp = await r.json();
        if (j.error === 0 && j.data) {
          setStatus(j.data.status);
          if (j.data.description) setDescription(j.data.description);
          if (j.data.paymentContent) setPaymentContent(j.data.paymentContent);
          if (j.data.qrCode) setQrUrl(j.data.qrCode);
          if (j.data.bankName && j.data.accountNumber)
            setAccountInfo({ accountNumber: j.data.accountNumber, bankName: j.data.bankName });
          if (j.data.status === 'completed') {
            try {
              sessionStorage.setItem(
                'paymentStatus',
                JSON.stringify({ orderCode, status: 'completed' }),
              );
            } catch {
              /* noop */
            }
            message.success('Payment completed');
            if (timerRef.current) clearInterval(timerRef.current);
            router.replace(next || `/payment/success?orderCode=${orderCode}`);
          } else if (j.data.status === 'failed') {
            try {
              sessionStorage.setItem(
                'paymentStatus',
                JSON.stringify({ orderCode, status: 'failed' }),
              );
            } catch {
              /* noop */
            }
            message.error('Payment failed');
            if (timerRef.current) clearInterval(timerRef.current);
            router.replace(`/payment/failed?orderCode=${orderCode}`);
          }
        }
      } catch {
        // ignore transient errors
      }
    }, POLL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [orderCode, router]);

  // one-time pending toast
  useEffect(() => {
    if (orderCode && status === 'pending' && !pendingToastShown) {
      message.info(t('payment.checkout.pending', 'Please complete your QR payment'));
      setPendingToastShown(true);
    }
  }, [orderCode, status, pendingToastShown, t]);

  const onRefreshNow = async () => {
    if (!orderCode) return;
    try {
      const statusUrl = `/api/sepay/payment-status?orderCode=${orderCode}`;
      const r = await fetch(statusUrl);
      const j: StatusResp = await r.json();
      if (j.error === 0 && j.data) {
        setStatus(j.data.status);
        if (j.data.description) setDescription(j.data.description);
        if (j.data.paymentContent) setPaymentContent(j.data.paymentContent);
        if (j.data.qrCode) setQrUrl(j.data.qrCode);
        if (j.data.bankName && j.data.accountNumber)
          setAccountInfo({ accountNumber: j.data.accountNumber, bankName: j.data.bankName });
      }
    } catch {
      /* noop */
    }
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 320 }}>
        <Spin fullscreen tip={t('payment.checkout.preparing', 'Preparing payment...')} />
      </Flex>
    );
  }

  if (!orderCode) {
    return (
      <Flex gap={16} style={{ padding: 24 }} vertical>
        <Alert message="Failed to create payment" showIcon type="error" />
        <Button onClick={() => router.refresh()} type="primary">
          Retry
        </Button>
      </Flex>
    );
  }

  if (!qrUrl) {
    return (
      <Flex gap={16} style={{ padding: 24 }} vertical>
        <Alert message="QR code could not be generated. Please try again." showIcon type="error" />
        <Button onClick={() => router.refresh()} type="primary">
          Retry
        </Button>
      </Flex>
    );
  }

  if (!accountInfo) {
    return (
      <Flex gap={16} style={{ padding: 24 }} vertical>
        <Alert message="Account information is missing. Please try again." showIcon type="error" />
        <Button onClick={() => router.refresh()} type="primary">
          Retry
        </Button>
      </Flex>
    );
  }

  return (
    <Flex gap={16} style={{ margin: '0 auto', maxWidth: 900, padding: 24 }} vertical>
      <Title level={3}>{t('payment.checkout.title', 'Pay via VietQR')}</Title>
      <Steps
        current={status === 'completed' ? 2 : 1}
        items={[
          { title: t('payment.checkout.steps.create', 'Create') },
          { title: t('payment.checkout.steps.pending', 'Pending') },
          { title: t('payment.checkout.steps.success', 'Confirmed') },
        ]}
        size="small"
      />
      {stepDesc && <Text type="secondary">{stepDesc}</Text>}
      {status === 'pending' && (
        <Alert
          description={t(
            'payment.checkout.pendingDesc',
            'Open your banking app, scan the QR, and include the exact payment content.',
          )}
          message={t('payment.checkout.pending', 'Please complete your QR payment')}
          showIcon
          type="info"
        />
      )}
      {status === 'failed' && (
        <Alert message={t('payment.checkout.failed', 'Payment failed')} showIcon type="error" />
      )}

      <Space align="start" size="large" wrap>
        <Card
          title={
            <Space>
              <Icon icon={QrCode} /> <span>{t('payment.checkout.scan', 'Scan this QR')}</span>
            </Space>
          }
        >
          <Image
            alt="VietQR"
            src={qrUrl}
            style={{ height: 'auto', maxWidth: 320, width: '100%' }}
          />
          {!!paymentContent && (
            <>
              <Divider />
              <Descriptions colon={false} column={1} size="small">
                <Descriptions.Item label={t('payment.checkout.paymentContent', 'Payment content')}>
                  <Space>
                    <Text code>{cleanContent}</Text>
                    <Tooltip open={copiedKey === 'content'} title={t('common.copied', 'Copied')}>
                      <Button
                        icon={<Icon icon={CopyIcon} size={16} />}
                        onClick={() => handleCopy(paymentContent!, 'content')}
                        size="small"
                        type="link"
                      >
                        {t('common.copy', 'Copy')}
                      </Button>
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
          <Divider />
          <Space>
            <Tooltip open={copiedKey === 'all-qr'} title={t('common.copied', 'Copied')}>
              <Button
                icon={<Icon icon={CopyIcon} size={16} />}
                onClick={() =>
                  handleCopy(
                    [
                      `${t('payment.checkout.orderCode', 'Order Code')}: ${orderCode}`,
                      `${t('payment.checkout.amount', 'Amount')}: ${formattedAmount ?? `${amount.toLocaleString('vi-VN')} \u20AB`}`,
                      `${t('payment.checkout.bank', 'Bank')}: ${accountInfo.bankName}`,
                      `${t('payment.checkout.account', 'Account')}: ${accountInfo.accountNumber}`,
                      ...(cleanContent
                        ? [
                            `${t('payment.checkout.paymentContent', 'Payment content')}: ${cleanContent}`,
                          ]
                        : []),
                    ].join('\n'),
                    'all-qr',
                  )
                }
              >
                {t('payment.checkout.copyAll', 'Copy all')}
              </Button>
            </Tooltip>
          </Space>
        </Card>

        <Card style={{ minWidth: 360 }} title={t('payment.checkout.details', 'Payment details')}>
          <Descriptions colon={false} column={1} size="small">
            <Descriptions.Item label={t('payment.checkout.orderCode', 'Order Code')}>
              <Space>
                <Tag color="blue">{orderCode}</Tag>
                <Tooltip open={copiedKey === 'order'} title={t('common.copied', 'Copied')}>
                  <Button
                    icon={<Icon icon={CopyIcon} size={16} />}
                    onClick={() => orderCode && handleCopy(orderCode, 'order')}
                    size="small"
                    type="link"
                  >
                    {t('common.copy', 'Copy')}
                  </Button>
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('payment.checkout.amount', 'Amount')}>
              <Space>
                <Text strong>{formattedAmount ?? `${amount.toLocaleString('vi-VN')} ₫`}</Text>
                <Tooltip open={copiedKey === 'amount'} title={t('common.copied', 'Copied')}>
                  <Button
                    icon={<Icon icon={CopyIcon} size={16} />}
                    onClick={() =>
                      handleCopy(formattedAmount ?? `${amount.toLocaleString('vi-VN')} ₫`, 'amount')
                    }
                    size="small"
                    type="link"
                  >
                    {t('common.copy', 'Copy')}
                  </Button>
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('payment.select.description', 'Description')}>
              <Text>{cleanDesc}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('payment.checkout.bank', 'Bank')}>
              <Space>
                <Text>{accountInfo.bankName}</Text>
                <Tooltip open={copiedKey === 'bank'} title={t('common.copied', 'Copied')}>
                  <Button
                    icon={<Icon icon={CopyIcon} size={16} />}
                    onClick={() => handleCopy(accountInfo.bankName, 'bank')}
                    size="small"
                    type="link"
                  >
                    {t('common.copy', 'Copy')}
                  </Button>
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('payment.checkout.account', 'Account')}>
              <Space>
                <Text code>{accountInfo.accountNumber}</Text>
                <Tooltip open={copiedKey === 'account'} title={t('common.copied', 'Copied')}>
                  <Button
                    icon={<Icon icon={CopyIcon} size={16} />}
                    onClick={() => handleCopy(accountInfo.accountNumber, 'account')}
                    size="small"
                    type="link"
                  >
                    {t('common.copy', 'Copy')}
                  </Button>
                </Tooltip>
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Divider />
          <Space>
            <Tooltip open={copiedKey === 'all'} title={t('common.copied', 'Copied')}>
              <Button
                icon={<Icon icon={CopyIcon} size={16} />}
                onClick={() =>
                  handleCopy(
                    [
                      `${t('payment.checkout.orderCode', 'Order Code')}: ${orderCode}`,
                      `${t('payment.checkout.amount', 'Amount')}: ${formattedAmount ?? `${amount.toLocaleString('vi-VN')} ₫`}`,
                      `${t('payment.checkout.bank', 'Bank')}: ${accountInfo.bankName}`,
                      `${t('payment.checkout.account', 'Account')}: ${accountInfo.accountNumber}`,
                      ...(cleanContent
                        ? [
                            `${t('payment.checkout.paymentContent', 'Payment content')}: ${cleanContent}`,
                          ]
                        : []),
                    ].join('\n'),
                    'all',
                  )
                }
              >
                {t('payment.checkout.copyAll', 'Copy all')}
              </Button>
            </Tooltip>
            <Button onClick={onRefreshNow}>
              {t('payment.checkout.ivePaid', 'I’ve paid, check now')}
            </Button>
            <Button loading={creating} onClick={() => router.refresh()}>
              {t('payment.checkout.createNew', 'Create new')}
            </Button>
          </Space>
        </Card>
      </Space>

      <Divider />
      <Space>
        <Text type="secondary">
          {t(
            'payment.checkout.tip',
            'Don’t close this page. Status will update automatically after payment.',
          )}
        </Text>
      </Space>
    </Flex>
  );
}
