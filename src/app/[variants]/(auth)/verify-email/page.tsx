'use client';

import { Button } from '@lobehub/ui';
import { LobeHub } from '@lobehub/ui/brand';
import { createStyles, useTheme } from 'antd-style';
import { Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    max-width: 480px;
    padding: 2rem;
    text-align: center;
  `,
  description: css`
    font-size: 16px;
    line-height: 1.6;
    color: ${token.colorText};
  `,
  hint: css`
    margin-block-start: 0.5rem;
    font-size: 14px;
    color: ${token.colorTextTertiary};
  `,
  iconWrapper: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 96px;
    height: 96px;
    border-radius: 50%;

    background: linear-gradient(
      135deg,
      ${token.colorPrimaryBg} 0%,
      ${token.colorPrimaryBgHover} 100%
    );
  `,
  textGroup: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,
  title: css`
    margin-block: 0;
    font-size: 28px;
    font-weight: 600;
    color: ${token.colorTextHeading};
  `,
}));

export default function VerifyEmailPage() {
  const { styles } = useStyles();
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Flexbox align="center" className={styles.container} gap={24}>
        <LobeHub size={56} />

        <h1 className={styles.title}>{t('betterAuth.verifyEmail.title')}</h1>

        <div className={styles.iconWrapper}>
          <Mail color={theme.colorPrimary} size={40} strokeWidth={1.5} />
        </div>

        <div className={styles.textGroup}>
          <p className={styles.description}>{t('betterAuth.verifyEmail.description', { email })}</p>
          <p className={styles.hint}>{t('betterAuth.verifyEmail.checkSpam')}</p>
        </div>

        <Button href="/signin" size="large" style={{ marginTop: '0.5rem' }} type="primary">
          {t('betterAuth.verifyEmail.backToSignIn')}
        </Button>
      </Flexbox>
    </Center>
  );
}
