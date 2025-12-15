import { Segmented } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import CommonFilterBar from '../../features/FilterBar';
import { IdentityType } from './List';

interface FilterBarProps {
  onSearch: (value: string) => void;
  onTypeChange: (type: IdentityType) => void;
  searchValue: string;
  typeValue: IdentityType;
}

const FilterBar = memo<FilterBarProps>(({ searchValue, onSearch, typeValue, onTypeChange }) => {
  const { t } = useTranslation('memory');

  return (
    <Flexbox align={'center'} gap={12} horizontal justify={'space-between'}>
      <Segmented
        onChange={(value) => onTypeChange(value as IdentityType)}
        options={[
          { label: t('identity.filter.type.all'), value: 'all' },
          { label: t('identity.filter.type.personal'), value: 'personal' },
          { label: t('identity.filter.type.professional'), value: 'professional' },
          { label: t('identity.filter.type.demographic'), value: 'demographic' },
        ]}
        value={typeValue}
      />
      <CommonFilterBar onSearch={onSearch} searchValue={searchValue} />
    </Flexbox>
  );
});

export default FilterBar;
