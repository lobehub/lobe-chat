'use client';

import { Button, Icon } from '@lobehub/ui';
import { Card, Result } from 'antd';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const FailedPage = memo(() => {
  const { t } = useTranslation('oauth');

  return (
    <Center height="100vh">
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Result
          extra={
            <Link href="/">
              <Button type="primary">{t('failed.backToHome')}</Button>
            </Link>
          }
          icon={<Icon icon={XCircle} />}
          status="error"
          style={{ padding: 0 }}
          subTitle={t('failed.subTitle')}
          title={t('failed.title')}
        />
      </Card>
    </Center>
  );
});

FailedPage.displayName = 'FailedPage';

export default FailedPage;
