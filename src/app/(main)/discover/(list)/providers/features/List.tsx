'use client';

import { Empty } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import Title from '@/app/(main)/discover/(list)/features/Title';
import VirtuosoGridList from '@/app/(main)/discover/components/VirtuosoGridList';
import { DiscoverProviderItem } from '@/types/discover';

import SearchResultCount from '../../components/SearchResultCount';
import Card from './Card';

export interface ListProps {
  items?: DiscoverProviderItem[];
  mobile?: boolean;
  searchKeywords?: string;
}

const List = memo<ListProps>(({ searchKeywords, items = [] }) => {
  const { t } = useTranslation('discover');

  if (searchKeywords) {
    if (!items || items?.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <>
        <SearchResultCount count={items.length} keyword={searchKeywords} />
        <VirtuosoGridList
          data={items}
          itemContent={(_, item) => (
            <Link href={urlJoin('/discover/provider/', item.identifier)} key={item.identifier}>
              <Card {...item} style={{ minHeight: 'unset' }} />
            </Link>
          )}
          style={{
            height: '100%',
            minHeight: '100vh',
          }}
        />
      </>
    );
  }

  return (
    <>
      <Title>{t('providers.list')}</Title>
      <VirtuosoGridList
        data={items}
        itemContent={(_, item) => (
          <Link href={urlJoin('/discover/provider/', item.identifier)} key={item.identifier}>
            <Card {...item} style={{ minHeight: 'unset' }} />
          </Link>
        )}
        style={{
          height: '100%',
          minHeight: '100vh',
        }}
      />
    </>
  );
});

export default List;
