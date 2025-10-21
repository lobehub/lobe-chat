'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const NotFound = memo(() => {
  const { t } = useTranslation('common');

  return (
    <Flexbox
      align="center"
      height="100%"
      justify="center"
      style={{ minHeight: 400 }}
      width="100%"
    >
      <h2>{t('notFound')}</h2>
    </Flexbox>
  );
});

export default NotFound;
