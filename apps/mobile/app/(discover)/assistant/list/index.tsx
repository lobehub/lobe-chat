import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FlatList, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'ahooks';
import { AssistantCategory } from '@/types/discover';
import { Search } from 'lucide-react-native';
import { useDiscoverStore } from '@/store/discover';
import AgentCard from './components/AgentCard';
import CategoryTabs from './components/CategoryTabs';
import { CategoryTabsSkeleton, AssistantListSkeleton } from './components/SkeletonList';
import useCategory from './hooks/useCategory';
import { useStyles } from './styles';
import { Header, TextInput } from '@/components';

const INITIAL_PAGE_SIZE = 21;

const AssistantList = () => {
  const { styles, token } = useStyles();
  const { t } = useTranslation(['common', 'discover']);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(AssistantCategory.All);
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
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
        <ActivityIndicator color={token.colorPrimary} size="small" />
      </View>
    );
  }, [hasMoreData, token.colorPrimary]);

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('assistant.fetchError', { ns: 'common' })}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <Header showBack title={t('title', { ns: 'discover' })} />
      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Search color={token.colorTextPlaceholder} size={20} style={styles.searchIcon} />
          <TextInput
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            placeholder={t('assistant.search', { ns: 'common' })}
            returnKeyType="search"
            textAlignVertical="center"
            value={searchText}
          />
        </View>

        {isCategoryLoading ? (
          <CategoryTabsSkeleton />
        ) : (
          <CategoryTabs
            items={categoriesWithStats}
            onSelect={handleCategorySelect}
            selectedKey={selectedCategory}
          />
        )}
      </View>

      {isLoading && currentPage === 1 ? (
        <AssistantListSkeleton />
      ) : (
        <FlatList
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {finalSearchQuery
                  ? t('assistant.noMatch', { ns: 'common' })
                  : t('assistant.noData', { ns: 'common' })}
              </Text>
            </View>
          )}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContainer}
          data={allItems}
          keyExtractor={(item) => item.identifier}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          renderItem={({ item }) => <AgentCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
};

export default AssistantList;
