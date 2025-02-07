'use client';

import { Grid } from '@lobehub/ui';
import { Empty } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { DiscoverPlugintem } from '@/types/discover';

import SearchResultCount from '../../../components/SearchResultCount';
import Title from '../../../components/Title';
import VirtuosoGridList from '../../../components/VirtuosoGridList';
import Card from './Card';

export interface ListProps {
  category?: string;
  items: DiscoverPlugintem[];
  mobile?: boolean;
  searchKeywords?: string;
}

const List = memo<ListProps>(({ category, mobile, searchKeywords, items = [] }) => {
  const { t } = useTranslation('discover');
  const recentLength = mobile ? 4 : 8;
  const { all, recent, last } = useMemo(() => {
    return {
      all: items,
      last: items.slice(recentLength),
      recent: items.slice(0, recentLength),
    };
  }, [items, mobile]);

  if (searchKeywords) {
    if (!items || items?.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <>
        <SearchResultCount count={all.length} keyword={searchKeywords} />
        <VirtuosoGridList
          data={all}
          initialItemCount={24}
          itemContent={(_, item) => (
            <Card
              showCategory
              variant={'compact'}
              {...item}
              href={urlJoin('/discover/plugin/', item.identifier)}
              key={item.identifier}
            />
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
      <Title>{t('plugins.recentSubmits')}</Title>
      <Grid maxItemWidth={280} rows={4}>
        {recent.map((item) => (
          <Card
            showCategory={!category}
            {...item}
            href={urlJoin('/discover/plugin/', item.identifier)}
            key={item.identifier}
          />
        ))}
      </Grid>
      {last && last?.length > 0 && (
        <>
          <Title tag={last.length}>{t('plugins.list')}</Title>
          <VirtuosoGridList
            data={last}
            initialItemCount={12}
            itemContent={(_, item) => (
              <Card
                showCategory={!category}
                variant={'compact'}
                {...item}
                href={urlJoin('/discover/plugin/', item.identifier)}
                key={item.identifier}
              />
            )}
            style={{
              minHeight: '75vh',
            }}
          />
        </>
      )}
    </>
  );
});

export default List;
