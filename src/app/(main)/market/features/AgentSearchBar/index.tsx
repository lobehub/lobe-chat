'use client';

import { SearchBar } from '@lobehub/ui';
import { useQueryState } from 'nuqs';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSearch } from '@/app/(main)/market/hooks/useSearch';
import { useIsMobile } from '@/hooks/useIsMobile';

interface AgentSearchBarProps {
  defaultKeyword?: string;
  mobile?: boolean;
}

const AgentSearchBar = memo<AgentSearchBarProps>(({ mobile: controlledMobile, defaultKeyword }) => {
  const search = useSearch();
  const [keyword, setKeyword] = useQueryState<string | null>('q', {
    // @ts-ignore
    defaultValue: defaultKeyword,
    history: 'replace',
    throttleMs: 500,
  });

  const { t } = useTranslation('market');

  const isMobile = useIsMobile();
  const mobile = controlledMobile ?? isMobile;

  const handleSearch = () => {
    search(keyword || '');
  };

  return (
    <SearchBar
      allowClear
      enableShortKey={!mobile}
      onBlur={handleSearch}
      onChange={(e) => {
        setKeyword(e.target.value);
      }}
      onPressEnter={handleSearch}
      onSubmit={handleSearch}
      placeholder={t('search.placeholder')}
      shortKey={'k'}
      spotlight={!mobile}
      type={mobile ? 'block' : 'ghost'}
      value={keyword}
    />
  );
});

export default AgentSearchBar;
