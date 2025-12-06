import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { ArrowDownAZ } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryState } from '@/hooks/useQueryParam';

import ActionIconWithChevron from './ActionIconWithChevron';

const SortDropdown = memo(() => {
  const { t } = useTranslation('components');
  const [sorter, setSorter] = useQueryState('sorter', {
    clearOnDefault: true,
    defaultValue: 'createdAt',
  });

  const sortOptions = useMemo(
    () => [
      { key: 'name', label: t('FileManager.sort.name') },
      { key: 'createdAt', label: t('FileManager.sort.dateAdded') },
      { key: 'size', label: t('FileManager.sort.size') },
    ],
    [t],
  );

  const menuItems: MenuProps['items'] = sortOptions.map((option) => ({
    key: option.key,
    label: option.label,
    onClick: () => setSorter(option.key),
  }));

  const currentSortLabel =
    sortOptions.find((option) => option.key === sorter)?.label || t('FileManager.sort.dateAdded');

  return (
    <Dropdown
      menu={{ items: menuItems, selectedKeys: [sorter || 'createdAt'] }}
      trigger={['click']}
    >
      <ActionIconWithChevron icon={ArrowDownAZ} title={currentSortLabel} />
    </Dropdown>
  );
});

SortDropdown.displayName = 'SortDropdown';

export default SortDropdown;
