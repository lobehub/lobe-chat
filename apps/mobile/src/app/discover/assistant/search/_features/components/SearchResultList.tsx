import type { DiscoverAssistantItem } from '@lobechat/types';
import { Center, Empty, useTheme } from '@lobehub/ui-rn';
import type { FlashListRef } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import { forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import AgentCard from '@/features/discover/assistant/components/AgentCard';
import { AssistantListSkeleton } from '@/features/discover/assistant/components/SkeletonList';
import { useDiscoverStore } from '@/store/discover';

const INITIAL_PAGE_SIZE = 21;

interface SearchResultListProps {
  searchText: string;
}

const SearchResultList = memo(
  forwardRef<FlashListRef<any>, SearchResultListProps>(({ searchText }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation('common');

    const [currentPage, setCurrentPage] = useState(1);
    const [allItems, setAllItems] = useState<DiscoverAssistantItem[]>([]);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const queryParams = useMemo(
      () => ({
        page: currentPage,
        pageSize: INITIAL_PAGE_SIZE,
        q: searchText.trim() || undefined,
      }),
      [searchText, currentPage],
    );

    const useAssistantList = useDiscoverStore((s) => s.useAssistantList);
    const { data: agents, error, isLoading } = useAssistantList(queryParams);

    // 搜索关键词变化时重置状态
    useEffect(() => {
      setCurrentPage(1);
      setAllItems([]);
      setHasMoreData(true);
      setIsLoadingMore(false);
    }, [searchText]);

    // 处理新数据
    useEffect(() => {
      if (agents?.items) {
        if (currentPage === 1) {
          setAllItems(agents.items);
        } else {
          setAllItems((prev) => [...prev, ...agents.items]);
        }
        setHasMoreData(agents.items.length === INITIAL_PAGE_SIZE);
        setIsLoadingMore(false);
      }
    }, [agents, currentPage]);

    // 处理加载更多
    const handleLoadMore = useCallback(() => {
      if (!isLoadingMore && hasMoreData && !isLoading) {
        setIsLoadingMore(true);
        setCurrentPage((prev) => prev + 1);
      }
    }, [isLoadingMore, hasMoreData, isLoading]);

    // 渲染底部加载指示器
    const renderFooter = useCallback(() => {
      if (!hasMoreData) return null;

      return (
        <Center padding={16}>
          <ActivityIndicator color={theme.colorTextDescription} size="small" />
        </Center>
      );
    }, [hasMoreData, theme.colorTextDescription]);

    // 空状态
    const renderEmptyComponent = useCallback(
      () => (
        <Empty
          description={searchText.trim() ? t('assistant.searchNoResult') : t('assistant.noData')}
        />
      ),
      [searchText, t],
    );

    // 渲染列表项
    const renderItem = useCallback(
      ({ item }: { item: DiscoverAssistantItem }) => <AgentCard item={item} />,
      [],
    );

    const keyExtractor = useCallback((item: DiscoverAssistantItem) => item.identifier, []);

    // 错误状态
    if (error) {
      return <Empty description={t('assistant.fetchError')} />;
    }

    // 首次加载中
    if (isLoading && currentPage === 1) {
      return <AssistantListSkeleton />;
    }

    // 搜索结果列表
    return (
      <FlashList
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        data={allItems}
        drawDistance={400}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ref={ref}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
  }),
);

SearchResultList.displayName = 'SearchResultList';

export default SearchResultList;
