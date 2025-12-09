'use client';

import { SiDiscord } from '@icons-pack/react-simple-icons';
import { Button, Icon } from '@lobehub/ui';
import { Result, Tag, Typography } from 'antd';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const DISCORD_URL = 'https://discord.gg/AYFPHvv2jT';

const normalizeErrorCode = (code?: string | null) =>
  (code || 'UNKNOWN').trim().toUpperCase().replaceAll('-', '_');

const AuthErrorPage = memo(() => {
  const { t } = useTranslation('authError');
  const [error] = useQueryState('error', parseAsString);

  const code = normalizeErrorCode(error);
  const description = t(`codes.${code}`, { defaultValue: t('codes.UNKNOWN') });

  return (
    <Result
      extra={
        <Flexbox align="center" gap={16}>
          <Flexbox gap={12} horizontal justify="center" wrap="wrap">
            <Link href="/signin">
              <Button type="primary">{t('actions.retry')}</Button>
            </Link>
            <Link href="/">
              <Button>{t('actions.home')}</Button>
            </Link>
          </Flexbox>
          <Link href={DISCORD_URL} rel="noopener noreferrer" target="_blank">
            <Button icon={<Icon icon={SiDiscord} />} type="text">
              {t('actions.discord')}
            </Button>
          </Link>
        </Flexbox>
      }
      icon={<Icon icon={ShieldAlert} />}
      status="error"
      subTitle={
        <Flexbox align="center" gap={8}>
          <Tag color="red">{error || 'UNKNOWN'}</Tag>
          <Typography.Text type="secondary">{description}</Typography.Text>
        </Flexbox>
      }
      title={t('title')}
    />
  );
});

AuthErrorPage.displayName = 'AuthErrorPage';

export default AuthErrorPage;
