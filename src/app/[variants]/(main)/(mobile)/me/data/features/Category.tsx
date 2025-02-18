'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Cell, { CellProps } from '@/components/Cell';
import DataImporter from '@/features/DataImporter';
import { configService } from '@/services/config';

const Category = memo(() => {
  const { t } = useTranslation('common');
  const items: CellProps[] = [
    {
      key: 'allAgent',
      label: t('exportType.allAgent'),
      onClick: configService.exportAgents,
    },
    {
      key: 'allAgentWithMessage',
      label: t('exportType.allAgentWithMessage'),
      onClick: configService.exportSessions,
    },
    {
      key: 'globalSetting',
      label: t('exportType.globalSetting'),
      onClick: configService.exportSettings,
    },
    {
      type: 'divider',
    },
    {
      key: 'all',
      label: t('exportType.all'),
      onClick: configService.exportAll,
    },
    {
      type: 'divider',
    },
    {
      key: 'import',
      label: <DataImporter>{t('import')}</DataImporter>,
    },
  ];

  return items?.map((item, index) => <Cell key={item.key || index} {...item} />);
});

export default Category;
