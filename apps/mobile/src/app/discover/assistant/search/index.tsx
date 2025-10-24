import { DiscoverAssistantItem } from '@lobechat/types';
import {
  Button,
  Center,
  Empty,
  FlashListScrollShadow,
  Flexbox,
  Input,
  PageContainer,
  useTheme,
} from '@lobehub/ui-rn';
import type { FlashListRef } from '@shopify/flash-list';
import { useDebounce } from 'ahooks';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import AgentCard from '@/features/discover/assistant/components/AgentCard';
import { AssistantListSkeleton } from '@/features/discover/assistant/components/SkeletonList';
import { useDiscoverStore } from '@/store/discover';

const INITIAL_PAGE_SIZE = 21;

const AssistantList = () => {
  const listRef = useRef<FlashListRef<any>>(null);
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation(['common', 'discover']);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState<DiscoverAssistantItem[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const debouncedSearchText = useDebounce(searchText, { wait: 500 });

  const finalSearchQuery = useMemo(() => {
    if (searchQuery !== '') return searchQuery;
    if (searchText === '') return '';
    return debouncedSearchText;
  }, [searchQuery, searchText, debouncedSearchText]);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: INITIAL_PAGE_SIZE,
      q: finalSearchQuery || undefined,
    }),
    [finalSearchQuery, currentPage],
  );

  const useAssistantList = useDiscoverStore((s) => s.useAssistantList);
  const { data: agents, error, isLoading } = useAssistantList(queryParams);

  const handleImmediateSearch = useCallback(
    (query?: string) => {
      const searchValue = query !== undefined ? query : searchText;
      setSearchQuery(searchValue);
      setTimeout(() => setSearchQuery(''), 100);
      listRef?.current?.scrollToTop({ animated: true });
    },
    [searchText],
  );

  const handleSearchSubmit = useCallback(() => {
    handleImmediateSearch();
  }, [handleImmediateSearch]);

  useEffect(() => {
    setCurrentPage(1);
    setAllItems([]);
    setHasMoreData(true);
    setIsLoadingMore(false);
  }, [finalSearchQuery]);

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
    () => (
      <Empty
        description={
          finalSearchQuery
            ? t('assistant.noMatch', { ns: 'common' })
            : t('assistant.noData', { ns: 'common' })
        }
      />
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
      <PageContainer>
        <Empty description={t('assistant.fetchError', { ns: 'common' })} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      extraProps={{
        style: {
          display: 'none',
        },
      }}
      left={
        <Flexbox align={'center'} flex={1} horizontal justify={'space-between'} paddingInline={8}>
          <Input.Search
            autoFocus
            glass
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            placeholder={t('assistant.search', { ns: 'common' })}
            style={{
              flex: 1,
            }}
            variant="filled"
          />
          <Button clickable={false} onPress={() => router.back()} type={'link'}>
            {t('actions.cancel', { ns: 'common' })}
          </Button>
        </Flexbox>
      }
      leftProps={{
        width: 'auto',
      }}
      showBack
    >
      <Flexbox height={16} />
      {isLoading && currentPage === 1 ? (
        <AssistantListSkeleton />
      ) : (
        <FlashListScrollShadow
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
          data={allItems}
          estimatedItemSize={20}
          hideScrollBar
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ref={listRef}
          renderItem={renderItem}
          size={3}
        />
      )}
    </PageContainer>
  );
};

export default AssistantList;
