'use client';

import { Button } from '@lobehub/ui';
import { LobeHub } from '@lobehub/ui/brand';
import { Form, Input } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ArrowLeft, KeyRound, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { message } from '@/components/AntdStaticMethods';
import { resetPassword } from '@/libs/better-auth/auth-client';

const useStyles = createStyles(({ css, token }) => ({
  backLink: css`
    display: inline-flex;
    gap: 6px;
    align-items: center;

    font-size: 14px;
    color: ${token.colorTextSecondary};
    text-decoration: none;

    transition: color 0.2s ease;

    &:hover {
      color: ${token.colorText};
    }
  `,
  container: css`
    max-width: 400px;
    padding: 2rem;
    text-align: center;
  `,
  description: css`
    font-size: 14px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
  `,
  email: css`
    font-weight: 500;
    color: ${token.colorText};
  `,
  iconWrapper: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 80px;
    height: 80px;
    border-radius: 50%;

    background: linear-gradient(
      135deg,
      ${token.colorPrimaryBg} 0%,
      ${token.colorPrimaryBgHover} 100%
    );
  `,
  title: css`
    margin-block: 0;
    font-size: 24px;
    font-weight: 600;
    color: ${token.colorTextHeading};
  `,
}));

interface ResetPasswordFormValues {
  confirmPassword: string;
  newPassword: string;
}

export default function ResetPasswordPage() {
  const { styles } = useStyles();
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!token) {
      message.error(t('betterAuth.resetPassword.invalidToken'));
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        newPassword: values.newPassword,
        token,
      });

      if (result.error) {
        message.error(result.error.message || t('betterAuth.resetPassword.error'));
        return;
      }

      message.success(t('betterAuth.resetPassword.success'));
      router.push(email ? `/signin?email=${encodeURIComponent(email)}` : '/signin');
    } catch (error) {
      console.error('Reset password error:', error);
      message.error(t('betterAuth.resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token
  if (!token) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Flexbox align="center" className={styles.container} gap={24}>
          <LobeHub size={56} />
          <h1 className={styles.title}>{t('betterAuth.resetPassword.title')}</h1>
          <p className={styles.description}>{t('betterAuth.resetPassword.invalidToken')}</p>
          <Link className={styles.backLink} href="/signin">
            <ArrowLeft size={16} />
            {t('betterAuth.resetPassword.backToSignIn')}
          </Link>
        </Flexbox>
      </Center>
    );
  }

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Flexbox align="center" className={styles.container} gap={24}>
        <LobeHub size={56} />

        <h1 className={styles.title}>{t('betterAuth.resetPassword.title')}</h1>

        <div className={styles.iconWrapper}>
          <KeyRound color={theme.colorPrimary} size={36} strokeWidth={1.5} />
        </div>

        <p className={styles.description}>
          {t('betterAuth.resetPassword.description')}
          {email && (
            <>
              <br />
              <span className={styles.email}>{email}</span>
            </>
          )}
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleResetPassword}
          style={{ textAlign: 'left', width: '100%' }}
        >
          <Form.Item
            name="newPassword"
            rules={[
              { message: t('betterAuth.errors.passwordRequired'), required: true },
              { message: t('betterAuth.errors.passwordMinLength'), min: 8 },
              { max: 64, message: t('betterAuth.errors.passwordMaxLength') },
            ]}
          >
            <Input.Password
              placeholder={t('betterAuth.resetPassword.newPasswordPlaceholder')}
              prefix={<Lock size={16} />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            dependencies={['newPassword']}
            name="confirmPassword"
            rules={[
              { message: t('betterAuth.resetPassword.confirmPasswordRequired'), required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('betterAuth.resetPassword.passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={t('betterAuth.resetPassword.confirmPasswordPlaceholder')}
              prefix={<Lock size={16} />}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button block htmlType="submit" loading={loading} size="large" type="primary">
              {t('betterAuth.resetPassword.submit')}
            </Button>
          </Form.Item>
        </Form>

        <Link className={styles.backLink} href="/signin">
          <ArrowLeft size={16} />
          {t('betterAuth.resetPassword.backToSignIn')}
        </Link>
      </Flexbox>
    </Center>
  );
}
