import { Icon } from '@lobehub/ui';
import { Input, InputProps } from 'antd';
import { SearchIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchProps {
  onChange: (value: string) => void;
  value: string;
  variant?: InputProps['variant'];
}

const Search = memo<SearchProps>(({ value, onChange, variant }) => {
  const { t } = useTranslation('modelProvider');
  const [keyword, setValue] = useState<string>(value);

  return (
    <Input
      allowClear
      onBlur={() => {
        onChange(keyword);
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onPressEnter={() => {
        onChange(keyword);
      }}
      placeholder={t('providerModels.list.search')}
      prefix={<Icon icon={SearchIcon} />}
      size={'small'}
      value={keyword}
      variant={variant}
    />
  );
});
export default Search;
