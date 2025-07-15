'use client';

import { Icon, Text } from '@lobehub/ui';
import { Alert } from 'antd';
import { createStyles } from 'antd-style';
import { CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  brandingContent: css`
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
  brandingSection: css`
    padding-block-start: 16px;
    border-block-start: 1px solid ${token.colorBorder};
  `,
  container: css`
    gap: 24px;
  `,
  errorCard: css`
    border-color: ${token.colorErrorBorder};
    background-color: ${token.colorErrorBg};
  `,
  errorIcon: css`
    color: ${token.colorError};
  `,
  loadingSpinner: css`
    color: ${token.colorPrimary};
  `,
  statusCard: css`
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;
  `,
  successCard: css`
    border-color: ${token.colorSuccessBorder};
    background-color: ${token.colorSuccessBg};
  `,
  successIcon: css`
    color: ${token.colorSuccess};
  `,
}));

interface CallbackState {
  error?: any;
  message?: string;
  status: 'processing' | 'success' | 'error';
}

const Client = () => {
  const { t } = useTranslation(['common', 'error']);
  const { styles } = useStyles();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>({ status: 'processing' });

  useEffect(() => {
    const processCallback = async () => {
      const state = searchParams.get('state');

      // 从 URL 获取参数

      setState(
        state === 'success'
          ? {
              message: t('oauth.callback.success', {
                defaultValue: '授权成功！请返回桌面应用。',
                ns: 'common',
              }),
              status: 'success',
            }
          : {
              message: t('oauth.callback.failed', {
                defaultValue: '授权处理失败，请重试。',
                ns: 'error',
              }),
              status: 'error',
            },
      );
    };

    processCallback();
  }, [searchParams]);

  const renderContent = () => {
    switch (state.status) {
      case 'success': {
        return (
          <Center>
            <Flexbox align="center" className={styles.container}>
              <Icon className={styles.successIcon} icon={CheckCircle} size={48} />
              <Text weight="bold">
                {t('oauth.callback.success.title', {
                  defaultValue: '授权成功！',
                  ns: 'common',
                })}
              </Text>
              <Text type="secondary">{state.message}</Text>
              <div className={`${styles.statusCard} ${styles.successCard}`}>
                <Text style={{ color: 'inherit' }}>
                  {t('oauth.callback.success.instruction', {
                    defaultValue: '您可以安全地关闭此页面。桌面应用程序将自动完成登录过程。',
                    ns: 'common',
                  })}
                </Text>
              </div>
            </Flexbox>
          </Center>
        );
      }

      case 'error': {
        return (
          <Center>
            <Flexbox align="center" className={styles.container}>
              <Icon className={styles.errorIcon} icon={XCircle} size={48} />
              <Text weight="bold">
                {t('oauth.callback.error.title', {
                  defaultValue: '授权失败',
                  ns: 'error',
                })}
              </Text>
              <Text type="secondary">{state.message}</Text>
              <div className={`${styles.statusCard} ${styles.errorCard}`}>
                <Text style={{ color: 'inherit' }}>
                  {t('oauth.callback.error.instruction', {
                    defaultValue:
                      '请返回桌面应用程序重新尝试授权。如果问题持续存在，请联系技术支持。',
                    ns: 'error',
                  })}
                </Text>
              </div>
              {state.error && (
                <Alert
                  description={state.error.message || String(state.error)}
                  message={t('oauth.callback.error.details', {
                    defaultValue: '错误详情',
                    ns: 'error',
                  })}
                  showIcon
                  type="error"
                />
              )}
            </Flexbox>
          </Center>
        );
      }

      default: {
        return null;
      }
    }
  };

  return (
    <Flexbox className={styles.container}>
      {renderContent()}

      <div className={styles.brandingSection}>
        <Center>{/*<OrgBrand type={'combine'} />*/}</Center>
      </div>
    </Flexbox>
  );
};

export default Client;
