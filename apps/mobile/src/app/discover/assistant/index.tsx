import { AssistantCategory, DiscoverAssistantItem } from '@lobechat/types';
import { ActionIcon, CapsuleTabs, Center, Empty, PageContainer, useTheme } from '@lobehub/ui-rn';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import AgentCard from '@/features/discover/assistant/components/AgentCard';
import { AssistantListSkeleton } from '@/features/discover/assistant/components/SkeletonList';
import useCategory from '@/features/discover/assistant/hooks/useCategory';
import { useDiscoverStore } from '@/store/discover';

const INITIAL_PAGE_SIZE = 21;

const AssistantList = () => {
  const listRef = useRef<FlashListRef<any>>(null);
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation(['common', 'discover']);

  const [selectedCategory, setSelectedCategory] = useState<string>(AssistantCategory.All);
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState<DiscoverAssistantItem[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const categories = useCategory();

  const useAssistantCategories = useDiscoverStore((s) => s.useAssistantCategories);
  const { isLoading: isCategoryLoading } = useAssistantCategories({});

  const queryParams = useMemo(
    () => ({
      category: selectedCategory === AssistantCategory.All ? undefined : selectedCategory,
      page: currentPage,
      pageSize: INITIAL_PAGE_SIZE,
    }),
    [selectedCategory, currentPage],
  );

  const useAssistantList = useDiscoverStore((s) => s.useAssistantList);
  const { data: agents, error, isLoading } = useAssistantList(queryParams);

  const handleCategorySelect = useCallback((key: string) => {
    setSelectedCategory(key);
    listRef?.current?.scrollToTop({ animated: true });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setAllItems([]);
    setHasMoreData(true);
    setIsLoadingMore(false);
  }, [selectedCategory]);

  // 处理新数据
  useEffect(() => {
    if (agents?.items) {
      if (currentPage === 1) {
        // 重置数据
        setAllItems(agents.items);
      } else {
        // 追加数据
        setAllItems((prev) => [...prev, ...agents.items]);
      }
      // 检查是否还有更多数据
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
  }, [hasMoreData, theme.colorPrimary]);

  const renderEmptyComponent = useCallback(
    () => <Empty description={t('assistant.noData', { ns: 'common' })} />,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: DiscoverAssistantItem }) => <AgentCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: DiscoverAssistantItem) => item.identifier, []);

  let content;

  if (error) {
    content = <Empty description={t('assistant.fetchError', { ns: 'common' })} />;
  } else if (isLoading && currentPage === 1) {
    content = <AssistantListSkeleton />;
  } else {
    content = (
      <FlashList
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        data={allItems}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ref={listRef}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <PageContainer
      extra={
        <ActionIcon
          clickable={false}
          icon={SearchIcon}
          onPress={() => router.push('/discover/assistant/search')}
        />
      }
      extraProps={{
        width: 40,
      }}
      leftProps={{
        width: 40,
      }}
      showBack
      title={
        isCategoryLoading ? (
          t('title', { ns: 'discover' })
        ) : (
          <CapsuleTabs
            items={categories}
            onSelect={handleCategorySelect}
            selectedKey={selectedCategory}
            size="large"
          />
        )
      }
    >
      {content}
    </PageContainer>
  );
};

export default AssistantList;
