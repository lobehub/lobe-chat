import { Icon } from '@lobehub/ui';
import { Empty } from 'antd';
import { uniqBy } from 'lodash-es';
import { ServerCrash } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useToolStore } from '@/store/tool';
import { DiscoverMcpItem } from '@/types/discover';

import VirtuosoLoading from '../../VirtuosoLoading';
import Item from './Item';

interface ListProps {
  keywords?: string;
  setIdentifier: (identifier?: string) => void;
}

export const List = memo<ListProps>(({ keywords, setIdentifier }) => {
  const { t } = useTranslation('plugin');
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<DiscoverMcpItem[]>([]);
  const pageSize = 20;

  const [identifier, useFetchMCPPluginList] = useToolStore((s) => [
    s.activeMCPIdentifier,
    s.useFetchMCPPluginList,
  ]);

  const { data, isLoading, error } = useFetchMCPPluginList({ page, pageSize, q: keywords });

  useEffect(() => {
    setAllItems([]);
    setPage(1);
  }, [keywords]);

  // 当新数据加载完成时，更新累积列表
  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        setAllItems(uniqBy(data.items, 'identifier'));
      } else {
        setAllItems((prev) => uniqBy([...prev, ...data.items], 'identifier'));
      }
    }
  }, [data?.items, page]);

  const loadMore = useCallback(() => {
    if (data && allItems.length < data.totalCount) setPage((prev) => prev + 1);
  }, [data, allItems.length]);

  if (error)
    return (
      <Center gap={12} padding={40}>
        <Icon icon={ServerCrash} size={80} />
        {t('store.networkError')}
      </Center>
    );

  const isEmpty = allItems.length === 0;

  if (isEmpty)
    return (
      <Center paddingBlock={40}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Virtuoso
      components={{
        Footer: isLoading ? VirtuosoLoading : undefined,
      }}
      data={allItems}
      endReached={loadMore}
      itemContent={(_, item) => {
        return (
          <Flexbox key={item.identifier} paddingBlock={2} paddingInline={4}>
            <Item active={identifier === item.identifier} {...item} setIdentifier={setIdentifier} />
          </Flexbox>
        );
      }}
      overscan={400}
      style={{ height: '100%', width: '100%' }}
      totalCount={data?.totalCount || 0}
    />
  );
});

export default List;
