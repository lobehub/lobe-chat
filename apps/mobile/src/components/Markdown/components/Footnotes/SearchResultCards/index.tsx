import { memo } from 'react';

import Flexbox from '@/components/Flexbox';
import ScrollShadow from '@/components/ScrollShadow';

import SearchResultCard from './SearchResultCard';

export interface SearchResultItem {
  alt?: string;
  summary?: string;
  title?: string;
  url: string;
}

export interface SearchResultCardsProps {
  dataSource: string[] | SearchResultItem[];
}

const SearchResultCards = memo<SearchResultCardsProps>(({ dataSource }) => {
  return (
    <ScrollShadow hideScrollBar horizontal orientation={'horizontal'} size={10}>
      <Flexbox gap={6} horizontal>
        {dataSource.map((link) =>
          typeof link === 'string' ? (
            <SearchResultCard key={link} url={link} />
          ) : (
            <SearchResultCard key={link.url} {...link} />
          ),
        )}
      </Flexbox>
    </ScrollShadow>
  );
});

SearchResultCards.displayName = 'SearchResultCards';

export default SearchResultCards;
