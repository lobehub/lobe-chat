'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Cell, { CellProps } from '@/components/Cell';
import DataImporter from '@/features/DataImporter';
import { exportService } from '@/services/export';

const Category = memo(() => {
  const { t } = useTranslation('common');
  const items: CellProps[] = [
    {
      key: 'allAgent',
      label: t('exportType.allAgent'),
      onClick: exportService.exportAgents,
    },
    {
      key: 'allAgentWithMessage',
      label: t('exportType.allAgentWithMessage'),
      onClick: exportService.exportSessions,
    },
    {
      key: 'globalSetting',
      label: t('exportType.globalSetting'),
      onClick: exportService.exportSettings,
    },
    {
      type: 'divider',
    },
    {
      key: 'all',
      label: t('exportType.all'),
      onClick: exportService.exportAll,
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
