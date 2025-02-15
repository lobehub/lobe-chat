'use client';

import { Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const Title = memo(() => {
  const { t } = useTranslation('portal');

  return (
    <Typography.Text style={{ fontSize: 16 }} type={'secondary'}>
      {t('title')}
    </Typography.Text>
  );
});

export default Title;
