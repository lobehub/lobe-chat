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

interface ListProps {
  setIdentifier: (identifier?: string) => void;
}

export const List = memo<ListProps>(({ setIdentifier }) => {
  const { t } = useTranslation('plugin');

  const [
    isMcpListInit,
    identifier,
    allItems,
    totalCount,
    currentPage,
    keywords,
    searchLoading,
    useFetchMCPPluginList,
    loadMoreMCPPlugins,
    resetMCPPluginList,
  ] = useToolStore((s) => [
    s.isMcpListInit,
    s.activeMCPIdentifier,
    s.mcpPluginItems,
    s.totalCount,
    s.currentPage,
    s.mcpSearchKeywords,
    s.searchLoading,
    s.useFetchMCPPluginList,
    s.loadMoreMCPPlugins,
    s.resetMCPPluginList,
  ]);

  // 当 keywords 变化时重置列表
  useEffect(() => {
    resetMCPPluginList(keywords);
  }, [keywords, resetMCPPluginList]);

  const { isLoading, error } = useFetchMCPPluginList({
    page: currentPage,
    pageSize: 20,
    q: keywords,
  });

  if (searchLoading || !isMcpListInit) return <SearchLoading />;

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
      endReached={loadMoreMCPPlugins}
      itemContent={(_, item) => {
        return (
          <Flexbox key={item.identifier} paddingBlock={2} paddingInline={4}>
            <Item active={identifier === item.identifier} {...item} setIdentifier={setIdentifier} />
          </Flexbox>
        );
      }}
      overscan={400}
      style={{ height: '100%', width: '100%' }}
      totalCount={totalCount || 0}
    />
  );
});

export default List;
