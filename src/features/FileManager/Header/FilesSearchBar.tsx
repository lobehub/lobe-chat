'use client';

import { SearchBar } from '@lobehub/ui';
import { useQueryState } from 'nuqs';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const FilesSearchBar = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('file');

  const [keywords, setKeywords] = useState<string>('');

  const [, setQuery] = useQueryState('q', {
    clearOnDefault: true,
  });

  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      // loading={isValidating}
      onChange={(e) => {
        setKeywords(e.target.value);

        if (!e.target.value) {
          setQuery(null);
        }
      }}
      onPressEnter={() => {
        setQuery(keywords);
      }}
      placeholder={t('searchFilePlaceholder')}
      shortKey={'k'}
      spotlight={!mobile}
      style={{ width: 320 }}
      value={keywords}
    />
  );
});

export default FilesSearchBar;
