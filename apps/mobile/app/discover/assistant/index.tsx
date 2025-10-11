import { AssistantCategory, DiscoverAssistantItem } from '@lobechat/types';
import { CapsuleTabs, Input, PageContainer } from '@lobehub/ui-rn';
import { useDebounce } from 'ahooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AgentCard from '@/features/discover/assistant/components/AgentCard';
import {
  AssistantListSkeleton,
  CategoryTabsSkeleton,
} from '@/features/discover/assistant/components/SkeletonList';
import useCategory from '@/features/discover/assistant/hooks/useCategory';
import { useDiscoverStore } from '@/store/discover';

import { useStyles } from './styles';

const INITIAL_PAGE_SIZE = 21;

const AssistantList = () => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation(['common', 'discover']);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(AssistantCategory.All);
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState<DiscoverAssistantItem[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const categories = useCategory();

  const debouncedSearchText = useDebounce(searchText, { wait: 500 });

  const finalSearchQuery = useMemo(() => {
    if (searchQuery !== '') return searchQuery;
    if (searchText === '') return '';
    return debouncedSearchText;
  }, [searchQuery, searchText, debouncedSearchText]);

  const useAssistantCategories = useDiscoverStore((s) => s.useAssistantCategories);
  const { data: categoryStats = [], isLoading: isCategoryLoading } = useAssistantCategories({
    q: finalSearchQuery,
  });

  const categoriesWithStats = useMemo(() => {
    const total = categoryStats.reduce((acc, item) => acc + item.count, 0);

    return categories.map((category) => {
      const itemData = categoryStats.find((stat) => stat.category === category.key);
      return {
        ...category,
        count: category.key === AssistantCategory.All ? total : itemData?.count || 0,
      };
    });
  }, [categories, categoryStats]);

  const queryParams = useMemo(
    () => ({
      category: selectedCategory === AssistantCategory.All ? undefined : selectedCategory,
      page: currentPage,
      pageSize: INITIAL_PAGE_SIZE,
      q: finalSearchQuery || undefined,
    }),
    [finalSearchQuery, selectedCategory, currentPage],
  );

  const useAssistantList = useDiscoverStore((s) => s.useAssistantList);
  const { data: agents, error, isLoading } = useAssistantList(queryParams);

  const handleImmediateSearch = useCallback(
    (query?: string) => {
      const searchValue = query !== undefined ? query : searchText;
      setSearchQuery(searchValue);
      setTimeout(() => setSearchQuery(''), 100);
    },
    [searchText],
  );

  const handleSearchSubmit = useCallback(() => {
    handleImmediateSearch();
  }, [handleImmediateSearch]);

  const handleCategorySelect = useCallback((key: string) => {
    setSelectedCategory(key);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setAllItems([]);
    setHasMoreData(true);
    setIsLoadingMore(false);
  }, [finalSearchQuery, selectedCategory]);

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
      <View style={{ alignItems: 'center', padding: 20 }}>
        <ActivityIndicator color={theme.colorPrimary} size="small" />
      </View>
    );
  }, [hasMoreData, theme.colorPrimary]);

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {finalSearchQuery
            ? t('assistant.noMatch', { ns: 'common' })
            : t('assistant.noData', { ns: 'common' })}
        </Text>
      </View>
    ),
    [finalSearchQuery],
  );

  const renderItem = useCallback(
    ({ item }: { item: DiscoverAssistantItem }) => <AgentCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: DiscoverAssistantItem) => item.identifier, []);

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('assistant.fetchError', { ns: 'common' })}</Text>
      </SafeAreaView>
    );
  }

  return (
    <PageContainer showBack title={t('title', { ns: 'discover' })}>
      <View style={styles.filterContainer}>
        <Input.Search
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          placeholder={t('assistant.search', { ns: 'common' })}
          size="large"
          style={styles.searchContainer}
          variant="filled"
        />

        {isCategoryLoading ? (
          <CategoryTabsSkeleton />
        ) : (
          <CapsuleTabs
            items={categoriesWithStats}
            onSelect={handleCategorySelect}
            selectedKey={selectedCategory}
            size="large"
          />
        )}
      </View>

      {isLoading && currentPage === 1 ? (
        <AssistantListSkeleton />
      ) : (
        <FlatList
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContainer}
          data={allItems}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          renderItem={renderItem}
        />
      )}
    </PageContainer>
  );
};

export default AssistantList;
