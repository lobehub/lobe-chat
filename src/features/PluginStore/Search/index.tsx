import { SearchBar } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface SearchProps {
  keywords?: string;
  setKeywords?: (keywords: string) => void;
}

export const Search = memo<SearchProps>(({ setKeywords, keywords }) => {
  const { t } = useTranslation('plugin');
  return (
    <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
      <Flexbox flex={1}>
        <SearchBar
          allowClear
          defaultValue={keywords}
          onInputChange={(v) => {
            if (!v) setKeywords?.('');
          }}
          onSearch={(v) => setKeywords?.(v)}
          placeholder={t('store.placeholder')}
          variant={'borderless'}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default Search;
