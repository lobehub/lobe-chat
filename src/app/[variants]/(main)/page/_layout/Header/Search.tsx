'use client';

import { SearchBar } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';

const Search = memo(() => {
  const { t } = useTranslation('file');

  const searchKeywords = useFileStore((s) => s.searchKeywords);
  const setSearchKeywords = useFileStore((s) => s.setSearchKeywords);

  return (
    <SearchBar
      allowClear
      onChange={(e) => setSearchKeywords(e.target.value)}
      placeholder={t('searchPagePlaceholder')}
      style={{ flex: 1 }}
      value={searchKeywords}
      variant={'filled'}
    />
  );
});

export default Search;
