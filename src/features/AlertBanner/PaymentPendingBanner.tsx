'use client';

import { Icon } from '@lobehub/ui';
import { Alert, Button, Space, Tooltip, message } from 'antd';
import { createStyles } from 'antd-style';
import { Copy as CopyIcon } from 'lucide-react';
import Link from 'next/link';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  container: css`
    position: relative;
    z-index: 1000;
  `,
}));

const PaymentPendingBanner = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [orderCode, setOrderCode] = useState<string | undefined>();
  const [paymentContent, setPaymentContent] = useState<string | undefined>();
  const [accountNumber, setAccountNumber] = useState<string | undefined>();
  const [bankName, setBankName] = useState<string | undefined>();
  const [formattedAmount, setFormattedAmount] = useState<string | undefined>();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      message.success(t('common.copied', 'Copied'));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1000);
    } catch {}
  };

  const readStatus = () => {
    try {
      const raw = sessionStorage.getItem('paymentStatus');
      if (!raw) return setVisible(false);
      const v = JSON.parse(raw);
      setVisible(v?.status === 'pending');
      setOrderCode(v?.orderCode);
      setPaymentContent(v?.paymentContent);
      setAccountNumber(v?.accountNumber);
      setBankName(v?.bankName);
      if (v?.formattedAmount) setFormattedAmount(v.formattedAmount);
      else if (typeof v?.amount === 'number')
        setFormattedAmount(`${Number(v.amount).toLocaleString('vi-VN')} ₫`);
    } catch {
      setVisible(false);
    }
  };

  useEffect(() => {
    readStatus();
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'paymentStatus') return;
      readStatus();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.container}>
      <Alert
        action={
          orderCode ? (
            <Space size={8}>
              <Link href={`/payment/checkout?orderCode=${orderCode}`}>
                {t('common.view', 'View')}
              </Link>
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
              {paymentContent ? (
                <Tooltip open={copiedKey === 'content'} title={t('common.copied', 'Copied')}>
                  <Button
                    icon={<Icon icon={CopyIcon} size={16} />}
                    onClick={() => handleCopy(paymentContent!, 'content')}
                    size="small"
                    type="link"
                  >
                    {t('payment.checkout.paymentContent', 'Payment content')}
                  </Button>
                </Tooltip>
              ) : null}
              {accountNumber ? (
                <Tooltip open={copiedKey === 'account'} title={t('common.copied', 'Copied')}>
                  <Button
                    icon={<Icon icon={CopyIcon} size={16} />}
                    onClick={() => handleCopy(accountNumber!, 'account')}
                    size="small"
                    type="link"
                  >
                    {t('payment.checkout.account', 'Account')}
                  </Button>
                </Tooltip>
              ) : null}
              {bankName || formattedAmount || accountNumber || orderCode || paymentContent ? (
                <Tooltip open={copiedKey === 'all'} title={t('common.copied', 'Copied')}>
                  <Button
                    icon={<Icon icon={CopyIcon} size={16} />}
                    onClick={() =>
                      handleCopy(
                        [
                          ...(orderCode
                            ? [`${t('payment.checkout.orderCode', 'Order Code')}: ${orderCode}`]
                            : []),
                          ...(formattedAmount
                            ? [`${t('payment.checkout.amount', 'Amount')}: ${formattedAmount}`]
                            : []),
                          ...(bankName
                            ? [`${t('payment.checkout.bank', 'Bank')}: ${bankName}`]
                            : []),
                          ...(accountNumber
                            ? [`${t('payment.checkout.account', 'Account')}: ${accountNumber}`]
                            : []),
                          ...(paymentContent
                            ? [
                                `${t('payment.checkout.paymentContent', 'Payment content')}: ${paymentContent}`,
                              ]
                            : []),
                        ].join('\n'),
                        'all',
                      )
                    }
                    size="small"
                    type="link"
                  >
                    {t('payment.checkout.copyAll', 'Copy all')}
                  </Button>
                </Tooltip>
              ) : null}
            </Space>
          ) : undefined
        }
        banner
        closable
        message={`${t('payment.banner.pending', 'Payment is pending confirmation')}${orderCode ? ` (${t('payment.result.order', 'Order Code')} ${orderCode})` : ''}`}
        onClose={() => {
          try {
            sessionStorage.removeItem('paymentStatus');
          } catch {}
          setVisible(false);
        }}
        type="info"
      />
    </div>
  );
});

PaymentPendingBanner.displayName = 'PaymentPendingBanner';

export default PaymentPendingBanner;
