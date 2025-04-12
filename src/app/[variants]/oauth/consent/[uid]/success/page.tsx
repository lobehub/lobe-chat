'use client';

import { Icon } from '@lobehub/ui';
import { Card, Result } from 'antd';
import { CheckCircle } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const SuccessPage = memo(() => {
  const { t } = useTranslation('oauth');

  return (
    <Center height="100vh">
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Result
          icon={<Icon icon={CheckCircle} />}
          status="success"
          style={{ padding: 0 }}
          subTitle={t('success.subTitle')}
          title={t('success.title')}
        />
      </Card>
    </Center>
  );
});

SuccessPage.displayName = 'SuccessPage';

export default SuccessPage;
