'use client';

import { Button } from '@lobehub/ui';
import { LobeHub } from '@lobehub/ui/brand';
import { Form, Input } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronRight, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { message } from '@/components/AntdStaticMethods';
import { authEnv } from '@/envs/auth';
import { signUp } from '@/libs/better-auth/auth-client';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    padding-block: 2.5rem;
    padding-inline: 2rem;
  `,
  container: css`
    width: 360px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
  `,
  footer: css`
    padding: 1rem;
    border-block-start: 1px solid ${token.colorBorder};

    font-size: 14px;
    color: ${token.colorTextDescription};
    text-align: center;

    background: ${token.colorBgElevated};
  `,
  subtitle: css`
    margin-block-start: 0.5rem;
    font-size: 14px;
    color: ${token.colorTextSecondary};
    text-align: center;
  `,
  title: css`
    margin-block-start: 1rem;

    font-size: 24px;
    font-weight: 600;
    color: ${token.colorTextHeading};
    text-align: center;
  `,
}));

interface SignUpFormValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  username: string;
}

export default function SignUpPage() {
  const { styles } = useStyles();
  const { t } = useTranslation('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (values: SignUpFormValues) => {
    setLoading(true);
    try {
      const { error } = await signUp.email({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        name: values.username,
        password: values.password,
      });

      if (error) {
        message.error(error.message || t('betterAuth.signup.error'));
        return;
      }

      // Registration successful
      message.success(t('betterAuth.signup.success'));

      // Redirect based on email verification requirement
      if (authEnv.NEXT_PUBLIC_BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION) {
        // Email verification required, redirect to verification notice page
        router.push('/verify-email?email=' + encodeURIComponent(values.email));
      } else {
        // Email verification not required, redirect to signin page
        router.push('/signin?email=' + encodeURIComponent(values.email));
      }
    } catch {
      message.error(t('betterAuth.signup.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flexbox align="center" justify="center" style={{ minHeight: '100vh' }}>
      <div className={styles.container}>
        <div className={styles.card}>
          <Flexbox align="center" gap={8} justify="center">
            <LobeHub size={48} />
          </Flexbox>

          <h1 className={styles.title}>{t('betterAuth.signup.title')}</h1>
          <p className={styles.subtitle}>{t('betterAuth.signup.subtitle')}</p>

          <Form form={form} layout="vertical" onFinish={handleSignUp} style={{ marginTop: '2rem' }}>
            <Flexbox gap={12} horizontal>
              <Form.Item
                name="firstName"
                rules={[{ message: t('betterAuth.errors.firstNameRequired'), required: true }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input
                  placeholder={t('betterAuth.signup.firstNamePlaceholder')}
                  prefix={<User size={16} />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                rules={[{ message: t('betterAuth.errors.lastNameRequired'), required: true }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input
                  placeholder={t('betterAuth.signup.lastNamePlaceholder')}
                  prefix={<User size={16} />}
                  size="large"
                />
              </Form.Item>
            </Flexbox>

            <Form.Item
              name="username"
              rules={[{ message: t('betterAuth.errors.usernameRequired'), required: true }]}
              style={{ marginTop: 24 }}
            >
              <Input
                placeholder={t('betterAuth.signup.usernamePlaceholder')}
                prefix={<User size={16} />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { message: t('betterAuth.errors.emailRequired'), required: true },
                { message: t('betterAuth.errors.emailInvalid'), type: 'email' },
              ]}
            >
              <Input
                placeholder={t('betterAuth.signup.emailPlaceholder')}
                prefix={<Mail size={16} />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { message: t('betterAuth.errors.passwordRequired'), required: true },
                { message: t('betterAuth.errors.passwordMinLength'), min: 8 },
              ]}
            >
              <Input.Password
                placeholder={t('betterAuth.signup.passwordPlaceholder')}
                prefix={<Lock size={16} />}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                block
                htmlType="submit"
                icon={<ChevronRight size={16} />}
                iconPosition="end"
                loading={loading}
                size="large"
                type="primary"
              >
                {t('betterAuth.signup.submit')}
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.footer}>
          {t('betterAuth.signup.hasAccount')}{' '}
          <Link href={`/signin?${searchParams.toString()}`}>
            {t('betterAuth.signup.signinLink')}
          </Link>
        </div>
      </div>
    </Flexbox>
  );
}
