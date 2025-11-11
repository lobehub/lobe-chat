'use client';

import { Icon } from '@lobehub/ui';
import { Result } from 'antd';
import { CheckCircle } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

const SuccessPage = memo(() => {
  const { t } = useTranslation('oauth');

  return (
    <Result
      icon={<Icon icon={CheckCircle} />}
      status="success"
      style={{ padding: 0 }}
      subTitle={t('success.subTitle')}
      title={t('success.title')}
    />
  );
});

SuccessPage.displayName = 'SuccessPage';

export default SuccessPage;
