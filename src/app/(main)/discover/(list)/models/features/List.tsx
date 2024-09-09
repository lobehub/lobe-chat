'use client';

import { Empty } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import Title from '@/app/(main)/discover/(list)/features/Title';
import { DiscoverModelItem } from '@/types/discover';

import VirtuosoGridList from '../../../components/VirtuosoGridList';
import SearchResultCount from '../../components/SearchResultCount';
import Card from './Card';

export interface ListProps {
  category?: string;
  items?: DiscoverModelItem[];
  mobile?: boolean;
  searchKeywords?: string;
}

const List = memo<ListProps>(({ category, searchKeywords, items = [] }) => {
  const { t } = useTranslation('discover');

  if (searchKeywords) {
    if (!items || items?.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <>
        <SearchResultCount count={items.length} keyword={searchKeywords} />
        <VirtuosoGridList
          data={items}
          itemContent={(_, item) => (
            <Link href={urlJoin('/discover/model/', item.identifier)} key={item.identifier}>
              <Card showCategory {...item} />
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
      <Title>{t('models.list')}</Title>
      <VirtuosoGridList
        data={items}
        itemContent={(_, item) => (
          <Link href={urlJoin('/discover/model/', item.identifier)} key={item.identifier}>
            <Card showCategory={!category} {...item} />
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
