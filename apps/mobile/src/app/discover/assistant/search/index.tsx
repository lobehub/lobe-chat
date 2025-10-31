import { Button, Flexbox, Input, PageContainer } from '@lobehub/ui-rn';
import type { FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecentSearches, useRecentSearches } from '@/features/Search';

import SearchResultList from './components/SearchResultList';

const AssistantList = () => {
  const listRef = useRef<FlashListRef<any>>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { t } = useTranslation('common');
  const [searchText, setSearchText] = useState('');
  const [actualSearchText, setActualSearchText] = useState('');
  const insets = useSafeAreaInsets();
  const { recentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches } =
    useRecentSearches('assistant_recent_searches');

  // 从 URL 参数初始化搜索关键词
  useEffect(() => {
    if (params.q) {
      setSearchText(params.q);
      setActualSearchText(params.q);
      saveRecentSearch(params.q);
    }
  }, [params.q, saveRecentSearch]);

  // 处理防抖后的搜索
  const handleSearch = useCallback((text: string) => {
    setActualSearchText(text);
  }, []);

  // 提交搜索（回车时）
  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchText.trim();
    if (trimmed) {
      saveRecentSearch(trimmed);
      setActualSearchText(trimmed);
    }
    listRef?.current?.scrollToTop({ animated: true });
  }, [searchText, saveRecentSearch]);

  // 点击最近搜索项
  const handleRecentSearchClick = useCallback(
    (query: string) => {
      setSearchText(query);
      setActualSearchText(query);
      saveRecentSearch(query);
      listRef?.current?.scrollToTop({ animated: true });
    },
    [saveRecentSearch],
  );

  // 渲染内容
  const content = !searchText.trim() ? (
    <RecentSearches
      emptyDescription={t('assistant.searchPlaceholder')}
      onClear={clearRecentSearches}
      onItemClick={handleRecentSearchClick}
      onItemRemove={removeRecentSearch}
      recentSearchesTitle={t('assistant.recentSearches')}
      searches={recentSearches}
    />
  ) : (
    <SearchResultList ref={listRef} searchText={actualSearchText} />
  );
  return (
    <PageContainer
      extraProps={{
        style: {
          display: 'none',
        },
      }}
      left={
        <Flexbox align="center" flex={1} horizontal justify="space-between" paddingInline={8}>
          <Input.Search
            autoFocus
            debounceWait={500}
            glass
            onChangeText={setSearchText}
            onSearch={handleSearch}
            onSubmitEditing={handleSearchSubmit}
            placeholder={t('assistant.search')}
            style={{
              flex: 1,
            }}
            value={searchText}
          />
          <Button
            onPress={() => router.back()}
            pressEffect={false}
            style={{ paddingRight: 0 }}
            type="link"
          >
            {t('actions.cancel')}
          </Button>
        </Flexbox>
      }
      leftProps={{
        width: 'auto',
      }}
      safeAreaProps={{
        edges: ['top'],
      }}
      showBack
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </KeyboardAwareScrollView>
    </PageContainer>
  );
};

export default AssistantList;
