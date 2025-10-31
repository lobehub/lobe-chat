import { Button, Flexbox, Input, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecentSearches, useRecentSearches } from '@/features/Search';

import SessionSearchList from './components/SessionSearchList';

const SessionSearch = () => {
  const router = useRouter();
  const { t } = useTranslation('chat');
  const [searchText, setSearchText] = useState('');
  const [actualSearchText, setActualSearchText] = useState('');
  const listRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const { recentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches } =
    useRecentSearches('session_recent_searches');

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
  }, [searchText, saveRecentSearch]);

  // 点击最近搜索项
  const handleRecentSearchClick = useCallback(
    (query: string) => {
      setSearchText(query);
      setActualSearchText(query);
      saveRecentSearch(query);
    },
    [saveRecentSearch],
  );

  // 渲染内容
  const content = !searchText.trim() ? (
    <RecentSearches
      emptyDescription={t('session.search.placeholder')}
      onClear={clearRecentSearches}
      onItemClick={handleRecentSearchClick}
      onItemRemove={removeRecentSearch}
      recentSearchesTitle={t('session.search.recentSearches')}
      searches={recentSearches}
    />
  ) : (
    <SessionSearchList ref={listRef} searchText={actualSearchText} />
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
            placeholder={t('session.search.placeholder')}
            value={searchText}
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

export default SessionSearch;
