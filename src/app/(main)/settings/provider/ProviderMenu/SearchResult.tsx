'use client';

import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

import ProviderItem from './Item';

interface SearchResultProps {
  searchKeyword: string;
}
const SearchResult = memo<SearchResultProps>(({ searchKeyword }) => {
  const { t } = useTranslation('modelProvider');

  // 使用 useMemo 优化过滤性能
  const filteredProviders = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    if (!keyword) return DEFAULT_MODEL_PROVIDER_LIST;

    return DEFAULT_MODEL_PROVIDER_LIST.filter((provider) => {
      return (
        provider.id.toLowerCase().includes(keyword) || provider.name.toLowerCase().includes(keyword)
      );
    });
  }, [searchKeyword]);

  return (
    <Flexbox gap={4} padding={'0 12px'}>
      {searchKeyword && filteredProviders.length === 0 ? (
        <Flexbox align="center" justify="center" padding={16}>
          {t('menu.notFound')}
        </Flexbox>
      ) : (
        filteredProviders.map((item) => <ProviderItem {...item} key={item.id} />)
      )}
    </Flexbox>
  );
});

export default SearchResult;
