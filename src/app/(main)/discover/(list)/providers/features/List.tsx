'use client';

import { Empty } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import InterceptingLink from '@/components/InterceptingLink';
import { DiscoverProviderItem } from '@/types/discover';

import SearchResultCount from '../../../components/SearchResultCount';
import Title from '../../../components/Title';
import { VirtuosoList } from '../../../components/VirtuosoGridList';
import Card from './Card';

export interface ListProps {
  items?: DiscoverProviderItem[];
  mobile?: boolean;
  searchKeywords?: string;
}

const List = memo<ListProps>(({ searchKeywords, items = [], mobile }) => {
  const { t } = useTranslation('discover');

  if (searchKeywords) {
    if (!items || items?.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <>
        <SearchResultCount count={items.length} keyword={searchKeywords} />
        <VirtuosoList
          data={items}
          initialItemCount={6}
          itemContent={(_, item) => (
            <InterceptingLink
              href={urlJoin('/discover/provider/', item.identifier)}
              key={item.identifier}
            >
              <Card {...item} mobile={mobile} style={{ minHeight: 'unset' }} />
            </InterceptingLink>
          )}
          style={{
            minHeight: '75vh',
          }}
        />
      </>
    );
  }

  return (
    <>
      <Title tag={items.length}>{t('providers.list')}</Title>
      <VirtuosoList
        data={items}
        initialItemCount={6}
        itemContent={(_, item) => (
          <InterceptingLink
            href={urlJoin('/discover/provider/', item.identifier)}
            key={item.identifier}
          >
            <Card {...item} mobile={mobile} style={{ minHeight: 'unset' }} />
          </InterceptingLink>
        )}
        style={{
          minHeight: '75vh',
        }}
      />
    </>
  );
});

export default List;
