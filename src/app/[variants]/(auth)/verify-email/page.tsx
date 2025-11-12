'use client';

import { Button } from '@lobehub/ui';
import { LobeHub } from '@lobehub/ui/brand';
import { createStyles } from 'antd-style';
import { Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    max-width: 400px;
    text-align: center;
  `,
  description: css`
    margin-block-start: 1rem;
    font-size: 16px;
    line-height: 1.6;
    color: ${token.colorText};
  `,
  hint: css`
    margin-block-start: 1rem;
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
  iconWrapper: css`
    margin-block-start: 1rem;
    padding: 1.5rem;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
  `,
  title: css`
    margin-block-start: 2rem;
    font-size: 24px;
    font-weight: 600;
    color: ${token.colorTextHeading};
  `,
}));

export default function VerifyEmailPage() {
  const { styles } = useStyles();
  const { t } = useTranslation('auth');
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Flexbox className={styles.container} gap={16}>
        <LobeHub size={64} />

        <h1 className={styles.title}>{t('betterAuth.verifyEmail.title')}</h1>

        <div className={styles.iconWrapper}>
          <Mail size={48} style={{ color: '#0066ff' }} />
        </div>

        <p className={styles.description}>{t('betterAuth.verifyEmail.description', { email })}</p>

        <p className={styles.hint}>{t('betterAuth.verifyEmail.checkSpam')}</p>

        <Button href="/signin" size="large" style={{ marginTop: '1rem' }} type="primary">
          {t('betterAuth.verifyEmail.backToSignIn')}
        </Button>
      </Flexbox>
    </Center>
  );
}
