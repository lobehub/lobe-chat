'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Cell, { CellProps } from '@/components/Cell';
import DataImporter from '@/features/DataImporter';

const Category = memo(() => {
  const { t } = useTranslation('common');
  const items: CellProps[] = [
    {
      key: 'allAgent',
      label: t('exportType.allAgent'),
    },
    {
      key: 'allAgentWithMessage',
      label: t('exportType.allAgentWithMessage'),
    },
    {
      key: 'globalSetting',
      label: t('exportType.globalSetting'),
    },
    {
      type: 'divider',
    },
    {
      key: 'all',
      label: t('exportType.all'),
    },
    {
      type: 'divider',
    },
    {
      key: 'import',
      label: <DataImporter>{t('importData')}</DataImporter>,
    },
  ];

  return items?.map(({ key, ...item }, index) => <Cell key={key || index} {...item} />);
});

export default Category;
