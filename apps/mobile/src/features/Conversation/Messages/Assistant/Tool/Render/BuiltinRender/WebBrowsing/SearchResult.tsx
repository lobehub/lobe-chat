import { UniformSearchResponse } from '@lobechat/types';
import { Flexbox, ScrollShadow, Text } from '@lobehub/ui-rn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import SearchResultItem from './SearchResultItem';

export interface SearchResultProps {
  searchResponse?: UniformSearchResponse;
}

/**
 * SearchResult - 搜索结果列表
 * 参考 Markdown Footnotes SearchResultCards 实现
 */
const SearchResult = memo<SearchResultProps>(({ searchResponse }) => {
  const { t } = useTranslation('tool');
  const searchResults = searchResponse?.results || [];

  if (searchResults.length === 0) {
    return (
      <Flexbox align="center" padding={8}>
        <Text type="secondary">{t('search.emptyResult', '暂无搜索结果')}</Text>
      </Flexbox>
    );
  }

  return (
    <ScrollShadow hideScrollBar horizontal orientation="horizontal" size={10}>
      <Flexbox gap={6} horizontal>
        {searchResults.slice(0, 5).map((result) => (
          <SearchResultItem key={result.url} {...result} />
        ))}
      </Flexbox>
    </ScrollShadow>
  );
});

SearchResult.displayName = 'SearchResult';

export default SearchResult;
