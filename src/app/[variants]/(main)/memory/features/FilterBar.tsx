import { Icon, SearchBar, Select } from '@lobehub/ui';
import { ArrowDownNarrowWide, Search } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface FilterBarProps {
  onSearch: (value: string) => void;
  onSortChange: (sort: 'createdAt' | 'updatedAt') => void;
  searchValue: string;
  sortValue: 'createdAt' | 'updatedAt';
}

const FilterBar = memo<FilterBarProps>(({ searchValue, onSearch, sortValue, onSortChange }) => {
  const { t } = useTranslation('memory');

  return (
    <Flexbox align={'center'} gap={12} horizontal>
      <SearchBar
        allowClear
        defaultValue={searchValue}
        onInputChange={(v) => {
          if (!v) {
            onSearch(v);
          }
        }}
        onSearch={(v) => onSearch(v)}
        placeholder={t('filter.search')}
        prefix={<Search size={16} />}
        style={{ flex: 1 }}
      />
      <Select
        onChange={(value) => onSortChange(value as 'createdAt' | 'updatedAt')}
        options={[
          { label: t('filter.sort.createdAt'), value: 'createdAt' },
          { label: t('filter.sort.updatedAt'), value: 'updatedAt' },
        ]}
        prefix={<Icon icon={ArrowDownNarrowWide} style={{ marginRight: 4 }} />}
        style={{ minWidth: 150 }}
        value={sortValue}
      />
    </Flexbox>
  );
});

export default FilterBar;
