import { Button, Flexbox, Input, PageContainer } from '@lobehub/ui-rn';
import type { FlashListRef } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RecentSearches, useRecentSearches } from '@/features/Search';

import TopicSearchList from './components/TopicSearchList';

const TopicSearch = () => {
  const listRef = useRef<FlashListRef<any>>(null);
  const router = useRouter();
  const { t } = useTranslation('topic');
  const [searchText, setSearchText] = useState('');
  const [actualSearchText, setActualSearchText] = useState('');

  const { recentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches } =
    useRecentSearches('topic_recent_searches');

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
      emptyDescription={t('search.placeholder')}
      onClear={clearRecentSearches}
      onItemClick={handleRecentSearchClick}
      onItemRemove={removeRecentSearch}
      recentSearchesTitle={t('search.recentSearches')}
      searches={recentSearches}
    />
  ) : (
    <TopicSearchList ref={listRef} searchText={actualSearchText} />
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
            placeholder={t('search.placeholder')}
            style={{
              flex: 1,
            }}
            value={searchText}
            variant="filled"
          />
          <Button
            onPress={() => router.back()}
            pressEffect={false}
            style={{ paddingRight: 0 }}
            type="link"
          >
            {t('actions.cancel', { ns: 'common' })}
          </Button>
        </Flexbox>
      }
      leftProps={{
        width: 'auto',
      }}
      showBack
    >
      {content}
    </PageContainer>
  );
};

export default TopicSearch;
