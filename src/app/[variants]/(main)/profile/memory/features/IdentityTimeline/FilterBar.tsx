import { Input, Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { Search } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css }) => ({
  searchInput: css`
    flex: 1;
    min-width: 240px;

    .ant-input-prefix {
      margin-inline-end: 8px;
    }
  `,
}));

export type IdentityType = 'all' | 'demographic' | 'personal' | 'professional';

interface FilterBarProps {
  onSearchChange: (value: string) => void;
  onTypeChange: (type: IdentityType) => void;
  searchValue: string;
  typeValue: IdentityType;
}

const FilterBar = memo<FilterBarProps>(
  ({ searchValue, onSearchChange, typeValue, onTypeChange }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('memory');

    return (
      <Flexbox gap={12} horizontal>
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
        <Input
          allowClear
          className={styles.searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('identity.filter.search')}
          prefix={<Search size={16} />}
          value={searchValue}
        />
      </Flexbox>
    );
  },
);

export default FilterBar;
