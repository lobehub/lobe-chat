import { Icon } from '@lobehub/ui';
import { Empty } from 'antd';
import { ServerCrash } from 'lucide-react';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useToolStore } from '@/store/tool';

import SearchLoading from '../../Loading';
import VirtuosoLoading from '../../VirtuosoLoading';
import Item from './Item';

export const List = memo(() => {
  const { t } = useTranslation('plugin');

  const [
    isPluginListInit,
    identifier,
    allItems,
    totalCount,
    currentPage,
    keywords,
    searchLoading,
    useFetchPluginList,
    loadMorePlugins,
    resetPluginList,
  ] = useToolStore((s) => [
    s.isPluginListInit,
    s.activePluginIdentifier,
    s.oldPluginItems,
    s.pluginTotalCount,
    s.currentPluginPage,
    s.pluginSearchKeywords,
    s.pluginSearchLoading,
    s.useFetchPluginList,
    s.loadMorePlugins,
    s.resetPluginList,
  ]);

  // 当 keywords 变化时重置列表
  useEffect(() => {
    resetPluginList(keywords);
  }, [keywords, resetPluginList]);

  const { isLoading, error } = useFetchPluginList({
    page: currentPage,
    pageSize: 20,
    q: keywords,
  });

  if (searchLoading || !isPluginListInit) return <SearchLoading />;

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
      endReached={loadMorePlugins}
      itemContent={(_, item) => (
        <Flexbox
          key={item.identifier}
          onClick={() => {
            useToolStore.setState({ activePluginIdentifier: item.identifier });
          }}
          paddingBlock={2}
          paddingInline={4}
        >
          <Item active={identifier === item.identifier} {...item} />
        </Flexbox>
      )}
      overscan={400}
      style={{ height: '100%', width: '100%' }}
      totalCount={totalCount || 0}
    />
  );
});

export default List;
