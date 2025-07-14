'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import CircleLoader from '@/components/CircleLoader';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 100%;
    max-width: 480px;
    margin: 16px;
    padding: 32px;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};
  `,
  container: css`
    min-height: 100vh;
    background: linear-gradient(135deg, ${token.colorBgLayout} 0%, ${token.colorBgContainer} 100%);
  `,
  loadingText: css`
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
}));

export const LoadingFallback = () => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  return (
    <Center gap={16}>
      <CircleLoader />
      <span className={styles.loadingText}>
        {t('oauth.callback.loading', {
          defaultValue: '处理授权中...',
        })}
      </span>
    </Center>
  );
};

const DesktopCallbackLayout = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();

  return (
    <Center className={styles.container}>
      <div className={styles.card}>{children}</div>
    </Center>
  );
};

export default DesktopCallbackLayout;
